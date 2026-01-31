// app/[locale]/auth/oauth/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALLOWED_PROVIDERS = new Set(["google"]);

function getOrigin(req: NextRequest) {
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (req.nextUrl.protocol.replace(":", "") || "https");
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  return `${proto}://${host}`;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ locale: string }> }
): Promise<Response> {
  const { locale } = await context.params;

  const provider = (req.nextUrl.searchParams.get("provider") || "").toLowerCase();
  if (!ALLOWED_PROVIDERS.has(provider)) {
    return NextResponse.json(
      { error: "Unsupported provider. Use ?provider=google" },
      { status: 400 }
    );
  }

  const next = req.nextUrl.searchParams.get("next") || `/${locale}/app`;
  const debug = req.nextUrl.searchParams.get("debug") === "1";

  const origin = getOrigin(req);

  // ✅ callback je u /[locale]/auth/callback
  // ✅ prenesi debug=1 do callbacka ako je traženo
  const redirectTo =
    `${origin}/${locale}/auth/callback` +
    `?next=${encodeURIComponent(next)}` +
    (debug ? `&debug=1` : "");

  const supabase = await createSupabaseServer();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  // Ako želiš odmah vidjeti JSON bez odlaska na Google (sanity check)
  if (debug) {
    return NextResponse.json({
      step: "oauth_start",
      origin,
      redirectTo,
      oauthUrl: data?.url || null,
      next,
      locale,
      ok: !!data?.url && !error,
      error: error?.message || null,
    });
  }

  if (error || !data?.url) {
    return NextResponse.json(
      { error: error?.message || "Failed to start OAuth" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.url);
}
