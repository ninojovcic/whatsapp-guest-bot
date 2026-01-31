import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function isDebug(req: NextRequest) {
  const qp = req.nextUrl.searchParams.get("debug");
  return qp === "1" || process.env.OAUTH_DEBUG === "1";
}

function safeHeaders(req: NextRequest) {
  return {
    host: req.headers.get("host"),
    "x-forwarded-host": req.headers.get("x-forwarded-host"),
    "x-forwarded-proto": req.headers.get("x-forwarded-proto"),
    referer: req.headers.get("referer"),
    "user-agent": req.headers.get("user-agent"),
  };
}

function supabaseRouteClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ locale: string }> }
): Promise<Response> {
  const { locale } = await context.params;
  const debug = isDebug(req);

  const origin = requireEnv("NEXT_PUBLIC_SITE_URL").replace(/\/$/, "");

  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") || `/${locale}/app`;

  // ✅ vidi odmah je li callback došao kako treba
  console.log("[OAUTH_CALLBACK_HIT]", {
    locale,
    origin,
    next,
    hasCode: !!code,
    url: req.nextUrl.toString(),
    headers: safeHeaders(req),
  });

  if (!code) {
    if (debug) {
      return NextResponse.json({
        step: "callback",
        error: "missing_code",
        url: req.nextUrl.toString(),
        headers: safeHeaders(req),
      });
    }

    return NextResponse.redirect(new URL(`/${locale}/login?error=oauth_no_code`, origin), {
      status: 303,
    });
  }

  // response u koji Supabase upisuje session cookie
  const res = NextResponse.redirect(new URL(next, origin), { status: 303 });
  const supabase = supabaseRouteClient(req, res);

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  // ✅ ključno: je li exchange uspio i što Supabase kaže
  console.log("[OAUTH_EXCHANGE]", {
    ok: !error,
    error: error?.message || null,
    // ne logamo tokene; samo info je li session došla
    hasSession: !!data?.session,
    hasUser: !!data?.user,
    userId: data?.user?.id || null,
    email: data?.user?.email || null,
  });

  if (error) {
    if (debug) {
      return NextResponse.json({
        step: "exchange",
        ok: false,
        error: error.message,
        origin,
        next,
      });
    }

    return NextResponse.redirect(
      new URL(`/${locale}/login?error=oauth_exchange_failed`, origin),
      { status: 303 }
    );
  }

  if (debug) {
    // U debug modu ne redirectamo odmah, nego pokažemo signale + koje cookies res postavlja
    return NextResponse.json({
      step: "exchange",
      ok: true,
      origin,
      next,
      userId: data?.user?.id || null,
      email: data?.user?.email || null,
      // cookie names (ne vrijednosti)
      setCookieNames: res.cookies.getAll().map((c) => c.name),
    });
  }

  return res;
}
