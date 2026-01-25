import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { createSupabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { AnalyticsCharts } from "@/components/analytics-charts";

export const metadata: Metadata = {
  title: "Analitika",
};

function isHandoff(botReply: string | null) {
  const r = (botReply || "").toLowerCase();
  return (
    r.includes("forward") ||
    r.includes("proslijed") ||
    r.includes("proslijedit") ||
    r.includes("host") ||
    r.includes("vlasnik") ||
    r.includes("owner") ||
    r.includes("escalat") ||
    r.includes("domaćin")
  );
}

function dayKey(iso: string) {
  // YYYY-MM-DD
  return iso.slice(0, 10);
}

function clampRange(val: string | undefined) {
  const n = Number(val || "30");
  if (n === 7 || n === 30 || n === 90) return n;
  return 30;
}

function fmtPct(n: number) {
  return `${Math.round(n * 100)}%`;
}

/** Minimal sparkline (SVG, bez libova) */
function Sparkline({ values }: { values: number[] }) {
  const w = 160;
  const h = 40;
  const pad = 4;

  const v = values.length ? values : [0];
  const min = Math.min(...v);
  const max = Math.max(...v);
  const denom = max - min || 1;

  const pts = v
    .map((val, i) => {
      const x = pad + (i * (w - pad * 2)) / Math.max(1, v.length - 1);
      const y = h - pad - ((val - min) * (h - pad * 2)) / denom;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="opacity-90"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={pts}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Top keywords (bez LLM-a): tokenizacija + brojenje */
const STOP = new Set([
  // HR (minimal)
  "i",
  "a",
  "ali",
  "da",
  "je",
  "su",
  "sam",
  "smo",
  "ste",
  "se",
  "na",
  "u",
  "za",
  "od",
  "do",
  "iz",
  "koji",
  "koja",
  "koje",
  "što",
  "kako",
  "kada",
  "gdje",
  "koliko",
  "može",
  "molim",
  "hvala",
  "dali",
  "li",
  "mi",
  "ti",
  "vi",
  "vama",
  "nama",
  "ovo",
  "to",
  "tko",
  // EN (minimal)
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "for",
  "in",
  "on",
  "at",
  "is",
  "are",
  "was",
  "were",
  "be",
  "with",
  "from",
  "please",
  "thanks",
  "thank",
]);

function topKeywords(texts: (string | null)[], limit = 12) {
  const counts = new Map<string, number>();

  for (const t of texts) {
    const s = (t || "")
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!s) continue;

    for (const token of s.split(" ")) {
      if (!token) continue;
      if (token.length < 3) continue;
      if (STOP.has(token)) continue;
      counts.set(token, (counts.get(token) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k, v]) => ({ k, v }));
}

export default async function AnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    range?: string; // 7 | 30 | 90
    property?: string; // property_id
    q?: string; // search text
  }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const rangeDays = clampRange(sp.range);
  const propertyId = (sp.property || "").trim();
  const query = (sp.q || "").trim();

  const supabase = await createSupabaseServer();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) redirect(`/${locale}/login`);

  // Load properties for filter dropdown
  const { data: properties } = await supabase
    .from("properties")
    .select("id,name,code,created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const propsRows = properties ?? [];

  // Calculate from date
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - rangeDays);
  const fromISO = fromDate.toISOString();

  // Fetch messages in range (optionally filtered by property)
  let req = supabase
    .from("messages")
    .select(
      "id, property_id, from_number, guest_message, bot_reply, created_at, properties:properties(name,code)",
      { count: "exact" }
    )
    .gte("created_at", fromISO)
    .order("created_at", { ascending: true });

  // Restrict to owner's properties
  const ownerPropertyIds = propsRows.map((p) => p.id);
  if (ownerPropertyIds.length > 0) {
    req = req.in("property_id", ownerPropertyIds);
  }

  if (propertyId) req = req.eq("property_id", propertyId);

  if (query) {
    req = req.or(`guest_message.ilike.%${query}%,bot_reply.ilike.%${query}%`);
  }

  const { data: messages, count } = await req;

  type MsgRow = {
    id: string;
    property_id: string;
    from_number: string | null;
    guest_message: string | null;
    bot_reply: string | null;
    created_at: string;
    properties: { name: string; code: string }[] | null; // ✅ array (Supabase join)
  };

  // ✅ safest cast (izbjegava TS “insufficient overlap”)
  const rows = ((messages ?? []) as unknown) as MsgRow[];

  // Aggregate stats
  const total = count ?? rows.length;
  const uniqueGuestsSet = new Set<string>();
  let handoffCount = 0;

  const perDayMap = new Map<
    string,
    { day: string; total: number; ai: number; handoff: number }
  >();

  const perPropertyMap = new Map<
    string,
    { property_id: string; name: string; code: string; total: number; handoff: number }
  >();

  for (const m of rows) {
    if (m.from_number) uniqueGuestsSet.add(m.from_number);

    const handoff = isHandoff(m.bot_reply);
    if (handoff) handoffCount += 1;

    const d = dayKey(m.created_at);
    const cur = perDayMap.get(d) || { day: d, total: 0, ai: 0, handoff: 0 };
    cur.total += 1;
    if (handoff) cur.handoff += 1;
    else cur.ai += 1;
    perDayMap.set(d, cur);

    const propName = m.properties?.[0]?.name || "Nepoznati objekt";
    const propCode = m.properties?.[0]?.code || "—";
    const propCur =
      perPropertyMap.get(m.property_id) || {
        property_id: m.property_id,
        name: propName,
        code: propCode,
        total: 0,
        handoff: 0,
      };
    propCur.total += 1;
    if (handoff) propCur.handoff += 1;
    perPropertyMap.set(m.property_id, propCur);
  }

  // Fill missing days in range for nicer charts
  const filledDays: Array<{ day: string; total: number; ai: number; handoff: number }> =
    [];
  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(0, 0, 0, 0);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const k = d.toISOString().slice(0, 10);
    const v = perDayMap.get(k) || { day: k, total: 0, ai: 0, handoff: 0 };
    filledDays.push(v);
  }

  const uniqueGuests = uniqueGuestsSet.size;
  const handoffRatePct = total > 0 ? Math.round((handoffCount / total) * 100) : 0;

  const topProperties = Array.from(perPropertyMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Sparkline: daily handoff rate (0..1)
  const handoffSpark = filledDays.map((d) => (d.total > 0 ? d.handoff / d.total : 0));

  // Top keywords (iz guest poruka)
  const keywords = topKeywords(rows.map((r) => r.guest_message), 12);

  // helpers for keeping query string in links
  const basePath = `/${locale}/app/logs`;
  const qs = (next: { range?: number; property?: string; q?: string }) => {
    const p = new URLSearchParams();
    p.set("range", String(next.range ?? rangeDays));
    if (next.property ?? propertyId) p.set("property", next.property ?? propertyId);
    if (next.q ?? query) p.set("q", next.q ?? query);
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  const exportHref = `/${locale}/app/logs/export${qs({})}`;

  const selectedProperty =
    propertyId && propsRows.find((p) => p.id === propertyId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">Analitika</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pregled poruka, handoffa i trendova — za zadnjih {rangeDays} dana.
          </p>
          {selectedProperty ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Filtrirano</Badge>
              <Badge variant="outline" className="font-mono">
                {selectedProperty.code}
              </Badge>
              <span className="text-sm text-muted-foreground truncate">
                {selectedProperty.name}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={exportHref}>Export CSV</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${locale}/app/properties`}>Objekti</Link>
          </Button>
          <Button asChild>
            <Link href={`/${locale}/app/properties/new`}>+ Novi objekt</Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-3xl border border-foreground/10 bg-background/55 backdrop-blur">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Filteri</CardTitle>
          <Badge variant="secondary">{total} poruka</Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-[220px_220px_1fr_auto] md:items-end">
            {/* Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <select
                name="range"
                defaultValue={String(rangeDays)}
                className="w-full rounded-xl border border-foreground/10 bg-background/40 px-3 py-2 text-sm outline-none"
              >
                <option value="7">Zadnjih 7 dana</option>
                <option value="30">Zadnjih 30 dana</option>
                <option value="90">Zadnjih 90 dana</option>
              </select>
            </div>

            {/* Property */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Objekt</label>
              <select
                name="property"
                defaultValue={propertyId}
                className="w-full rounded-xl border border-foreground/10 bg-background/40 px-3 py-2 text-sm outline-none"
              >
                <option value="">Svi objekti</option>
                {propsRows.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Pretraga</label>
              <input
                name="q"
                defaultValue={query}
                placeholder="Traži po poruci gosta ili odgovoru bota…"
                className="w-full rounded-xl border border-foreground/10 bg-background/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="rounded-2xl">
                Primijeni
              </Button>
              {(propertyId || query || rangeDays !== 30) && (
                <Button asChild variant="outline" className="rounded-2xl">
                  <Link href={basePath}>Reset</Link>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-3xl border border-foreground/10 bg-background/55 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Ukupno poruka</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{total}</CardContent>
        </Card>

        <Card className="rounded-3xl border border-foreground/10 bg-background/55 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Jedinstveni gosti</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{uniqueGuests}</CardContent>
        </Card>

        {/* ✅ WOW KPI: handoff rate + sparkline */}
        <Card className="rounded-3xl border border-foreground/10 bg-background/55 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Handoff rate</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between gap-3">
            <div>
              <div className="text-3xl font-semibold tracking-tight">
                {handoffRatePct}%
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {handoffCount} proslijeđeno • {Math.max(0, total - handoffCount)} AI
              </div>
            </div>
            <div className="text-emerald-300">
              <Sparkline values={handoffSpark} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-foreground/10 bg-background/55 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Prosjek / dan</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {rangeDays > 0 ? Math.round(total / rangeDays) : 0}
          </CardContent>
        </Card>
      </div>

      {/* Top upiti (keywords) */}
      <Card className="rounded-3xl border border-foreground/10 bg-background/55 backdrop-blur">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Top upiti</CardTitle>
          <Badge variant="secondary">zadnjih {rows.length}</Badge>
        </CardHeader>
        <CardContent>
          {keywords.length === 0 ? (
            <div className="rounded-2xl border border-foreground/10 bg-background/40 p-5 text-sm text-muted-foreground">
              Još nema dovoljno poruka za analizu.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {keywords.map(({ k, v }) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/40 px-3 py-1 text-xs"
                >
                  <span className="font-semibold">{k}</span>
                  <span className="text-muted-foreground">{v}</span>
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 text-xs text-muted-foreground">
            (Bez LLM-a: tokenizacija + brojenje. Super brzo.)
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card className="rounded-3xl border border-foreground/10 bg-background/55 backdrop-blur">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Trend poruka</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">AI + Handoff</Badge>
            <Badge variant="outline">{rangeDays} dana</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnalyticsCharts data={filledDays} />
          <Separator />
          <div className="text-xs text-muted-foreground">
            Napomena: Handoff se trenutno prepoznaje heuristikom (ključne riječi u odgovoru bota).
            Kad dodaš pravi DB stupac (npr. <span className="font-mono">handoff=true</span>),
            zamijenimo heuristiku i sve bude 100% točno.
          </div>
        </CardContent>
      </Card>

      {/* Top properties */}
      <Card className="rounded-3xl border border-foreground/10 bg-background/55 backdrop-blur">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Top objekti</CardTitle>
          <Badge variant="secondary">Top 5</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {topProperties.length === 0 ? (
            <div className="rounded-2xl border border-foreground/10 bg-background/40 p-5 text-sm text-muted-foreground">
              Nema poruka u odabranom periodu.
            </div>
          ) : (
            topProperties.map((p) => (
              <div
                key={p.property_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-background/40 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-sm font-semibold">{p.name}</div>
                    <Badge variant="outline" className="font-mono">
                      {p.code}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Handoff: {p.handoff} • AI: {Math.max(0, p.total - p.handoff)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{p.total} poruka</Badge>
                  <Button asChild variant="outline" className="rounded-2xl">
                    <Link href={`${basePath}${qs({ property: p.property_id })}`}>
                      Filtriraj
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}