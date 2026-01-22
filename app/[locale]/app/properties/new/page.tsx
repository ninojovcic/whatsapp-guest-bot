import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

function normalizeCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export default async function NewPropertyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createSupabaseServer();

  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) redirect(`/${locale}/login`);

  async function createProperty(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "").trim();
    const codeRaw = String(formData.get("code") || "");
    const code = normalizeCode(codeRaw);
    const handoff_email = String(formData.get("handoff_email") || "").trim() || null;
    const languages = String(formData.get("languages") || "auto").trim() || "auto";
    const knowledge_text = String(formData.get("knowledge_text") || "").trim();

    if (!name || !code || !knowledge_text) {
      // Basic server validation: just bounce back
      redirect(`/${locale}/app/properties/new?error=missing`);
    }

    const supabase = await createSupabaseServer();
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) redirect(`/${locale}/login`);

    const { data, error } = await supabase
      .from("properties")
      .insert({
        name,
        code,
        knowledge_text,
        languages,
        handoff_email,
        owner_id: user.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Create property error:", error);
      redirect(`/${locale}/app/properties/new?error=save`);
    }

    redirect(`/${locale}/app/properties/${data.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">New property</h1>
          <p className="text-sm text-muted-foreground">
            Create a property code guests will use like <span className="font-mono">ANA123:</span>
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href={`/${locale}/app/properties`}>Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createProperty} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input name="name" placeholder="Villa Ana" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Code</label>
                <Input name="code" placeholder="ANA123" required />
                <p className="text-xs text-muted-foreground">
                  Guests will message: <span className="font-mono">CODE: question</span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Handoff email</label>
                <Input name="handoff_email" placeholder="owner@domain.com" />
                <p className="text-xs text-muted-foreground">
                  Where we forward questions when the bot doesn’t know.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Languages</label>
                <Input name="languages" defaultValue="auto" />
                <p className="text-xs text-muted-foreground">
                  Keep <span className="font-mono">auto</span> for “reply in guest language”.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Knowledge base</label>
              <Textarea
                name="knowledge_text"
                required
                rows={14}
                placeholder={`Facts:
- Check-in: after 15:00
- Check-out: until 10:00
- Parking: free
- Wi-Fi: ...
If unknown, forward to host.`}
              />
              <p className="text-xs text-muted-foreground">
                Tip: write in bullet points. The bot is instructed to use only this info.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit">Create property</Button>
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
