import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in", robots: { index: false } };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-primary-gradient p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-9 w-9" />
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold">Razan</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-gold">
              Admin
            </span>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
            Internal tool
          </p>
          <h1 className="mt-3 max-w-md font-display text-4xl font-semibold leading-tight">
            Run the clinic from one calm place.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/75">
            Approve bookings, manage services, and keep an eye on revenue and
            reviews — all in one dashboard tuned for the way Razan actually
            operates.
          </p>
        </div>

        {/* Filigree backdrop */}
        <svg
          className="pointer-events-none absolute -end-32 -top-32 h-[480px] w-[480px] text-gold/15"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden
        >
          <g stroke="currentColor" strokeWidth="0.5">
            {Array.from({ length: 14 }).map((_, i) => (
              <circle key={i} cx="100" cy="100" r={20 + i * 7} />
            ))}
          </g>
        </svg>
      </div>

      {/* Form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="lg:hidden">
          <LogoMark className="h-10 w-10" />
        </div>
        <div className="w-full max-w-sm">
          <h2 className="mt-6 text-2xl font-semibold">Sign in</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Authorized clinic staff only.
          </p>
          <LoginForm next={sp.next} initialError={sp.error} />
          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              ← Back to public site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
