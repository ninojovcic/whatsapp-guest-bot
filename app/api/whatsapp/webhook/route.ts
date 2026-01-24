import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { sendHandoffEmail } from "@/lib/email";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

function wantsHuman(text: string) {
  return /(human|host|owner|agent|call)/i.test(text);
}

function isFallbackReply(reply: string) {
  return /forward|don’t have|do not have/i.test(reply);
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

  // Load property (include handoff_email)
  const { data: property, error: propErr } = await supabase
    .from("properties")
    .select("id,name,knowledge_text,languages,handoff_email")
    .eq("code", code)
    .maybeSingle();

  if (propErr) {
    console.error("Supabase property lookup error:", propErr);
    return twimlMessage("Server error. Please try again.");
  }

  if (!property) {
    return twimlMessage(`Unknown property code "${code}".`);
  }

  // Create safe system prompt
const systemPrompt = `
You are a WhatsApp assistant for a tourism property in Croatia.

CRITICAL RULES:
1. ALWAYS reply in the same language as the guest.
2. If the guest writes in English, reply in English.
3. If the guest writes in Croatian, reply in Croatian.

You may answer:
- Language questions (e.g. "Do you speak English?")
- General location questions (beach, city center, supermarket)
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

  // Generate reply
  let reply =
  guestMessage.match(/[a-z]/i)
    ? "I don’t have that information. I’ll forward your question to the host."
    : "Nažalost, nemam tu informaciju. Mogu proslijediti pitanje domaćinu.";

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
    // Keep fallback reply
  }

  // ✅ STEP 5: Human handoff
  const shouldHandoff = wantsHuman(guestMessage) || isFallbackReply(reply);

  if (shouldHandoff) {
    // Always keep WhatsApp response safe + consistent
    reply = "I’ll forward your question to the host.";

    console.log("HANDOFF TRIGGERED", {
    code,
    property: property.name,
    toEmail: property.handoff_email,
    hasResendKey: !!process.env.RESEND_API_KEY,
    });

    
    // Notify owner by email if configured
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

  // Log message+reply (log the final reply after handoff logic)
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
