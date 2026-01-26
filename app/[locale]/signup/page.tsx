import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServer } from "@/lib/supabase/server";
import { OAuthButtons } from "@/components/oauth-buttons";
import { SignupForm } from "@/components/signup-form";

function getErrorMessage(locale: string, code?: string) {
  const isHR = locale === "hr";

  if (!code) return null;

  const dict: Record<string, { hr: string; en: string }> = {
    terms: {
      hr: "Moraš prihvatiti Uvjete korištenja i Pravila privatnosti da bi nastavio.",
      en: "You must accept the Terms of Service and Privacy Policy to continue.",
    },
    missing: {
      hr: "Molim ispuni sva obavezna polja.",
      en: "Please fill in all required fields.",
    },
    password: {
      hr: "Lozinka mora imati najmanje 6 znakova.",
      en: "Password must be at least 6 characters.",
    },
    match: {
      hr: "Lozinke se ne podudaraju. Provjeri unos.",
      en: "Passwords do not match. Please check again.",
    },
    "1": {
      hr: "Registracija nije uspjela. Provjeri podatke ili pokušaj ponovno.",
      en: "Signup failed. Please check your details and try again.",
    },
  };

  const msg = dict[code]?.[isHR ? "hr" : "en"];
  return msg ?? (isHR ? "Došlo je do greške. Pokušaj ponovno." : "Something went wrong. Try again.");
}

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(`/${locale}/app`);

  const next = `/${locale}/app`;
  const errorMessage = getErrorMessage(locale, sp?.error);

  return (
    <div className="mx-auto max-w-md">
      <Card className="rounded-3xl border bg-background/55 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl">
            {locale === "hr" ? "Registracija" : "Sign up"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ✅ Error banner */}
          {errorMessage ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
              <div className="font-semibold text-red-200">
                {locale === "hr" ? "Greška" : "Error"}
              </div>
              <div className="mt-1 text-red-100/90">{errorMessage}</div>
            </div>
          ) : null}

          {/* OAuth */}
          <OAuthButtons locale={locale} next={next} />

          {/* Signup form */}
          <SignupForm locale={locale} />

          <div className="text-sm text-muted-foreground">
            {locale === "hr" ? "Već imaš račun?" : "Already have an account?"}{" "}
            <Link className="underline" href={`/${locale}/login`}>
              {locale === "hr" ? "Prijava" : "Log in"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}