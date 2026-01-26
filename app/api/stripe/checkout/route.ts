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
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));

    const planRaw = String(body?.plan || "pro").toLowerCase();
    const plan: Plan =
      planRaw === "starter" || planRaw === "business" ? planRaw : "pro";

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

    const profile = await ensureBillingProfile(supabaseAdmin as any, user.id);
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
    // Napomena: hoće li Stripe tražiti karticu ovisi o Stripe postavkama / payment methods.
    // Ovo je "najbliže" modelu "trial bez kartice" kroz Checkout.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,

      // ✅ bitno: vrati usera na ispravan locale
      success_url: `${siteUrl}/${locale}/billing?success=1`,
      cancel_url: `${siteUrl}/${locale}/billing?canceled=1`,

      metadata: { supabase_user_id: user.id, plan },
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan },
        trial_period_days: 14,
      },

      // Stripe feature (ako je dostupno na accountu):
      // tijekom trial-a može smanjiti potrebu za payment methodom (ovisno o postavkama).
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