import Link from "next/link";
import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PrintButton } from "@/components/print-button";

export default async function InstructionsPage({
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

  // Guest-facing link (public)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const guestPath = `/g/${encodeURIComponent(property.code)}`;
  const guestUrl = baseUrl ? `${baseUrl}${guestPath}` : guestPath;

  const qrDataUrl = await QRCode.toDataURL(guestUrl, {
    width: 320,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          header, footer, nav { display: none !important; }
          .no-print { display: none !important; }
          .print-card { border: none !important; box-shadow: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Guest instructions</h1>
          <p className="text-sm text-muted-foreground">
            Print this and place it in the property (QR opens a simple guest page).
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/${locale}/app/properties`}>Back</Link>
          </Button>
          <PrintButton />
        </div>
      </div>

      <Card className="print-card">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">{property.name}</CardTitle>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {property.code}
              </Badge>
              <span className="text-xs text-muted-foreground">Property code</span>
            </div>
          </div>
          <div className="no-print">
            <Button variant="outline" asChild>
              <Link href={`/${locale}/app/properties/${id}`}>Edit property</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-6 md:grid-cols-[360px_1fr]">
            <div className="rounded-xl border p-4">
              <div className="text-sm font-medium">Scan to chat</div>
              <div className="mt-3 flex justify-center">
                <img src={qrDataUrl} alt="Guest QR" className="h-auto w-[320px]" />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Opens the guest page with the correct property already selected.
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border p-4">
                <div className="text-sm font-medium">EN</div>
                <Separator className="my-3" />
                <ol className="list-decimal space-y-2 pl-5 text-sm">
                  <li>Scan the QR code (or open the link below).</li>
                  <li>Tap “Open WhatsApp”.</li>
                  <li>Ask any question — you’ll get an instant reply.</li>
                </ol>
              </div>

              <div className="rounded-xl border p-4">
                <div className="text-sm font-medium">HR</div>
                <Separator className="my-3" />
                <ol className="list-decimal space-y-2 pl-5 text-sm">
                  <li>Skeniraj QR kod (ili otvori link ispod).</li>
                  <li>Klikni “Otvori WhatsApp”.</li>
                  <li>Postavi pitanje — dobit ćeš brz odgovor.</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-sm font-medium">Backup link (if QR doesn’t work)</div>
            <div className="mt-2 break-all rounded-md bg-muted p-3 font-mono text-xs">
              {guestUrl}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
