import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

function isFallbackReply(reply?: string | null) {
  if (!reply) return false;
  return /i don't have that information|i dont have that information|forward your question/i.test(reply);
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Basic escape for Supabase ilike pattern usage.
// We keep it simple: strip newlines, trim, limit length.
function normalizeQuery(q: string) {
  return q.replace(/\s+/g, " ").trim().slice(0, 80);
}

export default async function PropertyMessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams?: Promise<{ q?: string; page?: string }>;
}) {
  const { locale, id } = await params;
  const sp = (await searchParams) ?? {};

  const q = normalizeQuery(sp.q ?? "");
  const page = clampInt(Number(sp.page ?? "1") || 1, 1, 9999);

  const PAGE_SIZE = 25;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createSupabaseServer();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) redirect(`/${locale}/login`);

  const { data: property } = await supabase
    .from("properties")
    .select("id,name,code")
    .eq("id", id)
    .single();

  if (!property) redirect(`/${locale}/app/properties`);

  // Build messages query (with count for pagination)
  let messagesQuery = supabase
    .from("messages")
    .select("id, from_number, to_number, guest_message, bot_reply, created_at", { count: "exact" })
    .eq("property_id", id);

  if (q) {
    // Search both guest_message and bot_reply
    // Note: Supabase expects OR syntax: "col.ilike.%q%,col2.ilike.%q%"
    const pattern = `%${q}%`;
    messagesQuery = messagesQuery.or(
      `guest_message.ilike.${pattern},bot_reply.ilike.${pattern}`
    );
  }

  const { data: messages, error, count } = await messagesQuery
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) console.error("Messages fetch error:", error);

  const rows = messages ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // If user manually types a page number out of range, clamp by redirecting
  if (page > totalPages && totalPages > 0) {
    const qp = new URLSearchParams();
    if (q) qp.set("q", q);
    qp.set("page", String(totalPages));
    redirect(`/${locale}/app/properties/${id}/messages?${qp.toString()}`);
  }

  const makeHref = (p: number) => {
    const qp = new URLSearchParams();
    if (q) qp.set("q", q);
    qp.set("page", String(p));
    return `/${locale}/app/properties/${id}/messages?${qp.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <p className="text-sm text-muted-foreground">
            {property.name} • Code: <span className="font-mono">{property.code}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/${locale}/app/properties`}>Back</Link>
          </Button>
          <Button asChild>
            <Link href={`/${locale}/app/properties/${id}`}>Edit property</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Messages</CardTitle>
            <p className="text-xs text-muted-foreground">
              {total} total • Page {page} of {totalPages}
            </p>
          </div>

          {/* Search (GET) */}
          <form className="flex w-full gap-2 sm:w-[420px]" method="GET">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search guest messages or bot replies…"
            />
            <input type="hidden" name="page" value="1" />
            <Button type="submit">Search</Button>
          </form>
        </CardHeader>

        <CardContent className="space-y-4">
          {rows.length === 0 ? (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              {q ? (
                <>
                  No results for <span className="font-mono">{q}</span>.
                  <div className="mt-3">
                    <Button variant="outline" asChild>
                      <Link href={makeHref(1)}>Clear search</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  No messages yet. Send a WhatsApp message using:
                  <div className="mt-2 rounded-md bg-muted p-3 font-mono text-xs">
                    {property.code}: Do you have parking?
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {rows.map((m) => {
                  const fallback = isFallbackReply(m.bot_reply);
                  const time = new Date(m.created_at).toLocaleString();

                  return (
                    <div key={m.id} className="rounded-xl border p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-medium">{time}</div>

                        {fallback ? (
                          <Badge variant="destructive">Handoff / Unknown</Badge>
                        ) : (
                          <Badge variant="secondary">Answered</Badge>
                        )}

                        <div className="ml-auto text-xs text-muted-foreground">
                          From: <span className="font-mono">{m.from_number || "-"}</span>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground">Guest</div>
                          <div className="mt-1 whitespace-pre-wrap text-sm">
                            {m.guest_message}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-muted-foreground">Bot</div>
                          <div
                            className={`mt-1 whitespace-pre-wrap text-sm ${
                              fallback ? "text-red-600" : ""
                            }`}
                          >
                            {m.bot_reply || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-muted-foreground">
                  Showing {from + 1}-{Math.min(from + PAGE_SIZE, total)} of {total}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" disabled={page <= 1} asChild={page > 1}>
                    {page > 1 ? (
                      <Link href={makeHref(page - 1)}>Prev</Link>
                    ) : (
                      <span>Prev</span>
                    )}
                  </Button>

                  <Badge variant="outline" className="px-3 py-1">
                    {page} / {totalPages}
                  </Badge>

                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    asChild={page < totalPages}
                  >
                    {page < totalPages ? (
                      <Link href={makeHref(page + 1)}>Next</Link>
                    ) : (
                      <span>Next</span>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
