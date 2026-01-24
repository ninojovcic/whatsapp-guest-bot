/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function digitsOnlyPhone(e164: string) {
  return (e164 || "").replace(/[^\d]/g, "");
}

function buildWaMeLink(phoneE164: string, text: string) {
  const phone = digitsOnlyPhone(phoneE164);
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${encoded}`;
}

const copy = {
  en: {
    title: "Chat with your host assistant",
    subtitle:
      "This will open WhatsApp with your property code prefilled, so you get faster help.",
    howTitle: "How it works",
    steps: [
      "Tap “Open WhatsApp”.",
      "Send the prefilled message (it includes your property code).",
      "Ask any question — you’ll get an instant reply.",
    ],
    questionLabel: "Optional: type your question",
    questionPlaceholder: "Example: Do you have parking? What’s the Wi-Fi password?",
    open: "Open WhatsApp",
    copyMsg: "Copy message",
    copied: "Copied ✅",
    codeLabel: "Property code",
    back: "Back to website",
    missingPhone:
      "Missing NEXT_PUBLIC_WHATSAPP_NUMBER env var. Ask the owner to configure it.",
  },
  hr: {
    title: "Chat s asistentom za smještaj",
    subtitle:
      "Ovo će otvoriti WhatsApp s unaprijed upisanim kodom objekta, tako da brže dobiješ pomoć.",
    howTitle: "Kako radi",
    steps: [
      "Klikni “Otvori WhatsApp”.",
      "Pošalji unaprijed pripremljenu poruku (sadrži kod objekta).",
      "Postavi pitanje — dobit ćeš brz odgovor.",
    ],
    questionLabel: "Opcionalno: upiši pitanje",
    questionPlaceholder: "Primjer: Imate li parking? Koja je lozinka za Wi-Fi?",
    open: "Otvori WhatsApp",
    copyMsg: "Kopiraj poruku",
    copied: "Kopirano ✅",
    codeLabel: "Kod objekta",
    back: "Natrag na web",
    missingPhone:
      "Nedostaje env var NEXT_PUBLIC_WHATSAPP_NUMBER. Vlasnik to mora postaviti.",
  },
};

export default async function GuestCodePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ lang?: string }>;
}) {
  const { code } = await params;
  const sp = (await searchParams) || {};
  const lang = sp.lang === "hr" ? "hr" : "en";
  const t = copy[lang];

  const propertyCode = decodeURIComponent(code || "").trim().toUpperCase();
  if (!propertyCode) redirect("/");

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  if (!phone) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{t.missingPhone}</p>
            <Button asChild variant="outline">
              <Link href="/">{t.back}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default message guests send
  const baseMessage = `${propertyCode}: Hi! I have a question about my stay.`;

  // Toggle language links (preserve code)
  const hrUrl = `/g/${encodeURIComponent(propertyCode)}?lang=hr`;
  const enUrl = `/g/${encodeURIComponent(propertyCode)}?lang=en`;

  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* Tiny client script for input + copy + open */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function () {
  const code = ${JSON.stringify(propertyCode)};
  const base = ${JSON.stringify(baseMessage)};
  const phone = ${JSON.stringify(phone)};
  const input = document.getElementById("q");
  const openBtn = document.getElementById("open");
  const copyBtn = document.getElementById("copy");
  const msgBox = document.getElementById("msg");

  function digitsOnlyPhone(e164){ return (e164||"").replace(/[^\\d]/g,""); }
  function buildLink(text){
    const p = digitsOnlyPhone(phone);
    return "https://wa.me/" + p + "?text=" + encodeURIComponent(text);
  }

  function currentMessage(){
    const extra = (input && input.value || "").trim();
    return extra ? (code + ": " + extra) : base;
  }

  function sync(){
    const msg = currentMessage();
    if (msgBox) msgBox.textContent = msg;
    if (openBtn) openBtn.setAttribute("href", buildLink(msg));
  }

  if (input) input.addEventListener("input", sync);

  if (copyBtn) {
    copyBtn.addEventListener("click", async function(){
      try {
        await navigator.clipboard.writeText(currentMessage());
        const original = copyBtn.textContent;
        copyBtn.textContent = ${JSON.stringify(t.copied)};
        setTimeout(() => copyBtn.textContent = original, 1200);
      } catch(e) {}
    });
  }

  sync();
})();`,
        }}
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {propertyCode}
          </Badge>
          <span className="text-xs text-muted-foreground">{t.codeLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={lang === "en" ? "secondary" : "outline"} asChild size="sm">
            <Link href={enUrl}>EN</Link>
          </Button>
          <Button variant={lang === "hr" ? "secondary" : "outline"} asChild size="sm">
            <Link href={hrUrl}>HR</Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">{t.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border p-4">
              <div className="text-sm font-medium">{t.howTitle}</div>
              <Separator className="my-3" />
              <ol className="list-decimal space-y-2 pl-5 text-sm">
                {t.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-sm font-medium">{t.questionLabel}</div>
              <Separator className="my-3" />
              <input
                id="q"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder={t.questionPlaceholder}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild>
                  <a id="open" href={buildWaMeLink(phone, baseMessage)} target="_blank" rel="noreferrer">
                    {t.open}
                  </a>
                </Button>
                <Button id="copy" type="button" variant="outline">
                  {t.copyMsg}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-sm font-medium">Message preview</div>
            <div
              id="msg"
              className="mt-2 whitespace-pre-wrap break-words rounded-md bg-muted p-3 font-mono text-xs"
            >
              {baseMessage}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              (This is exactly what will be sent on WhatsApp.)
            </div>
          </div>

          <div className="flex justify-between">
            <Button asChild variant="ghost">
              <Link href="/">{t.back}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}