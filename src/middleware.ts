// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Ne diraj Next interne rute i API
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ✅ Ne diraj statične fileove (favicon, png, svg, css, js, txt, xml...)
  // Ovo automatski pokriva /favicon.ico, /favicon-32x32.png, /icons/..., /images/...
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    return NextResponse.next();
  }

  // ✅ Ne diraj standardne “root” metadata rute
  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/site.webmanifest"
  ) {
    return NextResponse.next();
  }

  // --- i18n redirect logika (tvoja) ---
  // Primjer: ako nema /hr ili /en prefiks, redirect na /hr
  const hasLocalePrefix = pathname === "/hr" || pathname.startsWith("/hr/") || pathname === "/en" || pathname.startsWith("/en/");
  if (!hasLocalePrefix) {
    const url = req.nextUrl.clone();
    url.pathname = `/hr${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // pokreni middleware za sve osim next statike i API-ja (mi ih ionako guardamo gore, ali ovo je ok)
    "/:path*",
  ],
};