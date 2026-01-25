"use client";

import { useEffect, useMemo, useState } from "react";

type DemoItem = { q: string; a: string };

export function DemoRotator({
  isHR,
  intervalMs = 7000,
  code = "TEST1",
}: {
  isHR: boolean;
  intervalMs?: number;
  code?: string;
}) {
  const items: DemoItem[] = useMemo(() => {
    const hr: DemoItem[] = [
      { q: `${code}: Imate li parking?`, a: "Da — besplatan parking je dostupan ispred objekta." },
      { q: `${code}: Gdje je najbliža plaža?`, a: "Najbliža plaža je obično unutar 5–15 minuta pješice. Ako mi kažeš ulicu ili kvart, mogu predložiti najbližu opciju." },
      { q: `${code}: Koja je lozinka za Wi-Fi?`, a: "Wi-Fi lozinka je navedena u uputama objekta. Ako je ne vidiš, napiši domaćinu i provjerit će za tebe." },
      { q: `${code}: Kada je check-in?`, a: "Check-in je nakon 15:00. Ako dolaziš ranije, napiši pa ćemo provjeriti može li raniji ulazak." },
    ];

    const en: DemoItem[] = [
      { q: `${code}: Do you have parking?`, a: "Yes — free parking is available in front of the property." },
      { q: `${code}: Where is the nearest beach?`, a: "Usually within a 5–15 minute walk. If you tell me your street or area, I can suggest the closest option." },
      { q: `${code}: What’s the Wi-Fi password?`, a: "It’s listed in the property instructions. If you don’t see it, message the host and they’ll confirm it for you." },
      { q: `${code}: What time is check-in?`, a: "Check-in is after 15:00. If you arrive earlier, message the host and we’ll see what’s possible." },
    ];

    return isHR ? hr : en;
  }, [isHR, code]);

  const [idx, setIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((p) => (p + 1) % items.length);
      setAnimKey((k) => k + 1);
    }, intervalMs);
    return () => clearInterval(t);
  }, [items.length, intervalMs]);

  const current = items[idx];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-muted/40 p-4">
        <div className="text-xs text-muted-foreground">
          {isHR ? "Upit gosta" : "Guest message"}
        </div>
        <div
          key={`q-${animKey}`}
          className="mt-1 font-medium animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {current.q}
        </div>
      </div>

      <div className="rounded-2xl border bg-background p-4">
        <div className="text-xs text-muted-foreground">
          {isHR ? "Gostly" : "Bot reply"}
        </div>
        <div
          key={`a-${animKey}`}
          className="mt-1 font-medium animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {current.a}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        {isHR
          ? "U budućim produkcijama se property kod uklanja — gost samo piše na WhatsApp."
          : "In production the property code is removed — guests just message on WhatsApp."}
      </div>
    </div>
  );
}