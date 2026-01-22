import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function normalizeCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export default async function PropertyEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const supabase = await createSupabaseServer();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) redirect(`/${locale}/login`);

  const { data: property, error } = await supabase
    .from("properties")
    .select("id, name, code, knowledge_text, languages, handoff_email, created_at")
    .eq("id", id)
    .single();

  if (error || !property) redirect(`/${locale}/app/properties`);

  async function save(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "").trim();
    const code = normalizeCode(String(formData.get("code") || ""));
    const handoff_email = String(formData.get("handoff_email") || "").trim() || null;
    const languages = String(formData.get("languages") || "auto").trim() || "auto";
    const knowledge_text = String(formData.get("knowledge_text") || "").trim();

    if (!name || !code || !knowledge_text) {
      redirect(`/${locale}/app/properties/${id}?error=missing`);
    }

    const supabase = await createSupabaseServer();
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) redirect(`/${locale}/login`);

    const { error } = await supabase
      .from("properties")
      .update({
        name,
        code,
        knowledge_text,
        languages,
        handoff_email,
      })
      .eq("id", id);

    if (error) {
      console.error("Update property error:", error);
      redirect(`/${locale}/app/properties/${id}?error=save`);
    }

    redirect(`/${locale}/app/properties/${id}?saved=1`);
  }

  async function remove() {
    "use server";

    const supabase = await createSupabaseServer();
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) redirect(`/${locale}/login`);

    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      console.error("Delete property error:", error);
      redirect(`/${locale}/app/properties/${id}?error=delete`);
    }

    redirect(`/${locale}/app/properties`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{property.name}</h1>
          <p className="text-sm text-muted-foreground">
            Guest code: <span className="font-mono">{property.code}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/${locale}/app/properties`}>Back</Link>
          </Button>
          <form action={remove}>
            <Button variant="destructive" type="submit">
              Delete
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={save} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input name="name" defaultValue={property.name} required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Code</label>
                <Input name="code" defaultValue={property.code} required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Handoff email</label>
                <Input name="handoff_email" defaultValue={property.handoff_email ?? ""} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Languages</label>
                <Input name="languages" defaultValue={property.languages ?? "auto"} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Knowledge base</label>
              <Textarea
                name="knowledge_text"
                rows={14}
                required
                defaultValue={property.knowledge_text}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit">Save changes</Button>
              <Button variant="outline" asChild>
                <Link href={`/${locale}/app/properties`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
