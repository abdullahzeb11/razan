import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config — used by middleware.
 * No Prisma, no bcrypt (Node-only modules) here. The Credentials provider
 * `authorize` callback lives in the Node-side auth.ts file.
 */
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: "CUSTOMER" | "STAFF" | "ADMIN" }).role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = (token.role ?? "CUSTOMER") as "CUSTOMER" | "STAFF" | "ADMIN";
      return session;
    },
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const role = (auth?.user as { role?: string } | undefined)?.role;

      // Admin area
      if (path === "/admin/login") return true;
      if (path.startsWith("/admin")) return role === "ADMIN" || role === "STAFF";

      // Customer account area: signed in is enough
      if (/^\/(ar|en)\/account\/login/.test(path)) return true;
      if (/^\/(ar|en)\/account/.test(path)) return Boolean(role);

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
