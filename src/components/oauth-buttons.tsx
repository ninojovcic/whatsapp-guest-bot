"use client";

import { Button } from "@/components/ui/button";

export function OAuthButtons({
  locale,
  next,
}: {
  locale: string;
  next: string;
}) {
  function startGoogle() {
    const url = `/${locale}/auth/oauth?provider=google&next=${encodeURIComponent(
      next
    )}`;
    window.location.href = url;
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full rounded-2xl bg-background/40 hover:bg-background/60"
        onClick={startGoogle}
      >
        {locale === "hr" ? "Nastavi s Google" : "Continue with Google"}
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