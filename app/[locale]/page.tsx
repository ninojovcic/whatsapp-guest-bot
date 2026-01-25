import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoRotator } from "@/components/demo-rotator";

export default async function Landing({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isHR = locale === "hr";

  const copy = isHR
    ? {
        badge: "Za apartmane • hotele • restorane",
        h1: "Gostly — pametni WhatsApp asistent za iznajmljivače",
        p: "Odgovara gostima 24/7 na najčešća pitanja, smanjuje broj poruka prema domaćinu i osigurava da se svaki važan upit automatski proslijedi kada je potrebna ljudska intervencija.",
        cta1: "Isprobaj odmah",
        cta2: "Pogledaj cijene",
        proof: [
          "Brzo postavljanje [5 min]",
          "Jednostavno sučelje",
          "Siguran i pouzdan handoff",
        ],
        featuresTitle: "Što dobivaš?",
        features: [
          {
            title: "Odgovori 24/7",
            desc: "Gosti dobiju odgovor odmah, i kad ti spavaš ili radiš.",
          },
          {
            title: "Bilingvalno + auto jezik",
            desc: "Odgovara na 100+ jezika, u jeziku gosta bez dodatnog rada.",
          },
          {
            title: "Handoff domaćinu",
            desc: "Ako nema podatak, ne izmišlja — pošalje tebi upit na email.",
          },
          {
            title: "Analitika i uvidi",
            desc: "Sve poruke se spremaju da vidiš što gosti najčešće pitaju. Dajemo ti ideje za poboljšanje informacija i FAQ-a.",
          },
        ],
        howTitle: "Kako radi",
        steps: [
          {
            title: "Uneseš informacije",
            desc: "Check-in/out, parking, Wi-Fi, pravila, FAQ.",
          },
          {
            title: "Gosti šalju poruke",
            desc: "WhatsApp upiti dolaze automatski u sustav.",
          },
          {
            title: "Gostly odgovara ili prosljeđuje domaćinu",
            desc: "Gostly šalje odgovor ili prosljeđuje domaćinu.",
          },
        ],
        demoTitle: "Brzi demo",
        demoQ: "TEST1: Imate li parking?",
        demoA: "Da — besplatan parking je dostupan ispred objekta.",
        finalTitle: "Kreni odmah sa svojim prvim korisnicima",
        finalP: "Nisi siguran? Isprobaj besplatno s jednim objektom i 100 poruka mjesečno. Kada budeš spreman, uvijek možeš nadograditi svoj plan.",
        finalCta: "Kreni sada",
      }
    : {
        badge: "For rentals • hotels • restaurants",
        h1: "An AI WhatsApp assistant that answers guests 24/7",
        p: "Instantly answers common questions in the guest’s language. If unsure — it escalates to the host via email.",
        cta1: "Get started free",
        cta2: "View pricing",
        proof: ["No card", "5-min setup", "Safe handoff"],
        featuresTitle: "What you get",
        features: [
          {
            title: "Replies 24/7",
            desc: "Guests get answers instantly—even when you’re offline.",
          },
          {
            title: "Bilingual + auto language",
            desc: "Replies in the guest’s language without extra work.",
          },
          {
            title: "Human handoff",
            desc: "If info is missing, it doesn’t guess—it emails the host.",
          },
          {
            title: "Logs & insights",
            desc: "Messages are saved so you can improve your info and FAQs.",
          },
        ],
        howTitle: "How it works",
        steps: [
          {
            title: "Add your info",
            desc: "Check-in/out, parking, Wi-Fi, rules, FAQs.",
          },
          {
            title: "Guests message you",
            desc: "WhatsApp questions flow into the system.",
          },
          {
            title: "Bot answers or escalates",
            desc: "Safe answer or instant handoff to host.",
          },
        ],
        demoTitle: "Quick demo",
        demoQ: "TEST1: Do you have parking?",
        demoA: "Yes — free parking is available in front of the property.",
        finalTitle: "Ready for your first users",
        finalP: "Start free with 1 property. When you’re ready, we’ll move to production.",
        finalCta: "Start now",
      };

  return (
    <div className="relative space-y-16">
      {/* ✅ FULL-VIEWPORT glow (not limited to container width) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* base dark wash */}
        <div className="absolute inset-0 bg-background" />

        {/* big soft orbs across entire page */}
        <div className="absolute -top-[520px] left-1/2 h-[980px] w-[1400px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.26),transparent_62%)] blur-3xl" />
        <div className="absolute top-[6%] right-[-40%] h-[980px] w-[980px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.22),transparent_64%)] blur-3xl" />
        <div className="absolute top-[28%] left-[-40%] h-[980px] w-[980px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.20),transparent_65%)] blur-3xl" />

        {/* mid-page extra glow so it stays strong while scrolling */}
        <div className="absolute top-[55%] left-1/2 h-[880px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.18),transparent_66%)] blur-3xl" />
        <div className="absolute top-[68%] right-[-35%] h-[900px] w-[900px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16),transparent_66%)] blur-3xl" />

        {/* bottom glow */}
        <div className="absolute bottom-[-55%] left-1/2 h-[980px] w-[1400px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18),transparent_66%)] blur-3xl" />

        {/* vignette for premium depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_18%,rgba(0,0,0,0.55)_78%)]" />
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border bg-background/70 backdrop-blur">
        <div className="grid gap-10 p-8 md:grid-cols-2 md:p-12">
          <div className="space-y-6">
            <Badge
              variant="secondary"
              className="w-fit border border-foreground/10 bg-muted/50"
            >
              {copy.badge}
            </Badge>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              {copy.h1}
            </h1>

            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              {copy.p}
            </p>

            <div className="flex flex-wrap gap-2">
              {copy.proof.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="border-foreground/15 bg-background/40"
                >
                  {item}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="rounded-2xl shadow-sm transition-shadow hover:shadow-md"
              >
                <Link href={`/${locale}/signup`}>{copy.cta1}</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-2xl border-foreground/15 bg-background/40 hover:bg-background"
              >
                <Link href={`/${locale}/pricing`}>{copy.cta2}</Link>
              </Button>
            </div>
          </div>

          {/* RIGHT: Demo card */}
          <div className="flex items-center">
            <Card className="w-full rounded-3xl border bg-background/70 backdrop-blur transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-base">{copy.demoTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DemoRotator isHR={isHR} intervalMs={3500} code="TEST1" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {copy.featuresTitle}
          </h2>
          <p className="text-muted-foreground">
            {isHR
              ? "Dizajnirano za turizam: brzo, jednostavno i sigurno."
              : "Built for tourism: fast, simple, and safe."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {copy.features.map((f) => (
            <Card
              key={f.title}
              className="rounded-3xl border bg-background/70 backdrop-blur transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {f.desc}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="kako-radi" className="scroll-mt-24 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {copy.howTitle}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {copy.steps.map((s, idx) => (
            <Card
              key={s.title}
              className="rounded-3xl border bg-background/70 backdrop-blur transition-shadow hover:shadow-md"
            >
              <CardHeader className="space-y-3">
                <Badge
                  variant="secondary"
                  className="w-fit border border-foreground/10 bg-muted/50"
                >
                  {isHR ? `Korak ${idx + 1}` : `Step ${idx + 1}`}
                </Badge>
                <CardTitle className="text-lg">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {s.desc}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="rounded-3xl border bg-muted/30 p-8 md:p-12">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold tracking-tight">
              {copy.finalTitle}
            </h3>
            <p className="text-muted-foreground">{copy.finalP}</p>
          </div>

          <div className="flex gap-3 md:justify-end">
            <Button
              asChild
              size="lg"
              className="rounded-2xl shadow-sm transition-shadow hover:shadow-md"
            >
              <Link href={`/${locale}/signup`}>{copy.finalCta}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-2xl border-foreground/15 bg-background/40 hover:bg-background"
            >
              <Link href={`/${locale}/pricing`}>
                {isHR ? "Cijene" : "Pricing"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}