import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function monthKeyUTC(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default async function PropertiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const supabase = await createSupabaseServer();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;

  if (!user) redirect(`/${locale}/login`);

  // --- USAGE BANNER DATA (billing_profiles + usage_monthly) ---
  const month = monthKeyUTC();

  // 1) billing profile (ensure exists)
  let plan = "free";
  let limit = 100;

  const { data: profile, error: profileErr } = await supabase
    .from("billing_profiles")
    .select("user_id, plan, monthly_limit")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileErr) {
    console.error("billing_profiles fetch error:", profileErr);
  }

  if (!profile) {
    // create default profile if missing
    const { data: created, error: createErr } = await supabase
      .from("billing_profiles")
      .insert({ user_id: user.id, plan: "free", monthly_limit: 100 })
      .select("plan, monthly_limit")
      .single();

    if (createErr) {
      console.error("billing_profiles create error:", createErr);
    } else {
      plan = created?.plan ?? plan;
      limit = Number(created?.monthly_limit ?? limit);
    }
  } else {
    plan = profile.plan ?? plan;
    limit = Number(profile.monthly_limit ?? limit);
  }

  // 2) usage row
  const { data: usageRow, error: usageErr } = await supabase
    .from("usage_monthly")
    .select("used")
    .eq("user_id", user.id)
    .eq("month", month)
    .maybeSingle();

  if (usageErr) {
    console.error("usage_monthly fetch error:", usageErr);
  }

  const used = Number(usageRow?.used ?? 0);

  const pct = limit > 0 ? clamp(Math.round((used / limit) * 100), 0, 100) : 0;
  const nearLimit = limit > 0 && used >= Math.floor(limit * 0.8);
  const atLimit = limit > 0 && used >= limit;

  // --- PROPERTIES LIST ---
  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, code, name, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("properties fetch error:", error);
  }

  const rows = properties ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Objekti</h1>
          <p className="text-sm text-muted-foreground">
            Uređuj objekte i pregledaj poruke gostiju.
          </p>
        </div>

        <Button asChild>
          <Link href={`/${locale}/app/properties/new`}>Novi objekt</Link>
        </Button>
      </div>

      {/* ✅ Usage banner */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg">Mjesečna potrošnja</CardTitle>

          {/* Badge variant-safe (boja preko className) */}
          <Badge
            variant={nearLimit || atLimit ? "secondary" : "outline"}
            className={atLimit ? "text-destructive" : undefined}
          >
            Plan: {String(plan).toUpperCase()}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm">
              Poruke ovaj mjesec:{" "}
              <span className="font-semibold">
                {used} / {limit}
              </span>{" "}
              <span className="text-muted-foreground">({month})</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/${locale}/billing`}>Plan & naplata</Link>
              </Button>
              <Button asChild>
                <Link href={`/${locale}/pricing`}>Nadogradi</Link>
              </Button>
            </div>
          </div>

          {/* progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          {atLimit ? (
            <div className="text-sm text-destructive">
              Dosegnuo si limit. Bot blokira nove poruke dok ne krene novi mjesec ili
              dok ne nadogradiš plan.
            </div>
          ) : nearLimit ? (
            <div className="text-sm text-muted-foreground">
              Blizu si limita. Razmisli o nadogradnji kako gosti ne bi dobili blokadu.
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Sve je OK. Limit se resetira svaki mjesec.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Properties list */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Popis</CardTitle>
          <Badge variant="secondary">{rows.length} ukupno</Badge>
        </CardHeader>

        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              Nema objekata. Kreiraj prvi objekt.
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((p) => {
                const instructionsPath = `/${locale}/app/properties/${p.id}/instructions`;

                return (
                  <div
                    key={p.id}
                    className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-base font-semibold">{p.name}</div>
                        <Badge variant="outline" className="font-mono">
                          {p.code}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Kreirano: {new Date(p.created_at).toLocaleString("hr-HR")}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/${locale}/app/properties/${p.id}/messages`}>
                          Poruke
                        </Link>
                      </Button>

                      <Button variant="outline" asChild>
                        <Link href={instructionsPath}>Upute / Print</Link>
                      </Button>

                      <Button asChild>
                        <Link href={`/${locale}/app/properties/${p.id}`}>Uredi</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}