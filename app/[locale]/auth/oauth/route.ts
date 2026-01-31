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

  // ✅ ključ: origin iz requesta (www ili ne-www, kako god user dođe)
  const origin = getOrigin(req);

  // ✅ callback u istom originu
  const redirectTo = `${origin}/${locale}/auth/callback?next=${encodeURIComponent(next)}`;

  const supabase = await createSupabaseServer();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  console.log("[OAUTH_START]", {
    locale,
    origin,
    redirectTo,
    next,
    ok: !error && !!data?.url,
    error: error?.message || null,
  });

  if (error || !data?.url) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=oauth`, origin), {
      status: 303,
    });
  }

  return NextResponse.redirect(data.url, { status: 303 });
}
