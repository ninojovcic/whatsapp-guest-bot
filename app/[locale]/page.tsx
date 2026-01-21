import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
        h1: "AI WhatsApp asistent koji odgovara gostima 24/7",
        p: "Automatski odgovara na najčešća pitanja na jeziku gosta. Kad nije siguran — odmah proslijedi domaćinu emailom.",
        cta1: "Pokreni besplatno",
        cta2: "Pogledaj cijene",
        proof: ["Bez kartice", "Postavljanje 5 min", "Siguran handoff"],
        featuresTitle: "Što dobivaš",
        features: [
          {
            title: "Odgovori 24/7",
            desc: "Gosti dobiju odgovor odmah, i kad ti spavaš ili radiš.",
          },
          {
            title: "Bilingvalno + auto jezik",
            desc: "Odgovara na jeziku gosta bez dodatnog podešavanja.",
          },
          {
            title: "Handoff domaćinu",
            desc: "Ako nema podatak, ne izmišlja — pošalje tebi upit na email.",
          },
          {
            title: "Logovi i uvid",
            desc: "Sve poruke se spremaju da vidiš što gosti najčešće pitaju.",
          },
        ],
        howTitle: "Kako radi",
        steps: [
          { title: "Uneseš informacije", desc: "Check-in/out, parking, Wi-Fi, pravila, FAQ." },
          { title: "Gosti šalju poruke", desc: "WhatsApp upiti dolaze automatski u sustav." },
          { title: "Bot odgovara ili prosljeđuje", desc: "Siguran odgovor ili handoff domaćinu." },
        ],
        demoTitle: "Brzi demo",
        demoQ: "TEST1: Imate li parking?",
        demoA: "Da — besplatan parking je dostupan ispred objekta.",
        finalTitle: "Spremno za prve korisnike",
        finalP: "Pokreni besplatno i testiraj s 1 objektom. Kad budeš spreman, prebacimo na produkciju.",
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
          { title: "Replies 24/7", desc: "Guests get answers instantly—even when you’re offline." },
          { title: "Bilingual + auto language", desc: "Replies in the guest’s language without extra work." },
          { title: "Human handoff", desc: "If info is missing, it doesn’t guess—it emails the host." },
          { title: "Logs & insights", desc: "Messages are saved so you can improve your info and FAQs." },
        ],
        howTitle: "How it works",
        steps: [
          { title: "Add your info", desc: "Check-in/out, parking, Wi-Fi, rules, FAQs." },
          { title: "Guests message you", desc: "WhatsApp questions flow into the system." },
          { title: "Bot answers or escalates", desc: "Safe answer or instant handoff to host." },
        ],
        demoTitle: "Quick demo",
        demoQ: "TEST1: Do you have parking?",
        demoA: "Yes — free parking is available in front of the property.",
        finalTitle: "Ready for your first users",
        finalP: "Start free with 1 property. When you’re ready, we’ll move to production.",
        finalCta: "Start now",
      };

  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border bg-background">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/60 to-background" />
        <div className="grid gap-10 p-8 md:grid-cols-2 md:p-12">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit">
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
                <Badge key={item} variant="outline">
                  {item}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="rounded-2xl">
                <Link href={`/${locale}/signup`}>{copy.cta1}</Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="rounded-2xl">
                <Link href={`/${locale}/pricing`}>{copy.cta2}</Link>
              </Button>
            </div>
          </div>

          {/* RIGHT: Demo card */}
          <div className="flex items-center">
            <Card className="w-full rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">{copy.demoTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border bg-muted/40 p-4">
                  <div className="text-xs text-muted-foreground">
                    {isHR ? "Upit gosta" : "Guest message"}
                  </div>
                  <div className="mt-1 font-medium">{copy.demoQ}</div>
                </div>

                <div className="rounded-2xl border bg-background p-4">
                  <div className="text-xs text-muted-foreground">
                    {isHR ? "Odgovor bota" : "Bot reply"}
                  </div>
                  <div className="mt-1 font-medium">{copy.demoA}</div>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground">
                  {isHR
                    ? "U produkciji se property kod uklanja—gost samo piše na WhatsApp."
                    : "In production the property code goes away—guests just message WhatsApp normally."}
                </div>
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
            <Card key={f.title} className="rounded-3xl">
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
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {copy.howTitle}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {copy.steps.map((s, idx) => (
            <Card key={s.title} className="rounded-3xl">
              <CardHeader className="space-y-3">
                <Badge variant="secondary" className="w-fit">
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
            <Button asChild size="lg" className="rounded-2xl">
              <Link href={`/${locale}/signup`}>{copy.finalCta}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl">
              <Link href={`/${locale}/pricing`}>{isHR ? "Cijene" : "Pricing"}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
