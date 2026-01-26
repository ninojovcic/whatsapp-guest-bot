import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs"; // Stripe webhook treba Node runtime (ne Edge)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // apiVersion: "2024-06-20",
});

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

// ✅ map plan -> limit
function planToLimit(plan: string) {
  const p = (plan || "free").toLowerCase();
  if (p === "business") return 20000; // "custom" default (možeš promijeniti)
  if (p === "pro") return 5000;
  if (p === "starter") return 1000;
  return 100; // free
}

export async function POST(req: Request) {
  try {
    const secretKey = requireEnv("STRIPE_SECRET_KEY");
    const webhookSecret = requireEnv("STRIPE_WEBHOOK_SECRET");

    const stripeClient = new Stripe(secretKey);

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripeClient.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verify failed:", err?.message || err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = (session.metadata?.supabase_user_id as string | undefined) || null;
      const plan = (session.metadata?.plan as string | undefined) || "pro";

      if (userId) {
        const monthly_limit = planToLimit(plan);

        const { error } = await supabaseAdmin
          .from("billing_profiles")
          .upsert(
            {
              user_id: userId,
              plan,
              monthly_limit,
              stripe_customer_id:
                typeof session.customer === "string" ? session.customer : null,
              stripe_subscription_id:
                typeof session.subscription === "string" ? session.subscription : null,
            },
            { onConflict: "user_id" }
          );

        if (error) console.error("Supabase billing_profiles upsert error:", error);
      } else {
        console.warn("No supabase_user_id in session.metadata");
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.created"
    ) {
      const sub = event.data.object as Stripe.Subscription;

      const userId = (sub.metadata?.supabase_user_id as string | undefined) || null;
      const plan = (sub.metadata?.plan as string | undefined) || "pro";

      if (userId) {
        const monthly_limit = planToLimit(plan);

        const { error } = await supabaseAdmin
          .from("billing_profiles")
          .upsert(
            {
              user_id: userId,
              plan,
              monthly_limit,
              stripe_customer_id: typeof sub.customer === "string" ? sub.customer : null,
              stripe_subscription_id: sub.id,
            },
            { onConflict: "user_id" }
          );

        if (error) console.error("Supabase billing_profiles upsert error:", error);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const userId = (sub.metadata?.supabase_user_id as string | undefined) || null;

      if (userId) {
        const { error } = await supabaseAdmin
          .from("billing_profiles")
          .update({ plan: "free", monthly_limit: 100, stripe_subscription_id: null })
          .eq("user_id", userId);

        if (error) console.error("Supabase billing_profiles downgrade error:", error);
      }
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error("Stripe webhook error:", e?.message || e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}