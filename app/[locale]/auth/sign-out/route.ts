import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL(`/${locale}`, request.url), { status: 303 });
}
