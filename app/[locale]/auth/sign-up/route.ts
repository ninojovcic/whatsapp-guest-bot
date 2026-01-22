import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");

  const supabase = createSupabaseServer();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return NextResponse.redirect(new URL(`/${locale}/signup?error=1`, request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL(`/${locale}/app`, request.url), { status: 303 });
}
