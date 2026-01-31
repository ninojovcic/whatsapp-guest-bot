import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { sendHandoffEmail } from "@/lib/email";
import { checkAndIncrementUsage } from "@/lib/usage";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

function wantsHuman(text: string) {
  return /(human|host|owner|agent|call|čovjek|dom[ać]in|vlasnik|nazovi)/i.test(
    text
  );
}

// IMPORTANT: keep this narrow; otherwise handoff triggers too often
function isFallbackReply(reply: string) {
  const r = (reply || "").toLowerCase().trim();
  return (
    r ===
      "i don’t have that information. i’ll forward your question to the host." ||
    r === "i don't have that information. i'll forward your question to the host." ||
    r ===
      "nažalost, nemam tu informaciju. mogu proslijediti pitanje domaćinu." ||
    r === "nazalost, nemam tu informaciju. mogu proslijediti pitanje domacinu."
  );
}

function detectGuestLang(text: string): "hr" | "en" {
  const t = (text || "").toLowerCase();
  if (/[čćžšđ]/i.test(text)) return "hr";
  if (
    /(molim|hvala|gdje|kako|koliko|najbliž|pl[aá]ž|smještaj|domaćin)/i.test(t)
  )
    return "hr";
  return "en";
}

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function twimlMessage(text: string) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(text)}</Message>
</Response>`;
  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

function parsePropertyCode(input: string) {
  // Expected: CODE: message
  const m = input.match(/^\s*([A-Za-z0-9_-]{3,20})\s*:\s*([\s\S]+)$/);
  if (!m) return null;
  return { code: m[1].toUpperCase(), message: m[2].trim() };
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) return twimlMessage("Missing OPENAI_API_KEY.");
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return twimlMessage("Missing Supabase env vars.");
  }

  const form = await request.formData();
  const rawBody = ((form.get("Body") as string) || "").trim();
  const from = (form.get("From") as string) || "";
  const to = (form.get("To") as string) || "";

  if (!rawBody) return twimlMessage("Please send a message.");

  const parsed = parsePropertyCode(rawBody);
  if (!parsed) {
    return twimlMessage(
      "Please start your message with your property code, e.g. ANA123: Do you have parking?"
    );
  }

  const { code, message: guestMessage } = parsed;
  const guestLang = detectGuestLang(guestMessage);

  // Load property (include handoff_email + owner_id)
  const { data: property, error: propErr } = await supabase
    .from("properties")
    .select("id,name,knowledge_text,languages,handoff_email,owner_id")
    .eq("code", code)
    .maybeSingle();

  if (propErr) {
    console.error("Supabase property lookup error:", propErr);
    return twimlMessage(
      guestLang === "hr"
        ? "Greška na serveru. Pokušaj ponovno."
        : "Server error. Please try again."
    );
  }

  if (!property) {
    return twimlMessage(
      guestLang === "hr"
        ? `Nepoznat kod objekta "${code}".`
        : `Unknown property code "${code}".`
    );
  }

  // ✅ USAGE LIMITS (check + increment) — BEFORE OpenAI
  // NOTE: userId = owner_id (limit po vlasniku/hostu)
  try {
    const usage = await checkAndIncrementUsage(supabase, property.owner_id, 1);

    if (!usage.allowed) {
      // Differentiate reasons for nicer UX
      if (usage.reason === "no_plan") {
        const msg =
          guestLang === "hr"
            ? "Ovaj objekt trenutno nema aktivan plan ili trial. Molimo kontaktirajte domaćina."
            : "This property currently has no active plan or trial. Please contact the host.";
        return twimlMessage(msg);
      }

      // limit_reached (or fallback)
      const limitText =
        usage.limit && usage.limit > 0
          ? `${usage.used}/${usage.limit}`
          : guestLang === "hr"
            ? "limit poruka"
            : "message limit";

      const msg =
        guestLang === "hr"
          ? `Ovaj objekt je dosegao mjesečni ${limitText}. Molimo kontaktirajte domaćina.`
          : `This property has reached its monthly ${limitText}. Please contact the host.`;

      return twimlMessage(msg);
    }
  } catch (e) {
    // ✅ Fail closed: ako usage check pukne, bolje blokirati nego davati free usage
    console.error("Usage check error (blocking request):", e);
    return twimlMessage(
      guestLang === "hr"
        ? "Trenutno ne mogu obraditi poruku (naplata/limit). Molimo kontaktirajte domaćina."
        : "I can’t process this message right now (billing/limit). Please contact the host."
    );
  }

  // Create safe system prompt
  const systemPrompt = `
You are a WhatsApp assistant for a tourism property in Croatia.

CRITICAL RULES:
1. ALWAYS reply in the same language as the guest.
2. If the guest writes in English, reply in English.
3. If the guest writes in Croatian, reply in Croatian.
4. Always be polite and friendly.

You may answer:
- Language questions (e.g. "Do you speak English?")
- General location questions (nearest beach, city center, supermarket) using general knowledge and suggestions (e.g. recommend using Google Maps).
- Tourist questions using general knowledge

ONLY use the property info below for:
- Check-in / check-out
- House rules
- Parking
- Wi-Fi
- Pets
- Property-specific details

If the guest asks something you truly do not know AND it is property-specific, reply:
"I don’t have that information. I’ll forward your question to the host."

DO NOT forward questions just because they are asked in English or any other language.

PROPERTY INFO:
${property.knowledge_text}
`.trim();

  // Fallback reply (ONLY for OpenAI failure, do NOT trigger handoff)
  let reply =
    guestLang === "hr"
      ? "Trenutno imam tehničkih poteškoća. Pokušaj ponovno za minutu."
      : "I’m having a technical issue right now. Please try again in a minute.";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: guestMessage },
      ],
    });

    reply = completion.choices[0]?.message?.content?.trim() || reply;
  } catch (e) {
    console.error("OpenAI error:", e);
    // Keep technical fallback reply
  }

  // ✅ Human handoff (only when guest asks, OR the model used the exact forward line)
  const shouldHandoff = wantsHuman(guestMessage) || isFallbackReply(reply);

  if (shouldHandoff) {
    reply =
      guestLang === "hr"
        ? "Proslijedit ću pitanje domaćinu."
        : "I’ll forward your question to the host.";

    console.log("HANDOFF TRIGGERED", {
      code,
      property: property.name,
      toEmail: property.handoff_email,
      hasResendKey: !!process.env.RESEND_API_KEY,
    });

    if (property.handoff_email) {
      try {
        await sendHandoffEmail({
          to: property.handoff_email,
          propertyName: property.name,
          fromNumber: from,
          guestMessage,
        });
      } catch (e) {
        console.error("Handoff email error:", e);
      }
    }
  }

  // Log message+reply
  const { error: logErr } = await supabase.from("messages").insert({
    property_id: property.id,
    from_number: from,
    to_number: to,
    guest_message: guestMessage,
    bot_reply: reply,
  });

  if (logErr) console.error("Supabase log insert error:", logErr);

  return twimlMessage(reply);
}

export async function GET() {
  return new Response("OK", { status: 200 });
}
