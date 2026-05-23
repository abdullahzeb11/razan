import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { routing } from "./i18n/routing";
import { authConfig } from "./auth.config";

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

/**
 * Two-track middleware:
 *   - /admin/*  → Auth.js session check (no locale prefix)
 *   - else      → next-intl locale routing
 */
export default auth((req: NextRequest & { auth?: unknown }) => {
  const { pathname } = req.nextUrl;
  const role = (req.auth as { user?: { role?: string } } | undefined)?.user?.role;
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  // Admin area — no locale prefix, role-gated.
  if (isAdmin) {
    if (pathname === "/admin/login") {
      if (role === "ADMIN" || role === "STAFF") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }
    if (role !== "ADMIN" && role !== "STAFF") {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Customer account area — under [locale], any signed-in role works.
  const accountMatch = pathname.match(/^\/(ar|en)\/account(\/.*)?$/);
  if (accountMatch) {
    const locale = accountMatch[1];
    const isLogin = pathname === `/${locale}/account/login`;
    if (!isLogin && !role) {
      const url = new URL(`/${locale}/account/login`, req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (isLogin && role && role !== "ADMIN" && role !== "STAFF") {
      return NextResponse.redirect(new URL(`/${locale}/account`, req.url));
    }
    // Let i18n middleware also process (it's an i18n path).
    return intlMiddleware(req);
  }

  return intlMiddleware(req);
});

export const config = {
  // Exclude Next.js conventions that live at the app root (no locale prefix):
  // - /api/*, /_next/*, /_vercel/* — framework internals
  // - /icon, /apple-icon, /opengraph-image — file-convention routes
  // - any path containing a dot (e.g. /favicon.ico, /sitemap.xml, /robots.txt)
  matcher: [
    "/((?!api|_next|_vercel|icon|apple-icon|opengraph-image|.*\\..*).*)",
  ],
};
