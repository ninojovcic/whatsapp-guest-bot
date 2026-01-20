import type { ReactNode } from "react";

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: "hr" | "en" };
}) {
  const { locale } = params;
  const t = locale === "hr"
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

  const otherLocale = locale === "hr" ? "en" : "hr";

  return (
    <html lang={locale}>
      <body style={{ fontFamily: "system-ui", margin: 0 }}>
        <header style={{ borderBottom: "1px solid #eee" }}>
          <nav style={{ maxWidth: 1000, margin: "0 auto", padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
            <a href={`/${locale}`} style={{ fontWeight: 700, textDecoration: "none", color: "#111" }}>
              GuestBot
            </a>

            <a href={`/${locale}/features`}>{t.features}</a>
            <a href={`/${locale}/pricing`}>{t.pricing}</a>
            <a href={`/${locale}/contact`}>{t.contact}</a>

            <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
              <a href={`/${otherLocale}`} style={{ opacity: 0.8 }}>
                {otherLocale.toUpperCase()}
              </a>
              <a href={`/${locale}/login`}>{t.login}</a>
              <a
                href={`/${locale}/signup`}
                style={{ padding: "10px 14px", border: "1px solid #111", borderRadius: 10, textDecoration: "none" }}
              >
                {t.cta}
              </a>
            </div>
          </nav>
        </header>

        <main style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
          {children}
        </main>

        <footer style={{ borderTop: "1px solid #eee", marginTop: 40 }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16, opacity: 0.7 }}>
            © {new Date().getFullYear()} GuestBot
          </div>
        </footer>
      </body>
    </html>
  );
}
