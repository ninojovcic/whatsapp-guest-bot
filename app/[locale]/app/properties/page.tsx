import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { CopyLinkButton } from "@/components/copy-link-button";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
          <h1 className="text-2xl font-semibold">Properties</h1>
          <p className="text-sm text-muted-foreground">
            Manage your properties and view guest messages.
          </p>
        </div>

        <Button asChild>
          <Link href={`/${locale}/app/properties/new`}>New property</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Your list</CardTitle>
          <Badge variant="secondary">{rows.length} total</Badge>
        </CardHeader>

        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              No properties yet. Create your first one.
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((p) => {
                // Dashboard print page (requires login, for the owner)
                const printPath = `/${locale}/app/properties/${p.id}/instructions`;

                // Public guest link (no login, for guests)
                const guestPath = `/g/${encodeURIComponent(p.code)}`;

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
                        Created: {new Date(p.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/${locale}/app/properties/${p.id}/messages`}>
                          Messages
                        </Link>
                      </Button>

                      <Button variant="outline" asChild>
                        <Link href={printPath}>Print</Link>
                      </Button>

                      <CopyLinkButton path={guestPath} />

                      <Button asChild>
                        <Link href={`/${locale}/app/properties/${p.id}`}>Edit</Link>
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
