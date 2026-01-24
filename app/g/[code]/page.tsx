import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

function sanitizeCode(input: string) {
  return input.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
}

export default async function GuestEntryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cleanCode = sanitizeCode(code);

  const { data: property } = await supabase
    .from("properties")
    .select("name, code")
    .eq("code", cleanCode)
    .maybeSingle();

  if (!property) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-semibold">Invalid link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This property code was not found.
        </p>
      </div>
    );
  }

  // Prefill message format your bot expects: CODE: message
  const prefill = encodeURIComponent(`${property.code}: Hi! I have a question. / Pozdrav! Imam pitanje.`);
  const waLink = `https://wa.me/?text=${prefill}`;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 p-6">
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">Gostly Guest Assistant</div>
        <h1 className="text-2xl font-semibold">{property.name}</h1>
        <p className="text-sm text-muted-foreground">
          Tap below to open WhatsApp with your property code pre-filled.
        </p>
      </div>

      <a
        href={waLink}
        className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-medium text-white hover:opacity-90"
      >
        Open WhatsApp
      </a>

      <div className="rounded-xl border p-4 text-sm">
        <div className="font-medium">How it works</div>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-muted-foreground">
          <li>WhatsApp opens with a message template.</li>
          <li>Write your question and send.</li>
          <li>The AI answers instantly or forwards to the host.</li>
        </ol>
      </div>

      <div className="text-xs text-muted-foreground">
        If WhatsApp doesn’t open, copy this code:{" "}
        <span className="font-mono">{property.code}</span>
      </div>

      <Link href="/" className="text-xs underline opacity-80 hover:opacity-100">
        Powered by Gostly
      </Link>
    </div>
  );
}
