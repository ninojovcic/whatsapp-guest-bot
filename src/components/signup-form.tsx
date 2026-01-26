"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SignupForm({ locale }: { locale: string }) {
  const isHR = locale === "hr";

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    setError(null);

    if (pw.length < 6) {
      e.preventDefault();
      setError(isHR ? "Šifra mora imati barem 6 znakova." : "Password must be at least 6 characters.");
      return;
    }

    if (pw !== pw2) {
      e.preventDefault();
      setError(isHR ? "Šifre se ne podudaraju." : "Passwords do not match.");
      return;
    }
  }

  return (
    <form
      action={`/${locale}/auth/sign-up`}
      method="post"
      className="space-y-3"
      onSubmit={onSubmit}
    >
      {/* Full name */}
      <input
        name="full_name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder={isHR ? "Puno ime" : "Full name"}
        required
        className="w-full rounded-xl border bg-background/40 px-3 py-2 outline-none ring-0 focus:border-foreground/20"
      />

      {/* Company */}
      <input
        name="company_name"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder={isHR ? "Ime tvrtke/obrta (opcionalno)" : "Company/Business (optional)"}
        className="w-full rounded-xl border bg-background/40 px-3 py-2 outline-none ring-0 focus:border-foreground/20"
      />

      {/* Email */}
      <input
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full rounded-xl border bg-background/40 px-3 py-2 outline-none ring-0 focus:border-foreground/20"
      />

      {/* Password */}
      <input
        name="password"
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder={isHR ? "Šifra (min 6)" : "Password (min 6)"}
        minLength={6}
        required
        className="w-full rounded-xl border bg-background/40 px-3 py-2 outline-none ring-0 focus:border-foreground/20"
      />

      {/* Confirm */}
      <input
        name="password_confirm"
        type="password"
        value={pw2}
        onChange={(e) => setPw2(e.target.value)}
        placeholder={isHR ? "Potvrdite šifru" : "Confirm password"}
        minLength={6}
        required
        className="w-full rounded-xl border bg-background/40 px-3 py-2 outline-none ring-0 focus:border-foreground/20"
      />

      {/* Terms */}
      <label className="flex items-start gap-3 rounded-2xl border bg-background/30 px-4 py-3 text-sm">
        <input
          name="accept_terms"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 rounded border"
        />
        <span className="text-muted-foreground">
          {isHR ? (
            <>
              Slažem se s{" "}
              <Link className="underline" href={`/${locale}/terms`}>
                Uvjetima korištenja
              </Link>{" "}
              i{" "}
              <Link className="underline" href={`/${locale}/privacy`}>
                Politikom privatnosti
              </Link>
              .
            </>
          ) : (
            <>
              I agree to the{" "}
              <Link className="underline" href={`/${locale}/terms`}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link className="underline" href={`/${locale}/privacy`}>
                Privacy Policy
              </Link>
              .
            </>
          )}
        </span>
      </label>

      {error ? (
        <div className="rounded-xl border bg-muted p-3 text-sm">
          ❗ {error}
        </div>
      ) : null}

      <Button type="submit" className="w-full rounded-2xl">
        {isHR ? "Registriraj se" : "Sign up"}
      </Button>
    </form>
  );
}