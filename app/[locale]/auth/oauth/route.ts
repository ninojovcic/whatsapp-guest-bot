import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

const ALLOWED_PROVIDERS = new Set(["google"]);

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

  const provider = (req.nextUrl.searchParams.get("provider") || "").toLowerCase();
  if (!ALLOWED_PROVIDERS.has(provider)) {
    return NextResponse.json(
      { error: "Unsupported provider. Use ?provider=google" },
      { status: 400 }
    );
  }

  const next = req.nextUrl.searchParams.get("next") || `/${locale}/app`;

  // ✅ canonical origin
  const origin = requireEnv("NEXT_PUBLIC_SITE_URL").replace(/\/$/, "");
  const redirectTo = `${origin}/${locale}/auth/callback?next=${encodeURIComponent(next)}${
    debug ? "&debug=1" : ""
  }`;

  // placeholder response za cookie set (Supabase client traži response obj)
  const placeholder = NextResponse.redirect(new URL(`/${locale}/login?error=oauth_start`, origin), {
    status: 303,
  });

  const supabase = supabaseRouteClient(req, placeholder);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  // ✅ Vercel logs (server-side)
  console.log("[OAUTH_START]", {
    locale,
    provider,
    origin,
    redirectTo,
    next,
    ok: !error && !!data?.url,
    error: error?.message || null,
    headers: safeHeaders(req),
  });

  if (error || !data?.url) {
    return NextResponse.json(
      {
        error: error?.message || "Failed to start OAuth",
        origin,
        redirectTo,
        headers: safeHeaders(req),
      },
      { status: 500 }
    );
  }

  if (debug) {
    // ✅ u debug modu vrati JSON umjesto redirecta (da vidiš točno što je generirano)
    return NextResponse.json({
      step: "oauth_start",
      origin,
      redirectTo,
      oauthUrl: data.url,
      next,
      locale,
      headers: safeHeaders(req),
    });
  }

  // normal flow: redirect na Google + prenesi cookie header-e
  const res = NextResponse.redirect(data.url, { status: 303 });
  placeholder.cookies.getAll().forEach((c) => res.cookies.set(c));
  return res;
}
