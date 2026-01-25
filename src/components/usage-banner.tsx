import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function monthKey(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function nextMonthDate() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export async function UsageBanner({ locale }: { locale: string }) {
  const supabase = await createSupabaseServer();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;

  // ako nije ulogiran – ništa
  if (!user) return null;

  const month = monthKey();

  const { data: profile } = await supabase
    .from("billing_profiles")
    .select("plan, monthly_limit")
    .eq("user_id", user.id)
    .single();

  const { data: usage } = await supabase
    .from("usage_monthly")
    .select("used")
    .eq("user_id", user.id)
    .eq("month", month)
    .maybeSingle();

  const plan = profile?.plan ?? "free";
  const limit = profile?.monthly_limit ?? 0;
  const used = usage?.used ?? 0;

  const pct = limit > 0 ? clamp01(used / limit) : 0;
  const resetDate = nextMonthDate();

  // Soft warning pragovi
  const isWarn = pct >= 0.8 && pct < 0.9;
  const isDanger = pct >= 0.9;

  const badgeText = isDanger ? "Upozorenje" : isWarn ? "Blizu limita" : "OK";
  const badgeVariant = isDanger ? "destructive" : isWarn ? "secondary" : "outline";

  // poruka
  const msg = isDanger
    ? "Skoro si na mjesečnom limitu. Preporuka: upgrade plana."
    : isWarn
      ? "Blizu si mjesečnog limita. Prati potrošnju."
      : "Potrošnja je unutar normalnih okvira.";

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Plan:</span>
            <Badge variant="outline" className="uppercase">
              {plan}
            </Badge>

            <Badge variant={badgeVariant as any}>{badgeText}</Badge>

            <span className="text-sm text-muted-foreground">
              {limit > 0 ? `${used}/${limit} poruka` : `${used} poruka`}
            </span>
          </div>

          <div className="mt-1 text-xs text-muted-foreground">{msg}</div>

          {/* progress bar (bez dodatne UI komponente) */}
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-foreground"
              style={{ width: `${Math.round(pct * 100)}%` }}
            />
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            Reset limita: {resetDate.toLocaleDateString("hr-HR")}
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/${locale}/app/billing`}>Billing</Link>
          </Button>

          {(isWarn || isDanger) && (
            <Button asChild size="sm">
              <Link href={`/${locale}/app/billing`}>Upgrade</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}