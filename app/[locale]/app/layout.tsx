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
  const supabase = createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="rounded-3xl border p-4 h-fit">
        <div className="mb-3 text-sm font-semibold">Gostly</div>
        <nav className="grid gap-2 text-sm">
          <Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/app`}>Dashboard</Link>
          <Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/app/properties`}>Properties</Link>
          <Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/app/logs`}>Logs</Link>
        </nav>

        <form action={`/${locale}/auth/sign-out`} method="post" className="mt-4">
          <Button type="submit" variant="outline" className="w-full rounded-2xl">
            Sign out
          </Button>
        </form>
      </aside>

      <section>{children}</section>
    </div>
  );
}
