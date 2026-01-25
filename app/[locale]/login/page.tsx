import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServer } from "@/lib/supabase/server";
import { OAuthButtons } from "@/components/oauth-buttons";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(`/${locale}/app`);

  const next = `/${locale}/app`;

  return (
    <div className="mx-auto max-w-md">
      <Card className="rounded-3xl border bg-background/55 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl">
            {locale === "hr" ? "Prijava" : "Login"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* OAuth */}
          <OAuthButtons locale={locale} next={next} />

          {/* Email/password */}
          <form
            action={`/${locale}/auth/sign-in`}
            method="post"
            className="space-y-3"
          >
            <input
              name="email"
              type="email"
              placeholder={locale === "hr" ? "Email" : "Email"}
              required
              className="w-full rounded-xl border bg-background/40 px-3 py-2 outline-none ring-0 focus:border-foreground/20"
            />
            <input
              name="password"
              type="password"
              placeholder={locale === "hr" ? "Lozinka" : "Password"}
              required
              className="w-full rounded-xl border bg-background/40 px-3 py-2 outline-none ring-0 focus:border-foreground/20"
            />
            <Button type="submit" className="w-full rounded-2xl">
              {locale === "hr" ? "Prijavi se" : "Log in"}
            </Button>
          </form>

          <div className="text-sm text-muted-foreground">
            {locale === "hr" ? "Nemaš račun?" : "Don’t have an account?"}{" "}
            <Link className="underline" href={`/${locale}/signup`}>
              {locale === "hr" ? "Registracija" : "Sign up"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}