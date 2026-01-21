import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isHr = locale === "hr";

  const t = isHr
    ? {
        features: "Značajke",
        pricing: "Cijene",
        contact: "Kontakt",
        login: "Prijava",
        cta: "Pokreni besplatno",
      }
    : {
        features: "Features",
        pricing: "Pricing",
        contact: "Contact",
        login: "Login",
        cta: "Get started free",
      };

  const otherLocale = isHr ? "en" : "hr";

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {/* HEADER */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className="text-lg font-semibold tracking-tight"
            >
              GuestBot
            </Link>

            {/* Nav links */}
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href={`/${locale}/features`}
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                {t.features}
              </Link>
              <Link
                href={`/${locale}/pricing`}
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                {t.pricing}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                {t.contact}
              </Link>
            </nav>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2">
              <Link
                href={`/${otherLocale}`}
                className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                {otherLocale.toUpperCase()}
              </Link>

              <Button asChild variant="ghost" size="sm">
                <Link href={`/${locale}/login`}>{t.login}</Link>
              </Button>

              <Button asChild size="sm" className="rounded-xl">
                <Link href={`/${locale}/signup`}>{t.cta}</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="mx-auto w-full max-w-6xl px-6 py-10">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-muted-foreground">
            © {new Date().getFullYear()} GuestBot
          </div>
        </footer>
      </body>
    </html>
  );
}
