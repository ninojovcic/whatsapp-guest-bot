// app/[locale]/auth/oauth/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALLOWED_PROVIDERS = new Set(["google", "apple"]);

function getOrigin(req: Request) {
  // Works on Vercel and locally
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (req.url.startsWith("https") ? "https" : "http");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  return `${proto}://${host}`;
}

export async function GET(
  req: Request,
  { params }: { params: { locale: string } }
) {
  const url = new URL(req.url);

  const provider = (url.searchParams.get("provider") || "").toLowerCase();
  if (!ALLOWED_PROVIDERS.has(provider)) {
    return NextResponse.json(
      { error: "Unsupported provider. Use ?provider=google or ?provider=apple" },
      { status: 400 }
    );
  }

  const origin = getOrigin(req);

  // 👇 Match what you added to Supabase "Redirect URLs"
  // If your callback route is /auth/callback (no locale), keep this.
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