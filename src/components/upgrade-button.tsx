"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Plan = "starter" | "pro" | "business";

type Props = {
  plan?: Plan;
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
};

export function UpgradeButton({
  plan = "pro",
  children,
  className,
  variant = "default",
}: Props) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.url) {
        console.error("Checkout error:", data);
        alert(data?.error || "Ne mogu otvoriti checkout. Pokušaj ponovno.");
        return;
      }

      window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={className}
      variant={variant}
    >
      {loading ? "Otvaram…" : children ?? "Nadogradi"}
    </Button>
  );
}