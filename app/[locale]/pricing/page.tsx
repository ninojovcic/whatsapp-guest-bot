// src/app/[locale]/pricing/page.tsx
import Link from "next/link";

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
          "Kreni jednostavno, nadogradi kad ti treba. Jasno, bez sitnih slova.",
        note: "Cijene su u EUR. Možeš otkazati bilo kada.",
        badgeTop: "Transparentno i jednostavno",
        starter: {
          name: "Starter",
          price: "€29",
          cadence: "/ mj",
          desc: "Za 1 objekt i osnove automatizacije.",
          bullets: ["1 objekt", "AI odgovori + handoff", "Osnovna analitika"],
          cta: "Kreni",
          foot: "Osnovni paket, brza postava.",
        },
        pro: {
          name: "Pro",
          price: "€59",
          cadence: "/ mj",
          desc: "Za ozbiljniji rad i više objekata.",
          bullets: ["Do 3 objekta", "Napredniji logovi", "Prioritetna podrška"],
          cta: "Kreni",
          badge: "Najpopularnije",
          foot: "Odmah aktivno nakon prijave.",
        },
        ent: {
          name: "Enterprise",
          price: "Po dogovoru",
          cadence: "",
          desc: "Za timove i posebne zahtjeve.",
          bullets: ["Integracije po mjeri", "Više timova"],
          cta: "Kontakt",
          foot: "Odgovaramo u 1 radni dan.",
        },
        compareTitle: "Usporedba planova",
        compareSubtitle: "Brz pregled ključnih razlika.",
        featuresCol: "Značajke",
        bottomText: "Trebaš nešto posebno? Javi se i složimo plan.",
        startFree: "Kreni besplatno",
        faq1q: "Mogu li promijeniti plan kasnije?",
        faq1a: "Da. Možeš nadograditi ili smanjiti plan kad god želiš.",
        faq2q: "Trebam li karticu za Starter?",
        faq2a: "Da, međutim prvi mjesec je besplatan i možeš otkazati bilo kad.",
      }
    : {
        title: "Pricing",
        subtitle:
          "Start simple, upgrade when you need more. Clear, no fine print.",
        note: "Prices in EUR. Cancel anytime.",
        badgeTop: "Transparent and simple",
        starter: {
          name: "Starter",
          price: "€29",
          cadence: "/ mo",
          desc: "For 1 property and the essentials.",
          bullets: ["1 property", "AI replies + handoff", "Basic analytics"],
          cta: "Start",
          foot: "Basic package, quick setup.",
        },
        pro: {
          name: "Pro",
          price: "€59",
          cadence: "/ mo",
          desc: "For serious usage and more properties.",
          bullets: ["Up to 3 properties", "Advanced logs", "Priority support"],
          cta: "Start",
          badge: "Most popular",
          foot: "Instant access after signup.",
        },
        ent: {
          name: "Enterprise",
          price: "Custom",
          cadence: "",
          desc: "For teams and special requirements.",
          bullets: ["Custom integrations", "Multiple teams"],
          cta: "Contact",
          foot: "Replies within 1 business day.",
        },
        compareTitle: "Compare plans",
        compareSubtitle: "A quick view of the key differences.",
        featuresCol: "Features",
        bottomText: "Need something custom? Reach out and we’ll tailor a plan.",
        startFree: "Start free",
        faq1q: "Can I change plans later?",
        faq1a: "Yes. Upgrade or downgrade anytime.",
        faq2q: "Do I need a card for Starter?",
        faq2a: "No. Start without a card and upgrade when you need more.",
      };

  return (
    <main className="bg-white text-zinc-950">
      {/* Global container */}
      <div className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-72 w-[56rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.14),transparent_60%)]" />
            <div className="absolute -bottom-28 right-[-8rem] h-72 w-96 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.12),transparent_60%)]" />
          </div>

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t.badgeTop}
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
              {t.title}
            </h1>

            <p className="mt-3 text-base leading-relaxed text-zinc-600 md:text-lg">
              {t.subtitle}
            </p>

            <p className="mt-3 text-xs text-zinc-500">{t.note}</p>
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
        <div className="mt-10 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              {t.compareTitle}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">{t.compareSubtitle}</p>
          </div>

          <div className="overflow-x-auto border-t border-zinc-200">
            <table className="min-w-[780px] w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-zinc-600">
                    {t.featuresCol}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-zinc-600">
                    {t.starter.name}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-zinc-600">
                    {t.pro.name}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-zinc-600">
                    {t.ent.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                <Row
                  label={isHR ? "Objekti" : "Properties"}
                  starter="1"
                  pro={isHR ? "Do 3" : "Up to 3"}
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
                  label={isHR ? "Logovi" : "Logs"}
                  starter="—"
                  pro={isHR ? "Napredniji" : "Advanced"}
                  ent={isHR ? "Po dogovoru" : "Custom"}
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
                <Row
                  label={isHR ? "Više timova" : "Multiple teams"}
                  starter="—"
                  pro="—"
                  ent
                />
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-zinc-200 p-6 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-zinc-600">{t.bottomText}</div>
            <div className="flex gap-3">
              <Link
                href={`${base}/contact`}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                {t.ent.cta}
              </Link>
              <Link
                href={`${base}/signup`}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
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
        "relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm",
        highlight
          ? "border-zinc-300 shadow-[0_1px_0_rgba(0,0,0,0.06),0_20px_60px_-30px_rgba(99,102,241,0.35)]"
          : "border-zinc-200",
      ].join(" ")}
    >
      {badge && (
        <div className="absolute top-4 right-4 rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-white">
          {badge}
        </div>
      )}

      <h3 className="text-lg font-semibold tracking-tight text-zinc-950">
        {name}
      </h3>
      <p className="mt-1 text-sm text-zinc-600">{desc}</p>

      <div className="mt-6 flex items-baseline gap-2">
        <div className="text-4xl font-semibold tracking-tight text-zinc-950">
          {price}
        </div>
        {cadence ? <div className="text-sm text-zinc-500">{cadence}</div> : null}
      </div>

      <div className="mt-6">
        <Link
          href={href}
          className={[
            "block w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition",
            variant === "secondary"
              ? "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
              : highlight
                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                : "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
          ].join(" ")}
        >
          {ctaLabel}
        </Link>

        <p className="mt-2 text-center text-xs text-zinc-500">{footer}</p>
      </div>

      <div className="mt-6 border-t border-zinc-200 pt-6">
        <ul className="space-y-3 text-sm">
          {bullets.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-zinc-700">{f}</span>
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
    <tr className="border-b border-zinc-200 last:border-b-0">
      <td className="px-6 py-4 text-sm text-zinc-800">{label}</td>
      <td className="px-6 py-4 text-sm text-zinc-700">{renderCell(starter)}</td>
      <td className="px-6 py-4 text-sm text-zinc-700">{renderCell(pro)}</td>
      <td className="px-6 py-4 text-sm text-zinc-700">{renderCell(ent)}</td>
    </tr>
  );
}

function renderCell(val?: string | boolean) {
  if (val === true) return <Check />;
  if (val === false) return <span className="text-zinc-400">—</span>;
  if (!val) return <span className="text-zinc-400">—</span>;
  return <span>{val}</span>;
}

function Check() {
  return (
    <span className="inline-flex items-center">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <details className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-zinc-900">
        <span>{q}</span>
        <span className="text-zinc-500 transition group-open:rotate-45">+</span>
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-zinc-600">{a}</div>
    </details>
  );
}
