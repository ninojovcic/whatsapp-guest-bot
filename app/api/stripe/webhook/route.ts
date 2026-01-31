import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs"; // Stripe webhook treba Node runtime (ne Edge)

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

// ✅ map plan -> limit (FREE = 0, jer želimo da trial/sub bude jedini način korištenja)
function planToLimit(plan: string) {
  const p = (plan || "").toLowerCase();
  if (p === "business") return 20000; // "custom" default
  if (p === "pro") return 5000;
  if (p === "starter") return 1000;
  return 0; // ✅ no free messages
}

function unixToISO(sec?: number | null) {
  if (!sec) return null;
  try {
    return new Date(sec * 1000).toISOString();
  } catch {
    return null;
  }
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

    // ----------------------------
    // 1) Checkout completed (best effort)
    // ----------------------------
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId =
        (session.metadata?.supabase_user_id as string | undefined) || null;
      const plan = (session.metadata?.plan as string | undefined) || "pro";

      if (userId) {
        const { error } = await supabaseAdmin
          .from("billing_profiles")
          .upsert(
            {
              user_id: userId,
              plan, // best-effort (subscription event je source of truth)
              monthly_limit: planToLimit(plan),

              stripe_customer_id:
                typeof session.customer === "string" ? session.customer : null,
              stripe_subscription_id:
                typeof session.subscription === "string" ? session.subscription : null,
            },
            { onConflict: "user_id" }
          );

        if (error) {
          console.error("billing_profiles upsert (checkout) error:", error);
        }
      }
    }

    // ----------------------------
    // 2) Subscription created/updated (source of truth)
    // ----------------------------
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const sub = event.data.object as Stripe.Subscription;

      const userId = (sub.metadata?.supabase_user_id as string | undefined) || null;
      const plan = (sub.metadata?.plan as string | undefined) || "pro";

      if (userId) {
        const monthly_limit = planToLimit(plan);

        const current_period_end = unixToISO(
          typeof (sub as any).current_period_end === "number"
            ? (sub as any).current_period_end
            : null
      );
        const stripe_status = sub.status;

        const { error } = await supabaseAdmin
          .from("billing_profiles")
          .upsert(
            {
              user_id: userId,
              plan,
              monthly_limit,
              stripe_customer_id: typeof sub.customer === "string" ? sub.customer : null,
              stripe_subscription_id: sub.id,
              stripe_status,
              current_period_end,
            },
            { onConflict: "user_id" }
          );

        if (error) console.error("billing_profiles upsert (sub) error:", error);
      } else {
        console.warn("No supabase_user_id in subscription.metadata", { subId: sub.id });
      }
    }

    // ----------------------------
    // 3) Subscription deleted -> back to inactive/free (0 messages)
    // ----------------------------
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const userId = (sub.metadata?.supabase_user_id as string | undefined) || null;

      if (userId) {
        const { error } = await supabaseAdmin
          .from("billing_profiles")
          .update({
            plan: "free",
            monthly_limit: 0, // ✅ no free messages
            stripe_status: "canceled",
            stripe_subscription_id: null,
            current_period_end: null,
          })
          .eq("user_id", userId);

        if (error) console.error("billing_profiles downgrade error:", error);
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
