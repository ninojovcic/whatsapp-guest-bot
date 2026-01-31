import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

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

function toISOFromUnix(sec?: number | null) {
  if (!sec || typeof sec !== "number") return null;
  try {
    return new Date(sec * 1000).toISOString();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const url = new URL(req.url);

    const localeParam = (url.searchParams.get("locale") || "").toLowerCase();
    const locale =
      localeParam === "hr" || localeParam === "en"
        ? localeParam
        : getLocaleFromReferer(req.headers.get("referer"));

    const supabase = await createSupabaseServer();
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;

    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/login`, url.origin), { status: 303 });
    }

    const { data: profile, error: profErr } = await supabaseAdmin
      .from("billing_profiles")
      .select("stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profErr) {
      console.error("billing_profiles fetch error:", profErr);
      return NextResponse.redirect(new URL(`/${locale}/billing?cancel_error=1`, url.origin), {
        status: 303,
      });
    }

    const subId = profile?.stripe_subscription_id || null;
    if (!subId) {
      return NextResponse.redirect(new URL(`/${locale}/billing?cancel_none=1`, url.origin), {
        status: 303,
      });
    }

    // ✅ Bez apiVersion (fix za Stripe TS literal error)
    const stripe = new Stripe(secretKey);

    // ✅ Otkaz na kraju perioda (radi i za trial i za active)
    const updated = await stripe.subscriptions.update(subId, {
      cancel_at_period_end: true,
    });

    // best-effort: UI može osvježiti stanje prije webhooka
    try {
      const status = String((updated as any)?.status ?? "");
      const cpeUnix = (updated as any)?.current_period_end as number | undefined;
      const current_period_end = toISOFromUnix(typeof cpeUnix === "number" ? cpeUnix : null);

      await supabaseAdmin
        .from("billing_profiles")
        .update({
          stripe_status: status || null,
          current_period_end,
        })
        .eq("user_id", user.id);
    } catch (e) {
      console.error("billing_profiles update after cancel error:", e);
    }

    return NextResponse.redirect(
      new URL(`/${locale}/billing?cancel_requested=1`, url.origin),
      { status: 303 }
    );
  } catch (e) {
    console.error("Stripe cancel error:", e);
    const url = new URL(req.url);
    const locale = getLocaleFromReferer(req.headers.get("referer"));
    return NextResponse.redirect(new URL(`/${locale}/billing?cancel_error=1`, url.origin), {
      status: 303,
    });
  }
}
