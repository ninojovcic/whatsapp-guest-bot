import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Server is missing OPENAI_API_KEY.</Message></Response>`;
    return new Response(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
  }

  // Twilio sends form-encoded data
  const form = await request.formData();
  const userMessage = (form.get("Body") as string) || "";
  const from = (form.get("From") as string) || "";

  // Basic logging so you can see it in your terminal
  console.log("Twilio incoming from:", from);
  console.log("Twilio message:", userMessage);

  const propertyInfo = `
You are the WhatsApp assistant for "Villa Ana" in Croatia.

Facts:
- Check-in: after 15:00
- Check-out: until 10:00
- Parking: free, in front of the house
- Pets: small pets allowed
- Wi-Fi: VillaAna123

Rules:
- Answer ONLY using these facts.
- If unknown, say you will forward to the host.
- Reply in the same language as the guest.
- Keep replies short.
`;

  let reply = "I’ll forward this to the host.";

  if (userMessage.trim().length > 0) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: propertyInfo.trim() },
        { role: "user", content: userMessage },
      ],
    });

    reply = completion.choices[0]?.message?.content?.trim() || reply;
  }

  // Twilio requires TwiML XML
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(reply)}</Message>
</Response>`;

  return new Response(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

// Optional: Twilio doesn't need GET, but harmless.
export async function GET() {
  return new Response("OK", { status: 200 });
}
