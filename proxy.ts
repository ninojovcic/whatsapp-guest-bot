import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["hr", "en"];

// ✅ helper: statični fileovi koje NE SMIJEMO redirectati
function isAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/favicon-") ||
    pathname === "/apple-touch-icon.png" ||
    pathname === "/site.webmanifest" ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]+$/.test(pathname) // bilo koji file s ekstenzijom (.png, .svg, .ico, .txt…)
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ 1. NE DIRAJ statične fileove
  if (isAsset(pathname)) {
    return NextResponse.next();
  }

  // ✅ 2. Ako već ima locale, pusti dalje
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) {
    return NextResponse.next();
  }

  // ✅ 3. Default locale redirect (/hr)
  const url = req.nextUrl.clone();
  url.pathname = `/hr${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/:path*"],
};