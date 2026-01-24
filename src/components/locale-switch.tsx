"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LocaleSwitch({ locale }: { locale: "en" | "hr" }) {
  const pathname = usePathname() || "/";
  const other = locale === "hr" ? "en" : "hr";

  // replace first segment /{locale}/...
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  parts[0] = other;
  const nextPath = "/" + parts.join("/");

  return (
    <Link
      href={nextPath}
      className="text-sm opacity-70 hover:opacity-100"
      aria-label={`Switch language to ${other.toUpperCase()}`}
    >
      {other.toUpperCase()}
    </Link>
  );
}