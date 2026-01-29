import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { CopyLinkButton } from "@/components/copy-link-button";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Objekti",
};

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
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">Objekti</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upravljaj objektima i pregledaj poruke gostiju.
          </p>
        </div>

        <Button asChild className="rounded-2xl">
          <Link href={`/${locale}/app/properties/new`}>+ Novi objekt</Link>
        </Button>
      </div>

      {/* List */}
      <Card className="rounded-3xl border border-foreground/10 bg-background/55 backdrop-blur">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Popis objekata</CardTitle>
          <Badge variant="secondary">{rows.length} ukupno</Badge>
        </CardHeader>

        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-foreground/10 bg-background/40 p-6 text-sm text-muted-foreground">
              Još nemaš nijedan objekt. Kreiraj prvi objekt.
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((p) => {
                const printPath = `/${locale}/app/properties/${p.id}/instructions`;
                const guestPath = `/${locale}/g/${p.code}`;

                return (
                  <div
                    key={p.id}
                    className="flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-sm font-semibold">
                          {p.name}
                        </div>
                        <Badge variant="outline" className="font-mono">
                          {p.code}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Kreirano:{" "}
                        {new Date(p.created_at).toLocaleString("hr-HR")}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" className="rounded-2xl">
                        <Link
                          href={`/${locale}/app/properties/${p.id}/messages`}
                        >
                          Poruke
                        </Link>
                      </Button>

                      <Button asChild variant="outline" className="rounded-2xl">
                        <Link href={printPath}>Ispis</Link>
                      </Button>

                      <CopyLinkButton path={guestPath} />

                      <Button asChild className="rounded-2xl">
                        <Link href={`/${locale}/app/properties/${p.id}`}>
                          Uredi
                        </Link>
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
