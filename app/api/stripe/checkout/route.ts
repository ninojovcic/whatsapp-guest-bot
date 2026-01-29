import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ensureBillingProfile } from "@/lib/usage";

type Plan = "starter" | "pro" | "business";

function getLocaleFromReferer(referer: string | null) {
  if (!referer) return "hr";
  try {
    const url = new URL(referer);
    const seg = url.pathname.split("/").filter(Boolean)[0];
    if (seg === "hr" || seg === "en") return seg;
    return "hr";
  } catch {
    return "hr";
  }
}

function parsePlan(input: unknown): Plan {
  const p = String(input || "pro").toLowerCase();
  if (p === "starter") return "starter";
  if (p === "business") return "business";
  return "pro";
}

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SITE_URL" },
        { status: 500 }
      );
    }

    const supabase = await createSupabaseServer();
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const plan = parsePlan(body?.plan);

    // locale: prvo body.locale, pa referer, fallback hr
    const bodyLocale = String(body?.locale || "").toLowerCase();
    const locale =
      bodyLocale === "hr" || bodyLocale === "en"
        ? bodyLocale
        : getLocaleFromReferer(req.headers.get("referer"));

    const priceId =
      plan === "business"
        ? process.env.STRIPE_PRICE_BUSINESS
        : plan === "starter"
          ? process.env.STRIPE_PRICE_STARTER
          : process.env.STRIPE_PRICE_PRO;

    if (!priceId) {
      const envName =
        plan === "business"
          ? "STRIPE_PRICE_BUSINESS"
          : plan === "starter"
            ? "STRIPE_PRICE_STARTER"
            : "STRIPE_PRICE_PRO";

      return NextResponse.json(
        { error: `Missing Stripe price env var: ${envName}` },
        { status: 500 }
      );
    }

    // ✅ ensure profile exists (ali bez free limita – to je sad u usage.ts)
    const profile = await ensureBillingProfile(supabaseAdmin as any, user.id);

    const now = new Date();
    const trialActive =
      !!profile.current_period_end &&
      new Date(profile.current_period_end).getTime() > now.getTime();

    const subActive = !!profile.stripe_subscription_id;

    // ✅ zaštita: ne radimo novi checkout ako već ima aktivan trial/pretplatu
    if (trialActive || subActive) {
      return NextResponse.json(
        {
          error:
            locale === "hr"
              ? "Već imaš aktivan trial ili pretplatu."
              : "You already have an active trial or subscription.",
        },
        { status: 409 }
      );
    }

    let stripeCustomerId = (profile as any)?.stripe_customer_id as string | null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { supabase_user_id: user.id },
      });

      stripeCustomerId = customer.id;

      await supabaseAdmin
        .from("billing_profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("user_id", user.id);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // ✅ Trial: 14 dana
    // NOTE: "trial bez kartice" ovisi o Stripe postavkama; ovo je najbolja praksa u Checkoutu.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,

      // ✅ vrati usera na ispravan locale
      success_url: `${siteUrl}/${locale}/billing?success=1`,
      cancel_url: `${siteUrl}/${locale}/billing?canceled=1`,

      metadata: { supabase_user_id: user.id, plan },
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan },
        trial_period_days: 14,
      },

      // Ako Stripe account podržava:
      payment_method_collection: "if_required",
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
