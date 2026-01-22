import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function isFallbackReply(reply?: string | null) {
  if (!reply) return false;
  return /i don't have that information|i dont have that information|forward your question/i.test(reply);
}

export default async function PropertyMessagesPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

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

  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, from_number, to_number, guest_message, bot_reply, created_at")
    .eq("property_id", id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Messages fetch error:", error);
  }

  const rows = messages ?? [];

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
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Latest messages</CardTitle>
          <p className="text-xs text-muted-foreground">Showing last {rows.length} items</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {rows.length === 0 ? (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              No messages yet. Send a WhatsApp message using:
              <div className="mt-2 rounded-md bg-muted p-3 font-mono text-xs">
                {property.code}: Do you have parking?
              </div>
            </div>
          ) : (
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
                        <div className="mt-1 whitespace-pre-wrap text-sm">{m.guest_message}</div>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
