import { redirect } from "next/navigation";
import Link from "next/link";

import { createSupabaseServer } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function monthKey(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function nextMonthDate() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
}

export default async function BillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const supabase = await createSupabaseServer();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;

  if (!user) redirect(`/${locale}/login`);

  const month = monthKey();

  // Billing profile
  const { data: profile } = await supabase
    .from("billing_profiles")
    .select("plan, monthly_limit")
    .eq("user_id", user.id)
    .single();

  // Usage this month
  const { data: usage } = await supabase
    .from("usage_monthly")
    .select("used")
    .eq("user_id", user.id)
    .eq("month", month)
    .maybeSingle();

  const plan = profile?.plan ?? "free";
  const limit = profile?.monthly_limit ?? 0;
  const used = usage?.used ?? 0;

  const resetDate = nextMonthDate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing & Plan</h1>
        <p className="text-sm text-muted-foreground">
          Pregled tvog trenutnog plana i potrošnje.
        </p>
      </div>

      {/* CURRENT PLAN */}
      <Card>
        <CardHeader>
          <CardTitle>Trenutni plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="text-sm uppercase">
              {plan}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Mjesečni limit poruka
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="text-xs text-muted-foreground">Limit</div>
              <div className="mt-1 text-xl font-semibold">{limit}</div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-xs text-muted-foreground">Iskorišteno</div>
              <div className="mt-1 text-xl font-semibold">
                {used} / {limit}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-xs text-muted-foreground">
                Reset limita
              </div>
              <div className="mt-1 text-sm font-medium">
                {resetDate.toLocaleDateString("hr-HR")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UPGRADE */}
      <Card>
        <CardHeader>
          <CardTitle>Upgrade plana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nadogradi plan za veći mjesečni limit poruka i prioritetnu podršku.
          </p>

          <Separator />

          <div className="grid gap-4 md:grid-cols-3">
            {/* BASIC */}
            <div className="rounded-xl border p-4">
              <div className="text-sm font-medium">Starter</div>
              <div className="mt-1 text-xs text-muted-foreground">
                1.000 poruka / mj.
              </div>
              <div className="mt-3 text-lg font-semibold">€9 / mj</div>
              <Button className="mt-4 w-full" variant="outline" disabled>
                Uskoro
              </Button>
            </div>

            {/* PRO */}
            <div className="rounded-xl border p-4">
              <div className="text-sm font-medium">Pro</div>
              <div className="mt-1 text-xs text-muted-foreground">
                5.000 poruka / mj.
              </div>
              <div className="mt-3 text-lg font-semibold">€29 / mj</div>
              <Button className="mt-4 w-full" disabled>
                Uskoro
              </Button>
            </div>

            {/* BUSINESS */}
            <div className="rounded-xl border p-4">
              <div className="text-sm font-medium">Business</div>
              <div className="mt-1 text-xs text-muted-foreground">
                20.000 poruka / mj.
              </div>
              <div className="mt-3 text-lg font-semibold">€79 / mj</div>
              <Button className="mt-4 w-full" variant="outline" disabled>
                Kontaktiraj nas
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            * Online naplata i automatski upgrade dolaze uskoro.
          </p>
        </CardContent>
      </Card>

      <Button asChild variant="outline">
        <Link href={`/${locale}/app/properties`}>← Natrag na dashboard</Link>
      </Button>
    </div>
  );
}