import type { ReactNode } from "react";

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
      <body className="min-h-screen font-sans">
        <header className="border-b">
          <nav className="mx-auto flex max-w-5xl items-center gap-4 p-4">
            <a href={`/${locale}`} className="font-bold">
              GuestBot
            </a>

            <a href={`/${locale}/features`} className="text-sm opacity-80 hover:opacity-100">
              {t.features}
            </a>
            <a href={`/${locale}/pricing`} className="text-sm opacity-80 hover:opacity-100">
              {t.pricing}
            </a>
            <a href={`/${locale}/contact`} className="text-sm opacity-80 hover:opacity-100">
              {t.contact}
            </a>

            <div className="ml-auto flex items-center gap-3">
              <a href={`/${otherLocale}`} className="text-sm opacity-70 hover:opacity-100">
                {otherLocale.toUpperCase()}
              </a>
              <a href={`/${locale}/login`} className="text-sm opacity-80 hover:opacity-100">
                {t.login}
              </a>
              <a
                href={`/${locale}/signup`}
                className="rounded-xl border px-3 py-2 text-sm font-medium"
              >
                {t.cta}
              </a>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-5xl p-6">{children}</main>

        <footer className="mt-10 border-t">
          <div className="mx-auto max-w-5xl p-4 text-sm opacity-70">
            © {new Date().getFullYear()} GuestBot
          </div>
        </footer>
      </body>
    </html>
  );
}
