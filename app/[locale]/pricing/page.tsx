export default function Pricing({ params }: { params: { locale: "hr" | "en" } }) {
  const isHR = params.locale === "hr";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1>{isHR ? "Cijene" : "Pricing"}</h1>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 16 }}>
          <h3>{isHR ? "Starter" : "Starter"}</h3>
          <p style={{ fontSize: 28, margin: "8px 0" }}>€29 / {isHR ? "mj" : "mo"}</p>
          <ul>
            <li>{isHR ? "1 objekt" : "1 property"}</li>
            <li>{isHR ? "AI odgovori + handoff" : "AI replies + handoff"}</li>
            <li>{isHR ? "Osnovna analitika" : "Basic analytics"}</li>
          </ul>
          <a href={`/${params.locale}/signup`}> {isHR ? "Kreni" : "Start"} →</a>
        </div>

        <div style={{ border: "1px solid #111", borderRadius: 14, padding: 16 }}>
          <h3>{isHR ? "Pro" : "Pro"}</h3>
          <p style={{ fontSize: 28, margin: "8px 0" }}>€59 / {isHR ? "mj" : "mo"}</p>
          <ul>
            <li>{isHR ? "Do 3 objekta" : "Up to 3 properties"}</li>
            <li>{isHR ? "Napredniji logovi" : "Advanced logs"}</li>
            <li>{isHR ? "Prioritetna podrška" : "Priority support"}</li>
          </ul>
          <a href={`/${params.locale}/signup`}> {isHR ? "Kreni" : "Start"} →</a>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 16 }}>
          <h3>{isHR ? "Enterprise" : "Enterprise"}</h3>
          <p style={{ fontSize: 28, margin: "8px 0" }}>{isHR ? "Po dogovoru" : "Custom"}</p>
          <ul>
            <li>{isHR ? "Integracije po mjeri" : "Custom integrations"}</li>
            <li>{isHR ? "Više timova" : "Multiple teams"}</li>
          </ul>
          <a href={`/${params.locale}/contact`}> {isHR ? "Kontakt" : "Contact"} →</a>
        </div>
      </div>
    </div>
  );
}
