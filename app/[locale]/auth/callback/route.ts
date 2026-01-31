import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ locale: string }> }
) {
  const { locale } = await context.params;

  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") || `/${locale}/app`;
  const debug = req.nextUrl.searchParams.get("debug") === "1";

  // Ako nema code-a -> login
  if (!code) {
    if (debug) {
      return NextResponse.json({
        step: "callback",
        error: "missing_code",
        url: req.nextUrl.toString(),
      });
    }
    return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl.origin));
  }

  // ✅ BITNO: response objekt koji ćemo vratiti (redirect),
  // i u njega ćemo upisati Set-Cookie kroz response.cookies.set
  const redirectUrl = new URL(next, req.nextUrl.origin);
  const res = NextResponse.redirect(redirectUrl);

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
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (debug) {
    return NextResponse.json({
      step: "exchange",
      ok: !error,
      error: error?.message || null,
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      userId: data?.user?.id || null,
      email: data?.user?.email || null,
      next,
      redirectTo: redirectUrl.toString(),
      note: "If ok=true, you should see sb-*-auth-token and sb-*-refresh-token cookies set on this response.",
    });
  }

  // Ako exchange faila -> login
  if (error) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl.origin));
  }

  return res;
}
