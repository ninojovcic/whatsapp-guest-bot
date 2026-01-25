import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Novi objekt",
};

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

    const address = String(formData.get("address") || "").trim() || null;

    const handoff_email =
      String(formData.get("handoff_email") || "").trim() || null;

    // ✅ FIX: zatvoren string literal
    const languages = String(formData.get("languages") || "auto").trim() || "auto";

    const knowledge_text = String(formData.get("knowledge_text") || "").trim();

    if (!name || !code || !knowledge_text) {
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
        address,
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
          <h1 className="text-2xl font-semibold">Novi objekt</h1>
          <p className="text-sm text-muted-foreground">
            Kreiraj kod objekta koji gosti koriste, npr.{" "}
            <span className="font-mono">ANA123:</span>
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href={`/${locale}/app/properties`}>Natrag</Link>
        </Button>
      </div>

      <Card className="rounded-3xl border border-foreground/10 bg-background/55 backdrop-blur">
        <CardHeader>
          <CardTitle>Detalji objekta</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={createProperty} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Naziv</label>
                <Input name="name" placeholder="Villa Ana" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Kod</label>
                <Input name="code" placeholder="ANA123" required />
                <p className="text-xs text-muted-foreground">
                  Gosti šalju: <span className="font-mono">KOD: pitanje</span>
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Adresa objekta</label>
                <Input
                  name="address"
                  placeholder="Ulica 1, 21000 Split, Hrvatska"
                />
                <p className="text-xs text-muted-foreground">
                  Pomaže AI-u kod općih informacija (lokacija, udaljenosti,
                  preporuke u blizini). Ako ne želiš, može ostati prazno.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email za prosljeđivanje (handoff)
                </label>
                <Input name="handoff_email" placeholder="owner@domain.com" />
                <p className="text-xs text-muted-foreground">
                  Ovdje šaljemo upite kada bot nema točnu informaciju.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Jezici</label>
                <Input name="languages" defaultValue="auto" />
                <p className="text-xs text-muted-foreground">
                  Ostavi <span className="font-mono">auto</span> za “odgovori na
                  jeziku gosta”.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Baza znanja</label>
              <Textarea
                name="knowledge_text"
                required
                rows={14}
                placeholder={`Činjenice:
- Check-in: nakon 15:00
- Check-out: do 10:00
- Parking: besplatan
- Wi-Fi: ...
Ako nema informacije, proslijedi domaćinu.`}
              />
              <p className="text-xs text-muted-foreground">
                Savjet: piši u bulletima. Bot je podešen da koristi samo ove
                informacije i da ne izmišlja.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit">Kreiraj objekt</Button>
              <Button variant="outline" asChild>
                <Link href={`/${locale}/app/properties`}>Odustani</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}