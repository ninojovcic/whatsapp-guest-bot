import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function digitsOnlyPhone(e164: string) {
  return (e164 || "").replace(/[^\d]/g, "");
}

function buildWaMeChatLink(phoneE164: string, text?: string) {
  const phone = digitsOnlyPhone(phoneE164);
  if (!phone) return null;
  const base = `https://wa.me/${phone}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

// simple heuristic until we add a real DB column
function isHandoff(botReply: string | null) {
  const r = (botReply || "").toLowerCase();
  return (
    r.includes("forward") ||
    r.includes("proslijed") ||
    r.includes("proslijedit") ||
    r.includes("host") ||
    r.includes("vlasnik") ||
    r.includes("owner")
  );
}

function snippet(text: string | null, n = 140) {
  const t = (text || "").trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1) + "…";
}

function qs(params: { q?: string; page?: string }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.page) sp.set("page", params.page);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export default async function PropertyMessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { locale, id } = await params;
  const { q, page } = await searchParams;

  const supabase = await createSupabaseServer();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) redirect(`/${locale}/login`);

  // Load property (and ensure it belongs to the user)
  const { data: property } = await supabase
    .from("properties")
    .select("id,name,code,owner_id")
    .eq("id", id)
    .single();

  if (!property || property.owner_id !== user.id) {
    redirect(`/${locale}/app/properties`);
  }

  const query = (q || "").trim();
  const pageNum = Math.max(1, Number(page || "1") || 1);
  const pageSize = 20;
  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  let req = supabase
    .from("messages")
    .select("id, from_number, guest_message, bot_reply, created_at", { count: "exact" })
    .eq("property_id", property.id)
    .order("created_at", { ascending: false });

  if (query) {
    // OR filter across guest_message + bot_reply
    // Note: Supabase uses PostgREST filter syntax
    req = req.or(`guest_message.ilike.%${query}%,bot_reply.ilike.%${query}%`);
  }

  const { data: rows, count } = await req.range(from, to);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const nextPublicWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">{property.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {property.code}
            </Badge>
            <span className="text-sm text-muted-foreground">Messages</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/${locale}/app/properties`}>Back</Link>
          </Button>
          <Button asChild>
            <Link href={`/${locale}/app/properties/${id}`}>Edit</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg">Inbox</CardTitle>
          <Badge variant="secondary">{total} total</Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <form className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              name="q"
              defaultValue={query}
              placeholder="Search guest messages or bot replies…"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2">
              <Button type="submit" variant="outline">
                Search
              </Button>
              {query ? (
                <Button asChild variant="ghost">
                  <Link href={`/${locale}/app/properties/${id}/messages`}>Clear</Link>
                </Button>
              ) : null}
            </div>
          </form>

          <Separator />

          {/* List */}
          {!rows || rows.length === 0 ? (
            <div className="rounded-xl border p-6 text-sm text-muted-foreground">
              No messages yet.
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((m) => {
                const handoff = isHandoff(m.bot_reply);
                const guestPhone = m.from_number || "";
                const replyLink = buildWaMeChatLink(
                  guestPhone,
                  nextPublicWhatsApp
                    ? `Hi! This is the host of ${property.name}.`
                    : `Hi! This is the host of ${property.name}.`
                );

                return (
                  <div key={m.id} className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {guestPhone || "Unknown"}
                        </Badge>

                        {handoff ? (
                          <Badge>Handoff</Badge>
                        ) : (
                          <Badge variant="secondary">AI</Badge>
                        )}

                        <span className="text-xs text-muted-foreground">
                          {new Date(m.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {replyLink ? (
                          <Button asChild variant="outline">
                            <a href={replyLink} target="_blank" rel="noreferrer">
                              Reply in WhatsApp
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg bg-muted/40 p-3">
                        <div className="text-xs font-medium text-muted-foreground">
                          Guest
                        </div>
                        <div className="mt-1 text-sm">{snippet(m.guest_message, 260)}</div>
                      </div>

                      <div className="rounded-lg bg-muted/20 p-3">
                        <div className="text-xs font-medium text-muted-foreground">
                          Bot
                        </div>
                        <div className="mt-1 text-sm">{snippet(m.bot_reply, 260)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="text-sm text-muted-foreground">
              Page {pageNum} of {totalPages}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" asChild disabled={pageNum <= 1}>
  <Link
    href={`/${locale}/app/properties/${id}/messages${qs({
      q: query || undefined,
      page: String(Math.max(1, pageNum - 1)),
    })}`}
  >
    Prev
  </Link>
</Button>

<Button variant="outline" asChild disabled={pageNum >= totalPages}>
  <Link
    href={`/${locale}/app/properties/${id}/messages${qs({
      q: query || undefined,
      page: String(Math.min(totalPages, pageNum + 1)),
    })}`}
  >
    Next
  </Link>
</Button>


            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}