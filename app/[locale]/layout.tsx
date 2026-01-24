import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LocaleSwitch } from "@/components/locale-switch";
import { t as T, getLocale } from "@/lib/i18n";

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

  return (
    <html lang={loc}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
            <Link href={`/${loc}`} className="text-lg font-semibold tracking-tight">
              Gostly
            </Link>

            {/* Nav */}
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href={`/${loc}/pricing`}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {tt.nav.pricing}
              </Link>

              {/* Dashboard link (koristiš postojeći key) */}
              <Link
                href={`/${loc}/app/properties`}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {tt.nav.dashboard}
              </Link>
            </nav>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2">
              {/* ✅ tvoj LocaleSwitch očekuje prop "locale" */}
              <LocaleSwitch locale={loc} />

              <Button asChild variant="ghost" size="sm">
                <Link href={`/${loc}/login`}>{tt.nav.login}</Link>
              </Button>

              {/* Pošto nemaš "cta" key u i18n, stavljam normalan button */}
              <Button asChild size="sm" className="rounded-xl">
                <Link href={`/${loc}/signup`}>Get started</Link>
              </Button>
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