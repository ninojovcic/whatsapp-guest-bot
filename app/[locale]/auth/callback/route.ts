import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ locale: string }> }
): Promise<Response> {
  const { locale } = await context.params;

  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") || `/${locale}/app`;
  const debug = req.nextUrl.searchParams.get("debug") === "1";

  const origin = req.nextUrl.origin;

  if (!code) {
    if (debug) {
      return NextResponse.json({
        step: "callback",
        ok: false,
        error: "missing_code",
        url: req.nextUrl.toString(),
      });
    }
    return NextResponse.redirect(new URL(`/${locale}/login`, origin));
  }

  // ✅ redirect response koji će nositi Set-Cookie headere
  const redirectRes = NextResponse.redirect(new URL(next, origin));

  // ✅ Supabase client za Route Handler: cookies idu u redirectRes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectRes.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (debug) {
    return NextResponse.json({
      step: "callback_exchange",
      ok: !error,
      error: error?.message || null,
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      userId: data?.user?.id || null,
      email: data?.user?.email || null,
      next,
      origin,
    });
  }

  if (error) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=oauth`, origin));
  }

  return redirectRes;
}
