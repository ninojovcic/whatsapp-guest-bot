import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function safeNext(next: string | null, fallback: string) {
  if (!next) return fallback;

  // Only allow internal relative paths (avoid open redirects)
  if (next.startsWith("/") && !next.startsWith("//")) return next;

  return fallback;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { locale: string } }
) {
  const { locale } = params;

  const code = req.nextUrl.searchParams.get("code");
  const nextRaw = req.nextUrl.searchParams.get("next");
  const next = safeNext(nextRaw, `/${locale}/app`);

  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/${locale}/login?error=oauth`, req.url)
    );
  }

  return NextResponse.redirect(new URL(next, req.url));
}