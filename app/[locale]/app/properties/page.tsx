import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Failed to load properties.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Properties</h1>
        <Button asChild>
          <Link href={`/${locale}/app/properties/new`}>New property</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your list</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(properties || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No properties yet. Create your first one.
            </p>
          ) : (
            <div className="divide-y">
              {properties!.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Code: <span className="font-mono">{p.code}</span>
                    </div>
                  </div>

                  <Button variant="outline" asChild>
                    <Link href={`/${locale}/app/properties/${p.id}`}>Edit</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
