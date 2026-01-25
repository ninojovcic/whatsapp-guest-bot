"use client";

import { Button } from "@/components/ui/button";

export function OAuthButtons({
  locale,
  next,
}: {
  locale: string;
  next: string;
}) {
  async function start(provider: "google" | "apple") {
    const res = await fetch("/auth/oauth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, next }),
    });

    const data = await res.json();
    if (data?.url) window.location.href = data.url;
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full rounded-2xl bg-background/40 hover:bg-background/60"
        onClick={() => start("google")}
      >
        {locale === "hr" ? "Nastavi s Google" : "Continue with Google"}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full rounded-2xl bg-background/40 hover:bg-background/60"
        onClick={() => start("apple")}
      >
        {locale === "hr" ? "Nastavi s Apple" : "Continue with Apple"}
      </Button>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background/50 px-3 text-xs text-muted-foreground">
            {locale === "hr" ? "ili" : "or"}
          </span>
        </div>
      </div>
    </div>
  );
}