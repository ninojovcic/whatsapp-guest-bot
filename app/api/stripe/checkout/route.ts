import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ensureBillingProfile } from "@/lib/usage";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_SITE_URL" }, { status: 500 });
    }

    const supabase = await createSupabaseServer();
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const plan = String(body?.plan || "pro").toLowerCase();

    const priceId =
      plan === "business"
        ? process.env.STRIPE_PRICE_BUSINESS
        : process.env.STRIPE_PRICE_PRO;

    if (!priceId) {
      return NextResponse.json(
        { error: `Missing Stripe price env var for plan: ${plan}` },
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

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${siteUrl}/hr/billing?success=1`,
      cancel_url: `${siteUrl}/hr/billing?canceled=1`,
      metadata: { supabase_user_id: user.id, plan },
      subscription_data: { metadata: { supabase_user_id: user.id, plan } },
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