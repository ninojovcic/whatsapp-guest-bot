import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendHandoffEmail(params: {
  to: string;
  propertyName: string;
  fromNumber: string;
  guestMessage: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const { to, propertyName, fromNumber, guestMessage } = params;

  await resend.emails.send({
    from: "WhatsApp Bot <onboarding@resend.dev>",
    to,
    subject: `Guest question for ${propertyName}`,
    html: `
      <p><strong>Property:</strong> ${propertyName}</p>
      <p><strong>Guest number:</strong> ${fromNumber}</p>
      <p><strong>Message:</strong></p>
      <blockquote>${guestMessage}</blockquote>
      <p>Reply to the guest directly in WhatsApp.</p>
    `,
  });
}
