function monthKey(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

type LimitCheck = {
  allowed: boolean;
  used: number;
  limit: number;
  plan: string;
};

export async function ensureBillingProfile(supabase: any, userId: string) {
  const { data } = await supabase
    .from("billing_profiles")
    .select("user_id, plan, monthly_limit")
    .eq("user_id", userId)
    .single();

  if (data) return data;

  // default free
  const { data: created, error } = await supabase
    .from("billing_profiles")
    .insert({ user_id: userId, plan: "free", monthly_limit: 100 })
    .select("user_id, plan, monthly_limit")
    .single();

  if (error) throw error;
  return created;
}

export async function checkAndIncrementUsage(
  supabase: any,
  userId: string,
  incrementBy = 1
): Promise<LimitCheck> {
  const month = monthKey();

  const profile = await ensureBillingProfile(supabase, userId);

  // fetch current usage row
  const { data: usageRow } = await supabase
    .from("usage_monthly")
    .select("used")
    .eq("user_id", userId)
    .eq("month", month)
    .single();

  const used = usageRow?.used ?? 0;
  const limit = profile.monthly_limit ?? 100;

  // ako bi prešlo limit -> blokiraj
  if (used + incrementBy > limit) {
    return { allowed: false, used, limit, plan: profile.plan };
  }

  // upsert: increment
  const { error } = await supabase
    .from("usage_monthly")
    .upsert(
      { user_id: userId, month, used: used + incrementBy },
      { onConflict: "user_id,month" }
    );

  if (error) throw error;

  return { allowed: true, used: used + incrementBy, limit, plan: profile.plan };
}