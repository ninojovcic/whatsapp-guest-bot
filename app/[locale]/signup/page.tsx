import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServer } from "@/src/lib/supabase/server";

export default async function SignupPage({
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

  return (
    <div className="mx-auto max-w-md">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl">Create account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={`/${locale}/auth/sign-up`} method="post" className="space-y-3">
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full rounded-xl border bg-background px-3 py-2"
            />
            <input
              name="password"
              type="password"
              placeholder="Password (min 6)"
              minLength={6}
              required
              className="w-full rounded-xl border bg-background px-3 py-2"
            />
            <Button type="submit" className="w-full rounded-2xl">
              Sign up
            </Button>
          </form>

          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="underline" href={`/${locale}/login`}>
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
