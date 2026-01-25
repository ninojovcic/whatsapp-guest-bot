import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="relative h-fit overflow-hidden rounded-3xl border border-foreground/10 bg-background/55 p-4 shadow-sm backdrop-blur">
        {/* subtle sidebar glow (inside only) */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.12),transparent_60%)] blur-xl" />
          <div className="absolute -bottom-28 right-[-8rem] h-56 w-72 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.10),transparent_60%)] blur-xl" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/${locale}`}
            className="text-sm font-semibold tracking-tight"
          >
            Gostly
          </Link>

          <span className="rounded-full border border-foreground/10 bg-background/40 px-2 py-0.5 text-[11px] text-muted-foreground">
            APP
          </span>
        </div>

        <div className="mt-4 grid gap-1 text-sm">
          <NavLink href={`/${locale}/app`}>Nadzorna ploča</NavLink>
          <NavLink href={`/${locale}/app/properties`}>Objekti</NavLink>
          <NavLink href={`/${locale}/app/logs`}>Analitika</NavLink>
        </div>

        <div className="mt-4 border-t border-foreground/10 pt-4">
          <form action={`/${locale}/auth/sign-out`} method="post">
            <Button
              type="submit"
              variant="outline"
              className="w-full rounded-2xl border-foreground/15 bg-background/40 hover:bg-background/60"
            >
              Odjava
            </Button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <section className="space-y-6">
        {/* top bar inside app */}
        <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-background/55 px-5 py-4 shadow-sm backdrop-blur">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 left-1/2 h-56 w-[38rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.10),transparent_60%)] blur-xl" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Profil</div>
              <div className="text-sm font-semibold tracking-tight">
                {user.email}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/billing`}
                className="rounded-xl border border-foreground/10 bg-background/40 px-3 py-2 text-xs font-semibold text-foreground hover:bg-background/60"
              >
                Plan / Naplata
              </Link>
            </div>
          </div>
        </div>

        {/* page content */}
        <div className="min-w-0">{children}</div>
      </section>
    </div>
  );
}

/** Small helper – keeps styling consistent */
function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "group flex items-center justify-between rounded-2xl px-3 py-2",
        "text-muted-foreground transition hover:bg-background/40 hover:text-foreground",
        "border border-transparent hover:border-foreground/10",
      ].join(" ")}
    >
      <span>{children}</span>
      <span className="opacity-0 transition group-hover:opacity-100">→</span>
    </Link>
  );
}