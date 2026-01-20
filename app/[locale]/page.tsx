export default function Landing({ params }: { params: { locale: "hr" | "en" } }) {
  const isHR = params.locale === "hr";

  const copy = isHR
    ? {
        h1: "AI WhatsApp asistent za apartmane i hotele",
        p: "Odgovara gostima 24/7, na njihovom jeziku. Ne zna? Automatski proslijedi domaćinu.",
        bullets: ["Bez kartice", "Postavljanje u 5 minuta", "Handoff na domaćina"],
        cta1: "Pokreni besplatno",
        cta2: "Pogledaj cijene",
      }
    : {
        h1: "AI WhatsApp assistant for hotels & rentals",
        p: "Answers guests 24/7 in their language. If it doesn’t know, it escalates to the host.",
        bullets: ["No credit card", "5-minute setup", "Human handoff"],
        cta1: "Get started free",
        cta2: "View pricing",
      };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <h1 style={{ fontSize: 44, lineHeight: 1.1, margin: 0 }}>{copy.h1}</h1>
      <p style={{ fontSize: 18, opacity: 0.85, margin: 0 }}>{copy.p}</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {copy.bullets.map((b) => (
          <span key={b} style={{ border: "1px solid #ddd", borderRadius: 999, padding: "6px 10px" }}>
            {b}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <a href={`/${params.locale}/signup`} style={{ padding: "12px 16px", border: "1px solid #111", borderRadius: 10, textDecoration: "none" }}>
          {copy.cta1}
        </a>
        <a href={`/${params.locale}/pricing`} style={{ padding: "12px 16px", border: "1px solid #ddd", borderRadius: 10, textDecoration: "none" }}>
          {copy.cta2}
        </a>
      </div>

      <div style={{ marginTop: 20, border: "1px solid #eee", borderRadius: 14, padding: 16 }}>
        <strong>{isHR ? "Demo ideja:" : "Demo idea:"}</strong>
        <div style={{ marginTop: 8, opacity: 0.85 }}>
          {isHR
            ? "Gosti pitaju: parking, check-in, Wi-Fi, kućna pravila… Bot odgovara, a kad nije siguran — šalje email domaćinu."
            : "Guests ask: parking, check-in, Wi-Fi, house rules… Bot answers, and when unsure — emails the host."}
        </div>
      </div>
    </div>
  );
}
