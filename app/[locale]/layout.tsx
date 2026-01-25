import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LocaleSwitch } from "@/components/locale-switch";

import { t as T, getLocale } from "@/lib/i18n";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const loc = getLocale(locale); // "en" | "hr"
  const tt = T(loc);

  // ✅ Auth check (server-side)
  const supabase = await createSupabaseServer();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;

  // ✅ Plan badge (best effort)
  let planLabel: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("billing_profiles")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();

    planLabel = (profile?.plan || "free").toString().toUpperCase();
  }

  return (
    <html lang={loc} className="dark">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
            <Link href={`/${loc}`} className="text-lg font-semibold tracking-tight">
              Gostly
            </Link>

            {/* Nav */}
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href={`/${loc}#kako-radi`}
                className="text-sm text-muted-foreground transition hover:text-foreground"
                >
                Kako radi?
              </Link>

              <Link
                href={`/${loc}/pricing`}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {tt.nav.pricing}
              </Link>

              <Link
                href={`/${loc}/app/properties`}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {tt.nav.dashboard}
              </Link>
            </nav>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2">
              <LocaleSwitch locale={loc} />

              {!user ? (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/${loc}/login`}>{tt.nav.login}</Link>
                  </Button>

                  <Button asChild size="sm" className="rounded-xl">
                    <Link href={`/${loc}/signup`}>Isprobaj Odmah</Link>
                  </Button>
                </>
              ) : (
                <>
                  {/* Plan badge */}
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    {planLabel}
                  </Badge>

                  {/* Billing / Plan */}
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/${loc}/billing`}>Plan / Billing</Link>
                  </Button>

                  {/* Logout */}
                  <form action={`/${loc}/auth/sign-out`} method="post">
                    <Button type="submit" variant="outline" size="sm">
                      {tt.nav.logout}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>

        <footer className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Gostly
          </div>
        </footer>
      </body>
    </html>
  );
}