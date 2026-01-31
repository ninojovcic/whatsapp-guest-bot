import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

function getOrigin(req: NextRequest) {
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (req.nextUrl.protocol.replace(":", "") || "https");
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  return `${proto}://${host}`;
}

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ locale: string }> }
): Promise<Response> {
  const { locale } = await context.params;

  const origin = getOrigin(req);
  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") || `/${locale}/app`;

  // Debug (u Vercel logs)
  console.log("[OAUTH_CALLBACK_HIT]", {
    locale,
    origin,
    next,
    hasCode: !!code,
    url: req.nextUrl.toString(),
  });

  if (!code) {
    return NextResponse.redirect(
      new URL(`/${locale}/login?error=oauth_no_code`, origin),
      { status: 303 }
    );
  }

  const cookieStore = await cookies();

  // ✅ Napravi response unaprijed — u njega ćemo upisati Set-Cookie
  const res = NextResponse.redirect(new URL(next, origin), { status: 303 });

  // ✅ Supabase server client koji zna čitati + zapisati cookies u response
  const supabase = createServerClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
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

  console.log("[OAUTH_EXCHANGE]", {
    ok: !error,
    error: error?.message || null,
    hasSession: !!data?.session,
    hasUser: !!data?.user,
    userId: data?.user?.id || null,
    email: data?.user?.email || null,
  });

  // ✅ Dodatni debug: je li response dobio cookies
  // (Vercel: vidiš set-cookie header u logu)
  const setCookie = res.headers.get("set-cookie");
  console.log("[OAUTH_SET_COOKIE]", {
    hasSetCookieHeader: !!setCookie,
    preview: setCookie ? setCookie.slice(0, 120) : null,
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/${locale}/login?error=oauth_exchange_failed`, origin),
      { status: 303 }
    );
  }

  return res;
}
