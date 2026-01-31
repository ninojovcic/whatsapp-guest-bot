import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
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

  const origin = requireEnv("NEXT_PUBLIC_SITE_URL").replace(/\/$/, "");

  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") || `/${locale}/app`;

  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=oauth_no_code`, origin), {
      status: 303,
    });
  }

  // ✅ redirect response u koji Supabase upisuje session cookie
  const res = NextResponse.redirect(new URL(next, origin), { status: 303 });
  const supabase = supabaseRouteClient(req, res);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/${locale}/login?error=oauth_exchange_failed`, origin),
      { status: 303 }
    );
  }

  return res;
}
