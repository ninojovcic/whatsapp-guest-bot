import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

function supabaseRouteClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
) {
  const { locale } = await context.params;

  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") || `/${locale}/app`;

  // pripremi response unaprijed (da u njega možemo upisati cookie)
  const redirectUrl = new URL(next, req.nextUrl.origin);
  const res = NextResponse.redirect(redirectUrl);

  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=oauth`, req.nextUrl.origin));
  }

  const supabase = supabaseRouteClient(req, res);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=oauth`, req.nextUrl.origin));
  }

  // ✅ res sada sadrži set-cookie headers
  return res;
}
