"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({
  path,
  label = "Copy link",
  copiedLabel = "Copied ✅",
}: {
  path: string;
  label?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}${path}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  return (
    <Button type="button" variant="outline" onClick={copy}>
      {copied ? copiedLabel : label}
    </Button>
  );
}