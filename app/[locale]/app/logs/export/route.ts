import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ locale: string }> }
) {
  const { locale } = await context.params;

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  // Query params (isti kao na /logs)
  const url = new URL(req.url);
  const range = url.searchParams.get("range") || "30";
  const property = (url.searchParams.get("property") || "").trim();
  const q = (url.searchParams.get("q") || "").trim();

  // Range -> fromISO
  const rangeDays = ["7", "30", "90"].includes(range) ? Number(range) : 30;
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - rangeDays);
  const fromISO = fromDate.toISOString();

  // Učitaj userove property id-eve (da ne može exportat tuđe)
  const { data: props } = await supabase
    .from("properties")
    .select("id")
    .eq("owner_id", user.id);

  const ownerPropertyIds = (props ?? []).map((p) => p.id);
  if (ownerPropertyIds.length === 0) {
    return csvResponse(`id,property_id,from_number,guest_message,bot_reply,created_at\n`, {
      filename: `gostly-export-${rangeDays}d.csv`,
    });
  }

  let query = supabase
    .from("messages")
    .select("id,property_id,from_number,guest_message,bot_reply,created_at")
    .gte("created_at", fromISO)
    .in("property_id", ownerPropertyIds)
    .order("created_at", { ascending: false });

  if (property) query = query.eq("property_id", property);

  if (q) {
    query = query.or(`guest_message.ilike.%${q}%,bot_reply.ilike.%${q}%`);
  }

  const { data: rows, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Export failed", details: error.message },
      { status: 500 }
    );
  }

  // CSV
  const header = "id,property_id,from_number,guest_message,bot_reply,created_at\n";
  const body =
    (rows ?? [])
      .map((r) =>
        [
          r.id,
          r.property_id,
          r.from_number ?? "",
          csvCell(r.guest_message ?? ""),
          csvCell(r.bot_reply ?? ""),
          r.created_at,
        ].join(",")
      )
      .join("\n") + "\n";

  return csvResponse(header + body, {
    filename: `gostly-export-${rangeDays}d.csv`,
  });
}

function csvCell(s: string) {
  // escape quotes + wrap
  const v = String(s).replace(/"/g, '""').replace(/\r?\n/g, " ");
  return `"${v}"`;
}

function csvResponse(csv: string, opts: { filename: string }) {
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${opts.filename}"`,
      "cache-control": "no-store",
    },
  });
}