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
  { params }: { params: { locale: string } }
): Promise<Response> {
  const { locale } = params;

  const provider = (req.nextUrl.searchParams.get("provider") || "").toLowerCase();
  if (!ALLOWED_PROVIDERS.has(provider)) {
    return NextResponse.json(
      { error: "Unsupported provider. Use ?provider=google" },
      { status: 400 }
    );
  }

  // where to go after callback
  const next = req.nextUrl.searchParams.get("next") || `/${locale}/app`;

  const origin = getOrigin(req);

  // IMPORTANT: this must be allowed in Supabase Auth -> URL Configuration -> Redirect URLs
  // Use locale-aware callback route, and keep "next" so callback can send user onward.
  const redirectTo = `${origin}/${locale}/auth/callback?next=${encodeURIComponent(next)}`;

  const supabase = await createSupabaseServer();

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

  return NextResponse.redirect(data.url);
}