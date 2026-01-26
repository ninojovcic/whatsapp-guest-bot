import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ locale: string }> }
): Promise<Response> {
  const { locale } = await context.params;

  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") || `/${locale}/app`;

  // ako nema code-a, vrati na login u istom locale-u
  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl.origin));
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  // ako session exchange faila, opet na login
  if (error) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl.origin));
  }

  // next može već uključivati /hr/... ili /en/... – koristimo kako je došao
  return NextResponse.redirect(new URL(next, req.nextUrl.origin));
}