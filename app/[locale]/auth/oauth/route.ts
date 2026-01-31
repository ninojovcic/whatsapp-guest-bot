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

  const provider = (req.nextUrl.searchParams.get("provider") || "").toLowerCase();
  if (!ALLOWED_PROVIDERS.has(provider)) {
    return NextResponse.json(
      { error: "Unsupported provider. Use ?provider=google" },
      { status: 400 }
    );
  }

  const next = req.nextUrl.searchParams.get("next") || `/${locale}/app`;

  // ✅ CANONICAL ORIGIN (važan!)
  const origin = requireEnv("NEXT_PUBLIC_SITE_URL").replace(/\/$/, "");

  const redirectTo = `${origin}/${locale}/auth/callback?next=${encodeURIComponent(next)}`;

  // placeholder response za cookie set
  const placeholder = NextResponse.redirect(new URL(`/${locale}/login?error=oauth_start`, origin), {
    status: 303,
  });

  const supabase = supabaseRouteClient(req, placeholder);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error || !data?.url) {
    return NextResponse.json(
      { error: error?.message || "Failed to start OAuth" },
      { status: 500 }
    );
  }

  // ✅ vrati redirect i prenesi cookie header-e
  const res = NextResponse.redirect(data.url, { status: 303 });
  placeholder.cookies.getAll().forEach((c) => res.cookies.set(c));
  return res;
}
