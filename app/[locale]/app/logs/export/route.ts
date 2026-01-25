import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

function csvEscape(v: string) {
  if (v.includes('"') || v.includes(",") || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export async function GET(req: NextRequest, ctx: { params: { locale: string } }) {
  const { locale } = ctx.params;
  const supabase = await createSupabaseServer();

  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  const q = (req.nextUrl.searchParams.get("q") || "").trim();

  let query = supabase
    .from("messages")
    .select("id, property_id, from_number, guest_message, bot_reply, created_at, properties(name,code)")
    .order("created_at", { ascending: false })
    .limit(5000); // zaštita (po potrebi povećaj / paginiraj)

  // filtriraj samo vlasnikove poruke preko join-a na properties owner_id
  // (ako nemaš RLS, ovo je dodatni safety; idealno RLS!)
  // Ako imaš owner_id na messages, još lakše.
  // Ovdje pretpostavljamo da `properties` ima owner_id i da postoji FK relation.
  // Ako nemaš relation, reci pa prilagodim.
  query = query.eq("properties.owner_id", user.id as any);

  if (q) {
    query = query.or(`guest_message.ilike.%${q}%,bot_reply.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as any[];

  const header = [
    "created_at",
    "property_code",
    "property_name",
    "from_number",
    "guest_message",
    "bot_reply",
  ];

  const lines = [
    header.join(","),
    ...rows.map((r) => {
      const prop = Array.isArray(r.properties) ? r.properties[0] : r.properties;
      const values = [
        String(r.created_at ?? ""),
        String(prop?.code ?? ""),
        String(prop?.name ?? ""),
        String(r.from_number ?? ""),
        String(r.guest_message ?? ""),
        String(r.bot_reply ?? ""),
      ].map((x) => csvEscape(x));
      return values.join(",");
    }),
  ];

  const csv = lines.join("\n");
  const filename = `gostly-logs-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}