// src/app/[locale]/pricing/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cijene",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Pricing({
  params,
}: {
  params: Promise<{ locale: "hr" | "en" }>;
}) {
  const { locale } = await params;
  const isHR = locale === "hr";
  const base = `/${locale}`;

  const t = isHR
    ? {
        title: "Cijene",
        subtitle:
          "Kreni s besplatnim probnim periodom, a zatim odaberi plan koji ti odgovara. Jasno, bez sitnih slova.",
        note:
          "Cijene su u EUR. Probni period: 14 dana (bez kartice). Možeš otkazati bilo kada.",
        badgeTop: "Transparentno i jednostavno",
        starter: {
          name: "Starter",
          price: "€19",
          cadence: "/ mj",
          desc: "Za male iznajmljivače i 1–2 objekta.",
          bullets: [
            "Do 2 objekta",
            "1.000 poruka / mj",
            "AI odgovori + handoff",
            "Osnovna analitika",
            "QR upute za goste",
          ],
          cta: "Kreni",
          foot: "Najbrži put do 24/7 odgovora za goste.",
        },
        pro: {
          name: "Pro",
          price: "€49",
          cadence: "/ mj",
          desc: "Za ozbiljniji rad, više objekata i naprednu analitiku.",
          bullets: [
            "Do 10 objekata",
            "5.000 poruka / mj",
            "Napredna analitika + trendovi",
            "Handoff rate + top upiti",
            "Export CSV",
            "Prioritetna podrška",
          ],
          cta: "Kreni",
          badge: "Najpopularnije",
          foot: "Najbolji omjer cijene i vrijednosti.",
        },
        ent: {
          name: "Business / Enterprise",
          price: "Po upitu",
          cadence: "",
          desc: "Za timove, agencije i posebne potrebe.",
          bullets: ["Custom volumen poruka", "SLA podrška", "Integracije po mjeri"],
          cta: "Kontakt",
          foot: "Dogovorimo plan prema tvojoj situaciji.",
        },
        compareTitle: "Usporedba planova",
        compareSubtitle: "Brz pregled ključnih razlika.",
        featuresCol: "Značajke",
        bottomText:
          "Trebaš više objekata, custom integracije ili SLA? Javi se i složimo plan.",
        startFree: "Kreni besplatno",
        faq1q: "Mogu li promijeniti plan kasnije?",
        faq1a: "Da. Možeš nadograditi ili smanjiti plan kad god želiš.",
        faq2q: "Trebam li karticu za probni period?",
        faq2a: "Ne. Probni period traje 14 dana i možeš krenuti bez kartice.",
      }
    : {
        title: "Pricing",
        subtitle:
          "Start with a free trial, then pick the plan that fits. Clear, no fine print.",
        note:
          "Prices in EUR. Free trial: 14 days (no card). Cancel anytime.",
        badgeTop: "Transparent and simple",
        starter: {
          name: "Starter",
          price: "€19",
          cadence: "/ mo",
          desc: "For small hosts and 1–2 properties.",
          bullets: [
            "Up to 2 properties",
            "1,000 messages / mo",
            "AI replies + handoff",
            "Basic analytics",
            "Guest QR instructions",
          ],
          cta: "Start",
          foot: "Fastest way to answer guests 24/7.",
        },
        pro: {
          name: "Pro",
          price: "€49",
          cadence: "/ mo",
          desc: "For more properties and advanced analytics.",
          bullets: [
            "Up to 10 properties",
            "5,000 messages / mo",
            "Advanced analytics + trends",
            "Handoff rate + top questions",
            "CSV export",
            "Priority support",
          ],
          cta: "Start",
          badge: "Most popular",
          foot: "Best value for growing teams.",
        },
        ent: {
          name: "Business / Enterprise",
          price: "Custom",
          cadence: "",
          desc: "For teams, agencies, and custom requirements.",
          bullets: ["Custom message volume", "SLA support", "Custom integrations"],
          cta: "Contact",
          foot: "We’ll tailor a plan to your needs.",
        },
        compareTitle: "Compare plans",
        compareSubtitle: "A quick view of the key differences.",
        featuresCol: "Features",
        bottomText:
          "Need more properties, custom integrations, or an SLA? Reach out and we’ll tailor a plan.",
        startFree: "Start free",
        faq1q: "Can I change plans later?",
        faq1a: "Yes. Upgrade or downgrade anytime.",
        faq2q: "Do I need a card for the free trial?",
        faq2a: "No. The free trial lasts 14 days and you can start without a card.",
      };

  return (
    // ✅ No page bg here — let the global glow from layout show through
    <main className="relative text-foreground">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border bg-background/60 p-8 shadow-sm backdrop-blur">
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/40 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t.badgeTop}
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
              {t.title}
            </h1>

            <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
              {t.subtitle}
            </p>

            <p className="mt-3 text-xs text-muted-foreground/80">{t.note}</p>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
          <PlanCard
            name={t.starter.name}
            desc={t.starter.desc}
            price={t.starter.price}
            cadence={t.starter.cadence}
            bullets={t.starter.bullets}
            footer={t.starter.foot}
            ctaLabel={`${t.starter.cta} →`}
            href={`${base}/signup`}
          />

          <PlanCard
            name={t.pro.name}
            desc={t.pro.desc}
            price={t.pro.price}
            cadence={t.pro.cadence}
            bullets={t.pro.bullets}
            footer={t.pro.foot}
            badge={t.pro.badge}
            highlight
            ctaLabel={`${t.pro.cta} →`}
            href={`${base}/signup`}
          />

          <PlanCard
            name={t.ent.name}
            desc={t.ent.desc}
            price={t.ent.price}
            cadence={t.ent.cadence}
            bullets={t.ent.bullets}
            footer={t.ent.foot}
            ctaLabel={`${t.ent.cta} →`}
            href={`${base}/contact`}
            variant="secondary"
          />
        </div>

        {/* Comparison */}
        <div className="mt-10 overflow-hidden rounded-3xl border bg-background/55 shadow-sm backdrop-blur">
          <div className="p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              {t.compareTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.compareSubtitle}
            </p>
          </div>

          <div className="overflow-x-auto border-t">
            <table className="min-w-[780px] w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-muted-foreground">
                    {t.featuresCol}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-muted-foreground">
                    {t.starter.name}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-muted-foreground">
                    {t.pro.name}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-muted-foreground">
                    {t.ent.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                <Row
                  label={isHR ? "Objekti" : "Properties"}
                  starter={isHR ? "Do 2" : "Up to 2"}
                  pro={isHR ? "Do 10" : "Up to 10"}
                  ent={isHR ? "Po dogovoru" : "Custom"}
                />
                <Row
                  label={isHR ? "Poruke / mj" : "Messages / mo"}
                  starter={isHR ? "1.000" : "1,000"}
                  pro={isHR ? "5.000" : "5,000"}
                  ent={isHR ? "Po dogovoru" : "Custom"}
                />
                <Row
                  label={isHR ? "AI odgovori + handoff" : "AI replies + handoff"}
                  starter
                  pro
                  ent
                />
                <Row
                  label={isHR ? "Analitika" : "Analytics"}
                  starter={isHR ? "Osnovna" : "Basic"}
                  pro={isHR ? "Napredna" : "Advanced"}
                  ent={isHR ? "Napredna" : "Advanced"}
                />
                <Row
                  label={isHR ? "Handoff rate + Top upiti" : "Handoff rate + Top questions"}
                  starter="—"
                  pro
                  ent
                />
                <Row
                  label={isHR ? "Export CSV" : "CSV export"}
                  starter="—"
                  pro
                  ent
                />
                <Row
                  label={isHR ? "Podrška" : "Support"}
                  starter={isHR ? "Standard" : "Standard"}
                  pro={isHR ? "Prioritetna" : "Priority"}
                  ent="SLA"
                />
                <Row
                  label={isHR ? "Integracije po mjeri" : "Custom integrations"}
                  starter="—"
                  pro="—"
                  ent
                />
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t p-6 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">{t.bottomText}</div>
            <div className="flex gap-3">
              <Link
                href={`${base}/contact`}
                className="rounded-xl border bg-background/40 px-4 py-2 text-sm font-semibold text-foreground hover:bg-background/60"
              >
                {t.ent.cta}
              </Link>
              <Link
                href={`${base}/signup`}
                className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
              >
                {t.startFree}
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Faq q={t.faq1q} a={t.faq1a} />
          <Faq q={t.faq2q} a={t.faq2a} />
        </div>
      </div>
    </main>
  );
}

