/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import QRCode from "qrcode";
import { createSupabaseServer } from "@/lib/supabase/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

function digitsOnlyPhone(e164: string) {
  return (e164 || "").replace(/[^\d]/g, "");
}

function buildWaMeLink(phoneE164: string, text: string) {
  const phone = digitsOnlyPhone(phoneE164);
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${encoded}`;
}

export default async function GuestInstructionsByCodePage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  const normalizedCode = (code || "").trim().toUpperCase();

  const supabase = await createSupabaseServer();

  // IMPORTANT: public page → do NOT require auth
  const { data: property } = await supabase
    .from("properties")
    .select("id,name,code")
    .eq("code", normalizedCode)
    .single();

  if (!property) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Guest instructions</h1>
        <p className="text-sm text-muted-foreground">
          Unknown property code: <span className="font-mono">{normalizedCode}</span>
        </p>
        <Button asChild variant="outline">
          <Link href={`/${locale}`}>Back</Link>
        </Button>
      </div>
    );
  }

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  if (!phone) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Guest instructions</h1>
        <p className="text-sm text-muted-foreground">
          Missing <span className="font-mono">NEXT_PUBLIC_WHATSAPP_NUMBER</span> env var.
        </p>
      </div>
    );
  }

  const prefill = `${property.code}: Hi! I have a question about my stay.`;
  const waLink = buildWaMeLink(phone, prefill);

  const qrDataUrl = await QRCode.toDataURL(waLink, {
    width: 320,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl">{property.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {property.code}
            </Badge>
            <span className="text-xs text-muted-foreground">Property code</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-6 md:grid-cols-[360px_1fr]">
            <div className="rounded-xl border p-4">
              <div className="text-sm font-medium">Scan to chat</div>
              <div className="mt-3 flex justify-center">
                <img src={qrDataUrl} alt="WhatsApp QR" className="h-auto w-[320px]" />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Opens WhatsApp and pre-fills your property code.
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border p-4">
                <div className="text-sm font-medium">EN</div>
                <Separator className="my-3" />
                <ol className="list-decimal space-y-2 pl-5 text-sm">
                  <li>Scan the QR code (or open the link below).</li>
                  <li>Send the pre-filled message (it includes the property code).</li>
                  <li>Ask any question — you’ll get an instant reply.</li>
                </ol>
              </div>

              <div className="rounded-xl border p-4">
                <div className="text-sm font-medium">HR</div>
                <Separator className="my-3" />
                <ol className="list-decimal space-y-2 pl-5 text-sm">
                  <li>Skeniraj QR kod (ili otvori link ispod).</li>
                  <li>Pošalji unaprijed pripremljenu poruku (sadrži kod objekta).</li>
                  <li>Postavi pitanje — dobit ćeš brz odgovor.</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-sm font-medium">Backup link (if QR doesn’t work)</div>
            <div className="mt-2 break-all rounded-md bg-muted p-3 font-mono text-xs">
              {waLink}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}