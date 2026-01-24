function monthKey(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export type BillingProfile = {
  user_id: string;
  plan: string;
  monthly_limit: number;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_end?: string | null; // ISO string (optional, ako ga koristiš kasnije)
};

type LimitCheck = {
  allowed: boolean;
  used: number;
  limit: number;
  plan: string;
};

export async function ensureBillingProfile(
  supabase: any,
  userId: string
): Promise<BillingProfile> {
  const { data, error } = await supabase
    .from("billing_profiles")
    .select("user_id, plan, monthly_limit, stripe_customer_id, stripe_subscription_id, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (data) return data as BillingProfile;

  // default free
  const { data: created, error: createErr } = await supabase
    .from("billing_profiles")
    .insert({
      user_id: userId,
      plan: "free",
      monthly_limit: 100,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      current_period_end: null,
    })
    .select("user_id, plan, monthly_limit, stripe_customer_id, stripe_subscription_id, current_period_end")
    .single();

  if (createErr) throw createErr;
  return created as BillingProfile;
}

export async function checkAndIncrementUsage(
  supabase: any,
  userId: string,
  incrementBy = 1
): Promise<LimitCheck> {
  const month = monthKey();

  const profile = await ensureBillingProfile(supabase, userId);

  const { data: usageRow, error: usageErr } = await supabase
    .from("usage_monthly")
    .select("used")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();

  if (usageErr) throw usageErr;

  const used = Number(usageRow?.used ?? 0);
  const limit = Number(profile.monthly_limit ?? 100);

  if (used + incrementBy > limit) {
    return { allowed: false, used, limit, plan: profile.plan };
  }

  const { error } = await supabase
    .from("usage_monthly")
    .upsert({ user_id: userId, month, used: used + incrementBy }, { onConflict: "user_id,month" });

  if (error) throw error;

  return { allowed: true, used: used + incrementBy, limit, plan: profile.plan };
}