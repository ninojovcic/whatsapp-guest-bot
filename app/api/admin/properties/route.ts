import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: Request) {
  const form = await request.formData();

  const adminSecret = (form.get("adminSecret") as string) || "";
  if (!process.env.ADMIN_SECRET || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const code = ((form.get("code") as string) || "").trim().toUpperCase();
  const name = ((form.get("name") as string) || "").trim();
  const knowledge_text = ((form.get("knowledge_text") as string) || "").trim();
  const languages = ((form.get("languages") as string) || "auto").trim();
  const handoff_email = ((form.get("handoff_email") as string) || "").trim() || null;

  if (!code || !name || !knowledge_text) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await supabase.from("properties").insert({
    code,
    name,
    knowledge_text,
    languages,
    handoff_email,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  // redirect back to onboard with a success message
  return NextResponse.redirect(new URL("/onboard?ok=1", request.url), { status: 303 });
}
