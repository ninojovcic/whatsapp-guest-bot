export default function OnboardPage() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Onboard a Property</h1>
      <p>Add a property into the system (MVP admin form).</p>

      <form method="POST" action="/api/admin/properties">
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            Admin secret
            <input name="adminSecret" type="password" required style={{ width: "100%", padding: 10 }} />
          </label>

          <label>
            Property code (e.g. ANA123)
            <input name="code" required style={{ width: "100%", padding: 10 }} />
          </label>

          <label>
            Property name
            <input name="name" required style={{ width: "100%", padding: 10 }} />
          </label>

          <label>
            Knowledge text (facts, rules, FAQs)
            <textarea name="knowledge_text" required rows={10} style={{ width: "100%", padding: 10 }} />
          </label>

          <label>
            Languages (optional, e.g. auto)
            <input name="languages" defaultValue="auto" style={{ width: "100%", padding: 10 }} />
          </label>

          <label>
            Handoff email (optional)
            <input name="handoff_email" type="email" style={{ width: "100%", padding: 10 }} />
          </label>

          <button type="submit" style={{ padding: 12, cursor: "pointer" }}>
            Create property
          </button>
        </div>
      </form>
    </main>
  );
}
