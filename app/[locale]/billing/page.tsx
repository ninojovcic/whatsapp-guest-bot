import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpgradeButton } from "@/components/upgrade-button";
import { Separator } from "@/components/ui/separator";

function formatDate(d?: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("hr-HR", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  } catch {
    return d;
  }
}

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    success?: string;
    canceled?: string;

    cancel_requested?: string;
    cancel_error?: string;
    cancel_none?: string;
  }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const supabase = await createSupabaseServer();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("billing_profiles")
    .select("plan, monthly_limit, stripe_status, current_period_end, stripe_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const plan = String(profile?.plan ?? "free").toLowerCase();
  const limit = Number(profile?.monthly_limit ?? 0);

  // ✅ normalize status (Stripe je obično lowercase; ovo štiti i od ručnih SQL upisa)
  const statusRaw = String(profile?.stripe_status ?? "—");
  const status = statusRaw.toLowerCase();

  const nextDate = formatDate(profile?.current_period_end ?? null);

  const hasSub = Boolean(profile?.stripe_subscription_id);

  const planLabel = plan.toUpperCase();
  const isFree = plan === "free" || limit <= 0;
  const isStarter = plan === "starter";
  const isPro = plan === "pro";
  const isBusiness = plan === "business";

  const planPill = () => {
    if (isFree) return { text: "FREE", variant: "outline" as const };
    if (isStarter) return { text: "STARTER", variant: "secondary" as const };
    if (isPro) return { text: "PRO", variant: "secondary" as const };
    if (isBusiness) return { text: "BUSINESS", variant: "secondary" as const };
    return { text: planLabel, variant: "secondary" as const };
  };

  const pill = planPill();

  // ✅ Kada prikazati “Otkaži plan”
  // (trialing/active/past_due su normalni cancelable stateovi)
  const cancelableStatuses = new Set(["trialing", "active", "past_due"]);
  const canCancel = hasSub && cancelableStatuses.has(status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">Plan & naplata</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Odavde pokrećeš trial i upravljaš planom.
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-2xl">
          <Link href={`/${locale}/app/properties`}>Natrag na dashboard</Link>
        </Button>
      </div>

      {/* Alerts */}
      {sp?.success ? (
        <div className="rounded-2xl border border-foreground/10 bg-background/55 p-4 text-sm backdrop-blur">
          ✅ Plaćanje uspješno — hvala! (Ako ne vidiš odmah novi plan, pričekaj par
          sekundi i refresh.)
        </div>
      ) : null}

      {sp?.canceled ? (
        <div className="rounded-2xl border border-foreground/10 bg-background/55 p-4 text-sm backdrop-blur">
          ℹ️ Checkout je otkazan.
        </div>
      ) : null}

      {sp?.cancel_requested ? (
        <div className="rounded-2xl border border-foreground/10 bg-background/55 p-4 text-sm backdrop-blur">
          ✅ Otkaz je zatražen. Pretplata će prestati na kraju trenutnog perioda
          (trial ili pretplata).
        </div>
      ) : null}

      {sp?.cancel_none ? (
        <div className="rounded-2xl border border-foreground/10 bg-background/55 p-4 text-sm backdrop-blur">
          ℹ️ Nema aktivne pretplate za otkazati.
        </div>
      ) : null}

      {sp?.cancel_error ? (
        <div className="rounded-2xl border border-foreground/10 bg-background/55 p-4 text-sm backdrop-blur">
          ❗ Nismo uspjeli otkazati pretplatu. Pokušaj ponovno ili se javi supportu.
        </div>
      ) : null}

      {/* Current plan */}
      <Card className="rounded-3xl border border-foreground/10 bg-background/55 backdrop-blur">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Trenutni plan</CardTitle>

          <div className="flex items-center gap-2">
            <Badge variant={pill.variant}>{pill.text}</Badge>
            {!isFree ? (
              <Badge
                variant="outline"
                className="border-foreground/10 bg-background/40"
              >
                {statusRaw}
              </Badge>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isFree ? (
            <div className="rounded-2xl border border-foreground/10 bg-background/40 p-4 text-sm text-muted-foreground">
              Trenutno si na <span className="font-semibold">FREE</span> (0 poruka).
              Da bi bot slao odgovore gostima, pokreni{" "}
              <span className="font-semibold">14 dana trial</span> na STARTER ili PRO planu.
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-foreground/10 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Mjesečni limit</div>
              <div className="mt-1 text-lg font-semibold">{limit}</div>
              <div className="mt-1 text-xs text-muted-foreground">poruka / mj</div>
            </div>

            <div className="rounded-2xl border border-foreground/10 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Stanje pretplate</div>
              <div className="mt-1 text-lg font-semibold">{statusRaw}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Status iz Stripe-a (best-effort)
              </div>
            </div>

            <div className="rounded-2xl border border-foreground/10 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">
                Sljedeći datum naplate / kraj perioda
              </div>
              <div className="mt-1 text-lg font-semibold">{nextDate}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Datum isteka trenutnog perioda
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              Želiš promijeniti plan? Odaberi ispod.
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="rounded-2xl">
                <Link href={`/${locale}/pricing`}>Pogledaj cijene</Link>
              </Button>
              <Button asChild className="rounded-2xl">
                <Link href={`/${locale}/contact`}>Kontakt</Link>
              </Button>

              {/* ✅ Cancel button */}
              {canCancel ? (
                <form action={`/api/stripe/cancel?locale=${locale}`} method="post">
                  <Button
                    type="submit"
                    variant="outline"
                    className="rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    Otkaži plan
                  </Button>
                </form>
              ) : null}
            </div>
          </div>

          {canCancel ? (
            <div className="text-xs text-muted-foreground">
              Otkaz vrijedi na kraju trenutnog perioda (trial ili pretplata).
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Upgrade */}
      <Card className="rounded-3xl border border-foreground/10 bg-background/55 backdrop-blur">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">
            {isFree ? "Pokreni trial" : "Promijeni plan"}
          </CardTitle>
          <Badge variant="secondary">14 dana trial</Badge>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* STARTER */}
          <div className="rounded-2xl border border-foreground/10 bg-background/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold">STARTER</div>
                  {isStarter ? <Badge variant="outline">trenutni</Badge> : null}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Do 2 objekta i 1.000 poruka mjesečno. Idealno za male iznajmljivače.
                </div>
              </div>

              <UpgradeButton plan="starter" variant="outline" className="rounded-2xl">
                {isFree ? "Pokreni trial" : "Odaberi STARTER"}
              </UpgradeButton>
            </div>
          </div>

          {/* PRO (highlight) */}
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-background/40 p-4 shadow-[0_1px_0_rgba(255,255,255,0.06),0_26px_90px_-45px_rgba(34,197,94,0.45)]">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.18),transparent_62%)] blur-2xl" />
            </div>

            <div className="relative flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold">PRO</div>
                  <Badge className="rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background">
                    PREPORUČENO
                  </Badge>
                  {isPro ? <Badge variant="outline">trenutni</Badge> : null}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Do 10 objekata i 5.000 poruka mjesečno + napredna analitika.
                </div>
              </div>

              <UpgradeButton plan="pro" className="rounded-2xl">
                {isFree ? "Pokreni trial" : "Odaberi PRO"}
              </UpgradeButton>
            </div>
          </div>

          {/* BUSINESS */}
          <div className="rounded-2xl border border-foreground/10 bg-background/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold">BUSINESS / ENTERPRISE</div>
                  {isBusiness ? <Badge variant="outline">trenutni</Badge> : null}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Custom broj objekata i poruka, SLA i integracije po mjeri.
                </div>
              </div>

              <Button asChild variant="outline" className="rounded-2xl">
                <Link href={`/${locale}/contact`}>Kontakt</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
