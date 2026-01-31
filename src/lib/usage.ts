function monthKey(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export type BillingProfile = {
  user_id: string;
  plan: string | null;
  monthly_limit: number | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_end?: string | null; // ISO (trial end ili period end)
};

type LimitCheck = {
  allowed: boolean;
  used: number;
  limit: number;
  plan: string | null;
  reason?: "no_plan" | "limit_reached";
};

/**
 * 🔒 Osiguraj da billing profile postoji,
 * ali BEZ ikakvog free limita ili plana.
 */
export async function ensureBillingProfile(
  supabase: any,
  userId: string
): Promise<BillingProfile> {
  const { data, error } = await supabase
    .from("billing_profiles")
    .select(
      "user_id, plan, monthly_limit, stripe_customer_id, stripe_subscription_id, current_period_end"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (data) return data as BillingProfile;

  // 🧼 Kreiramo PRAZAN billing profil (bez prava na korištenje)
  const { data: created, error: createErr } = await supabase
    .from("billing_profiles")
    .insert({
      user_id: userId,
      plan: null,
      monthly_limit: 0, // ✅ bitno: 0 = blokirano, ne null
      stripe_customer_id: null,
      stripe_subscription_id: null,
      current_period_end: null,
    })
    .select(
      "user_id, plan, monthly_limit, stripe_customer_id, stripe_subscription_id, current_period_end"
    )
    .single();

  if (createErr) throw createErr;
  return created as BillingProfile;
}

/**
 * ✅ Provjera:
 * - postoji li subscription ILI aktivan trial
 * - je li user unutar mjesečnog limita
 */
export async function checkAndIncrementUsage(
  supabase: any,
  userId: string,
  incrementBy = 1
): Promise<LimitCheck> {
  const month = monthKey();
  const profile = await ensureBillingProfile(supabase, userId);

  const now = new Date();

  const hasActiveSubscription = Boolean(profile.stripe_subscription_id);

  const hasActiveTrial =
    profile.current_period_end &&
    new Date(profile.current_period_end).getTime() > now.getTime();

  // ❌ Nema ni trial ni subscription → bot blokiran
  if (!hasActiveSubscription && !hasActiveTrial) {
    return {
      allowed: false,
      used: 0,
      limit: 0,
      plan: profile.plan,
      reason: "no_plan",
    };
  }

  const limit = Number(profile.monthly_limit ?? 0);

  const { data: usageRow, error: usageErr } = await supabase
    .from("usage_monthly")
    .select("used")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();

  if (usageErr) throw usageErr;

  const used = Number(usageRow?.used ?? 0);

  // ✅ KLJUČNO: ako je limit 0 → odmah blokiraj (0 nije unlimited)
  if (used + incrementBy > limit) {
    return {
      allowed: false,
      used,
      limit,
      plan: profile.plan,
      reason: "limit_reached",
    };
  }

  const { error } = await supabase
    .from("usage_monthly")
    .upsert(
      { user_id: userId, month, used: used + incrementBy },
      { onConflict: "user_id,month" }
    );

  if (error) throw error;

  return {
    allowed: true,
    used: used + incrementBy,
    limit,
    plan: profile.plan,
  };
}
