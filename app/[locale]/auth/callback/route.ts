import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

  const origin = getOrigin(req);

  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") || `/${locale}/app`;

  console.log("[OAUTH_CALLBACK_HIT]", {
    locale,
    origin,
    next,
    hasCode: !!code,
    url: req.nextUrl.toString(),
  });

  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=oauth_no_code`, origin), {
      status: 303,
    });
  }

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  console.log("[OAUTH_EXCHANGE]", {
    ok: !error,
    error: error?.message || null,
    hasSession: !!data?.session,
    hasUser: !!data?.user,
    userId: data?.user?.id || null,
    email: data?.user?.email || null,
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/${locale}/login?error=oauth_exchange_failed`, origin),
      { status: 303 }
    );
  }

  // ✅ redirect na isti origin koji je user koristio (www/non-www)
  return NextResponse.redirect(new URL(next, origin), { status: 303 });
}
