// src/components/background-glow.tsx
export function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* base wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />

      {/* big WhatsApp-ish glows */}
      <div className="absolute -top-[520px] left-1/2 h-[900px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.22),transparent_62%)] blur-2xl" />
      <div className="absolute top-[10%] right-[-35%] h-[900px] w-[900px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18),transparent_64%)] blur-2xl" />
      <div className="absolute top-[42%] left-[-35%] h-[900px] w-[900px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.16),transparent_65%)] blur-2xl" />
      <div className="absolute bottom-[-45%] left-1/2 h-[900px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.14),transparent_66%)] blur-2xl" />

      {/* edge vignette (dark look) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_12%,rgba(0,0,0,0.65)_78%)]" />

      {/* bottom fade (fix “toolbar” band) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

      {/* subtle grain (no images) */}
      <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:18px_18px]" />
    </div>
  );
}