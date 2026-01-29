import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;

  const form = await request.formData();

  const full_name = String(form.get("full_name") || "").trim();
  const company_name = String(form.get("company_name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const password_confirm = String(form.get("password_confirm") || "");

  const accept_terms_raw = form.get("accept_terms");
  const accept_terms =
    accept_terms_raw === "on" ||
    accept_terms_raw === "true" ||
    accept_terms_raw === "1";

  // ✅ Basic validation (server-side)
  if (!email || !password || !full_name) {
    return NextResponse.redirect(
      new URL(`/${locale}/signup?error=missing`, request.url),
      { status: 303 }
    );
  }

  if (!accept_terms) {
    return NextResponse.redirect(
      new URL(`/${locale}/signup?error=terms`, request.url),
      { status: 303 }
    );
  }

  if (password.length < 6) {
    return NextResponse.redirect(
      new URL(`/${locale}/signup?error=password`, request.url),
      { status: 303 }
    );
  }

  if (password !== password_confirm) {
    return NextResponse.redirect(
      new URL(`/${locale}/signup?error=match`, request.url),
      { status: 303 }
    );
  }

  const supabase = await createSupabaseServer();

  // ✅ IMPORTANT:
  // full_name + company_name spremamo u user metadata
  // a DB trigger (public.handle_new_user) ih prebacuje u public.profiles
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        company_name: company_name || null,
      },
    },
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/${locale}/signup?error=1`, request.url),
      { status: 303 }
    );
  }

  return NextResponse.redirect(new URL(`/${locale}/app`, request.url), {
    status: 303,
  });
}
