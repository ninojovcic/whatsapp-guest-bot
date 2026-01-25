// app/[locale]/auth/oauth/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALLOWED_PROVIDERS = new Set(["google", "apple"]);

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
  // ✅ In your setup, params is a Promise
  await context.params;

  const provider = (req.nextUrl.searchParams.get("provider") || "").toLowerCase();
  if (!ALLOWED_PROVIDERS.has(provider)) {
    return NextResponse.json(
      { error: "Unsupported provider. Use ?provider=google or ?provider=apple" },
      { status: 400 }
    );
  }

  const origin = getOrigin(req);

  // 👇 ovo mora biti u Supabase Auth -> URL Configuration -> Redirect URLs
  const redirectTo = `${origin}/auth/callback`;

  const supabase = await createSupabaseServer();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as "google" | "apple",
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