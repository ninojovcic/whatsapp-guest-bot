import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LocaleSwitch } from "@/components/locale-switch";

import { t as T, getLocale } from "@/lib/i18n";
import { createSupabaseServer } from "@/lib/supabase/server";

// ✅ Mobile menu (shadcn/ui)
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const metadata: Metadata = {
  title: {
    default: "Gostly",
    template: "%s | Gostly",
  },
  description: "AI WhatsApp asistent za apartmane, hotele i turizam.",
};

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
      <body className="relative min-h-screen bg-background font-sans text-foreground antialiased overflow-x-hidden">
        {/* 🌿 GLOBAL WHATSAPP-STYLE GLOW (ALL PAGES) */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          {/* base wash */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />

          {/* large green glows */}
          <div className="absolute -top-[520px] left-1/2 h-[900px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.22),transparent_62%)] blur-2xl" />
          <div className="absolute top-[10%] right-[-35%] h-[900px] w-[900px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18),transparent_64%)] blur-2xl" />
          <div className="absolute top-[42%] left-[-35%] h-[900px] w-[900px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.16),transparent_65%)] blur-2xl" />
          <div className="absolute bottom-[-45%] left-1/2 h-[900px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.14),transparent_66%)] blur-2xl" />

          {/* dark vignette (fix bottom / toolbar issue) */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_12%,rgba(0,0,0,0.65)_78%)]" />

          {/* subtle grain */}
          <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:18px_18px]" />
        </div>

        {/* HEADER */}
        <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
            {/* Brand */}
            <Link
              href={`/${loc}`}
              className="flex items-center gap-2 text-sm font-semibold tracking-tight"
            >
              <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl border border-foreground/10 bg-background/40 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-base">Gostly</span>
            </Link>

            {/* Desktop nav */}
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
                href={`/${loc}/app`}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {tt.nav.dashboard}
              </Link>
            </nav>

            {/* Right actions (desktop) */}
            <div className="ml-auto hidden items-center gap-2 md:flex">
              <LocaleSwitch locale={loc} />

              {!user ? (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/${loc}/login`}>{tt.nav.login}</Link>
                  </Button>

                  {/* ✅ CTA: more “wow” (inner glow + subtle ring + shine) */}
                  <Button
                    asChild
                    size="sm"
                    className={[
                      "relative overflow-hidden rounded-xl",
                      "bg-foreground text-background hover:opacity-95",
                      "shadow-[0_12px_40px_-22px_rgba(34,197,94,0.9)]",
                      "ring-1 ring-foreground/15",
                    ].join(" ")}
                  >
                    <Link href={`/${loc}/signup`}>
                      <span className="relative z-10">Isprobaj odmah</span>
                      {/* inner glow */}
                      <span className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.45),transparent_55%)]" />
                      {/* subtle shine sweep */}
                      <span className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-white/10 blur-xl" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    {planLabel}
                  </Badge>

                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/${loc}/billing`}>Plan / Billing</Link>
                  </Button>

                  <form action={`/${loc}/auth/sign-out`} method="post">
                    <Button type="submit" variant="outline" size="sm">
                      {tt.nav.logout}
                    </Button>
                  </form>
                </>
              )}
            </div>

            {/* ✅ Mobile: locale + hamburger */}
            <div className="ml-auto flex items-center gap-2 md:hidden">
              <LocaleSwitch locale={loc} />

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-foreground/15 bg-background/40 hover:bg-background/60"
                  >
                    <span className="sr-only">Otvori izbornik</span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 7h16M4 12h16M4 17h16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  className="w-[320px] border-foreground/10 bg-background/85 backdrop-blur-xl"
                >
                  <SheetHeader>
                    <SheetTitle>Izbornik</SheetTitle>
                  </SheetHeader>

                  <div className="mt-6 grid gap-2">
                    <Link
                      href={`/${loc}#kako-radi`}
                      className="rounded-2xl border border-foreground/10 bg-background/40 px-4 py-3 text-sm font-medium hover:bg-background/60"
                    >
                      Kako radi?
                    </Link>

                    <Link
                      href={`/${loc}/pricing`}
                      className="rounded-2xl border border-foreground/10 bg-background/40 px-4 py-3 text-sm font-medium hover:bg-background/60"
                    >
                      {tt.nav.pricing}
                    </Link>

                    <Link
                      href={`/${loc}/app`}
                      className="rounded-2xl border border-foreground/10 bg-background/40 px-4 py-3 text-sm font-medium hover:bg-background/60"
                    >
                      {tt.nav.dashboard}
                    </Link>

                    <div className="my-2 border-t border-foreground/10" />

                    {!user ? (
                      <>
                        <Button
                          asChild
                          variant="outline"
                          className="rounded-2xl border-foreground/15 bg-background/40 hover:bg-background/60"
                        >
                          <Link href={`/${loc}/login`}>{tt.nav.login}</Link>
                        </Button>

                        {/* ✅ CTA inside mobile menu too */}
                        <Button
                          asChild
                          className={[
                            "relative overflow-hidden rounded-2xl",
                            "bg-foreground text-background hover:opacity-95",
                            "shadow-[0_12px_40px_-22px_rgba(34,197,94,0.9)]",
                            "ring-1 ring-foreground/15",
                          ].join(" ")}
                        >
                          <Link href={`/${loc}/signup`}>
                            <span className="relative z-10">Isprobaj odmah</span>
                            <span className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.45),transparent_55%)]" />
                            <span className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-white/10 blur-xl" />
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-background/40 px-4 py-3">
                          <div className="text-sm">
                            <div className="text-xs text-muted-foreground">
                              Plan
                            </div>
                            <div className="font-semibold">{planLabel}</div>
                          </div>
                          <Link
                            href={`/${loc}/billing`}
                            className="rounded-xl border border-foreground/10 bg-background/40 px-3 py-2 text-xs font-semibold hover:bg-background/60"
                          >
                            Billing
                          </Link>
                        </div>

                        <form action={`/${loc}/auth/sign-out`} method="post">
                          <Button
                            type="submit"
                            variant="outline"
                            className="w-full rounded-2xl border-foreground/15 bg-background/40 hover:bg-background/60"
                          >
                            {tt.nav.logout}
                          </Button>
                        </form>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>

        {/* FOOTER */}
        <footer className="border-t border-foreground/10">
  <div className="mx-auto max-w-6xl px-6 py-10">
    <div className="grid gap-8 md:grid-cols-3">
      {/* Brand / trust */}
      <div className="space-y-3">
        <Link href={`/${loc}`} className="text-sm font-semibold tracking-tight">
          Gostly
        </Link>

        {/* Trust badge (Stripe-ish) */}
        <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/40 px-3 py-1 text-xs text-muted-foreground">
          {/* blue check */}
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          {/* ✅ SAFE default copy (edit if you truly are certified) */}
          <span>Službena Whatsapp Poslovna Platforma (Certificirani Provider Tehnologije)</span>

 
          {/*
            Ako ste stvarno certificirani provider, zamijeni gore tekst sa:
            "Službena WhatsApp Poslovna Platforma (Certificirani Provider Tehnologije)"
          */}
        </div>

        <p className="text-sm text-muted-foreground">
          AI WhatsApp asistent za apartmane, hotele i turizam.
        </p>
      </div>

      {/* Links 1 */}
      <div className="grid gap-2 text-sm">
        <div className="text-xs font-semibold tracking-wide text-muted-foreground">
          Proizvod
        </div>
        <Link
          href={`/${loc}#kako-radi`}
          className="text-muted-foreground hover:text-foreground"
        >
          Kako radi?
        </Link>
        <Link
          href={`/${loc}/pricing`}
          className="text-muted-foreground hover:text-foreground"
        >
          {tt.nav.pricing}
        </Link>
        <Link
          href={`/${loc}/app/properties`}
          className="text-muted-foreground hover:text-foreground"
        >
          {tt.nav.dashboard}
        </Link>
      </div>

      {/* Links 2 */}
      <div className="grid gap-2 text-sm md:justify-items-end">
        <div className="text-xs font-semibold tracking-wide text-muted-foreground">
          Račun
        </div>

        {!user ? (
          <>
            <Link
              href={`/${loc}/login`}
              className="text-muted-foreground hover:text-foreground"
            >
              {tt.nav.login}
            </Link>
            <Link
              href={`/${loc}/signup`}
              className="text-muted-foreground hover:text-foreground"
            >
              Isprobaj odmah
            </Link>
          </>
        ) : (
          <>
            <Link
              href={`/${loc}/billing`}
              className="text-muted-foreground hover:text-foreground"
            >
              Plan / Billing
            </Link>
            <form action={`/${loc}/auth/sign-out`} method="post">
              <button
                type="submit"
                className="text-left text-muted-foreground hover:text-foreground"
              >
                {tt.nav.logout}
              </button>
            </form>
          </>
        )}

        {/* Optional: add Contact if you have the route */}
        <Link
          href={`/${loc}/contact`}
          className="text-muted-foreground hover:text-foreground"
        >
          Kontakt
        </Link>
      </div>
    </div>

    <div className="mt-10 flex flex-col gap-2 border-t border-foreground/10 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div>© {new Date().getFullYear()} Gostly</div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {/* stavi ove linkove samo ako postoje u projektu */}
        <Link href={`/${loc}/privacy`} className="hover:text-foreground">
          Privatnost
        </Link>
        <Link href={`/${loc}/terms`} className="hover:text-foreground">
          Uvjeti
        </Link>
      </div>
    </div>
  </div>
</footer>
      </body>
    </html>
  );
}