import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpgradeButton } from "@/components/upgrade-button";

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
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const supabase = await createSupabaseServer();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("billing_profiles")
    .select("plan, monthly_limit, stripe_status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const plan = profile?.plan ?? "free";
  const limit = profile?.monthly_limit ?? 100;
  const status = profile?.stripe_status ?? "—";
  const nextDate = formatDate(profile?.current_period_end ?? null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Plan & naplata</h1>
          <p className="text-sm text-muted-foreground">
            Upravljaj pretplatom i limitima poruka.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/${locale}/app/properties`}>Natrag na dashboard</Link>
        </Button>
      </div>

      {sp?.success ? (
        <div className="rounded-xl border bg-muted p-4 text-sm">
          ✅ Plaćanje uspješno — hvala! (Ako ne vidiš odmah novi plan, pričekaj
          par sekundi i refresh.)
        </div>
      ) : null}

      {sp?.canceled ? (
        <div className="rounded-xl border bg-muted p-4 text-sm">
          ℹ️ Checkout je otkazan.
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Trenutni plan</CardTitle>
          <Badge variant={plan === "free" ? "outline" : "secondary"}>
            {plan.toUpperCase()}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            Mjesečni limit poruka:{" "}
            <span className="font-semibold">{limit}</span>
          </div>
          <div>
            Stripe status: <span className="font-semibold">{status}</span>
          </div>
          <div>
            Sljedeći datum naplate / kraj perioda:{" "}
            <span className="font-semibold">{nextDate}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nadogradnja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* STARTER */}
          <div className="rounded-xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">STARTER</div>
                <div className="text-sm text-muted-foreground">
                  Do 2 objekta i 1.000 poruka mjesečno. Idealno za male
                  iznajmljivače.
                </div>
              </div>
              <UpgradeButton plan="starter" variant="outline">
                Odaberi STARTER
              </UpgradeButton>
            </div>
          </div>

          {/* PRO */}
          <div className="rounded-xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">PRO</div>
                <div className="text-sm text-muted-foreground">
                  Do 10 objekata i 5.000 poruka mjesečno + napredna analitika.
                </div>
              </div>
              <UpgradeButton plan="pro">Odaberi PRO</UpgradeButton>
            </div>
          </div>

          {/* BUSINESS */}
          <div className="rounded-xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">BUSINESS / ENTERPRISE</div>
                <div className="text-sm text-muted-foreground">
                  Custom broj objekata i poruka, SLA i integracije po mjeri.
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href={`/${locale}/contact`}>Kontakt</Link>
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Napomena: “Manage subscription” (Stripe Portal) dodajemo kao sljedeći
            korak.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}