import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["hr", "en"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore next internals
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // If already has locale, continue
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return NextResponse.next();

  // Default locale
  const url = req.nextUrl.clone();
  url.pathname = `/hr${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api).*)"],
};