function PlanCard({
  name,
  desc,
  price,
  cadence,
  bullets,
  footer,
  ctaLabel,
  href,
  badge,
  highlight,
  variant = "primary",
}: {
  name: string;
  desc: string;
  price: string;
  cadence: string;
  bullets: string[];
  footer: string;
  ctaLabel: string;
  href: string;
  badge?: string;
  highlight?: boolean;
  variant?: "primary" | "secondary";
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-3xl border bg-background/55 p-6 shadow-sm backdrop-blur",
        highlight
          ? "border-white/20 shadow-[0_1px_0_rgba(255,255,255,0.06),0_26px_90px_-45px_rgba(34,197,94,0.55)]"
          : "border-border",
      ].join(" ")}
    >
      {/* ✅ Inner glow ONLY for highlight */}
      {highlight ? (
        <div className="pointer-events-none absolute inset-0">
          {/* top green bloom */}
          <div className="absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.22),transparent_62%)] blur-2xl" />
          {/* subtle bottom accent */}
          <div className="absolute -bottom-28 right-[-6rem] h-64 w-96 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16),transparent_64%)] blur-2xl" />
          {/* slight vignette inside card for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_55%)]" />
        </div>
      ) : null}

      {badge && (
        <div className="absolute top-4 right-4 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background">
          {badge}
        </div>
      )}

      <h3 className="text-lg font-semibold tracking-tight">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>

      <div className="mt-6 flex items-baseline gap-2">
        <div className="text-4xl font-semibold tracking-tight">{price}</div>
        {cadence ? (
          <div className="text-sm text-muted-foreground">{cadence}</div>
        ) : null}
      </div>

      <div className="mt-6">
        <Link
          href={href}
          className={[
            "block w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition",
            variant === "secondary"
              ? "border bg-background/40 text-foreground hover:bg-background/60"
              : highlight
                ? "bg-foreground text-background hover:opacity-90"
                : "border bg-background/40 text-foreground hover:bg-background/60",
          ].join(" ")}
        >
          {ctaLabel}
        </Link>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          {footer}
        </p>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <ul className="space-y-3 text-sm">
          {bullets.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted/60 ring-1 ring-border">
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
              <span className="text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Row({
  label,
  starter,
  pro,
  ent,
}: {
  label: string;
  starter?: string | boolean;
  pro?: string | boolean;
  ent?: string | boolean;
}) {
  return (
    <tr className="border-b last:border-b-0">
      <td className="px-6 py-4 text-sm text-muted-foreground">{label}</td>
      <td className="px-6 py-4 text-sm">{renderCell(starter)}</td>
      <td className="px-6 py-4 text-sm">{renderCell(pro)}</td>
      <td className="px-6 py-4 text-sm">{renderCell(ent)}</td>
    </tr>
  );
}

function renderCell(val?: string | boolean) {
  if (val === true) return <Check />;
  if (val === false)
    return <span className="text-muted-foreground/60">—</span>;
  if (!val) return <span className="text-muted-foreground/60">—</span>;
  return <span>{val}</span>;
}

function Check() {
  return (
    <span className="inline-flex items-center">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted/60 ring-1 ring-border">
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
      <span className="sr-only">Included</span>
    </span>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl border bg-background/55 p-5 shadow-sm backdrop-blur">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
        <span>{q}</span>
        <span className="text-muted-foreground transition group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {a}
      </div>
    </details>
  );
}