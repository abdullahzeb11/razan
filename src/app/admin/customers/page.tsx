import { Search, Phone, Mail, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { waLink } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers" };

const SAR = new Intl.NumberFormat("en-SA", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

type CustomerRow = {
  name: string | null;
  phone: string | null;
  email: string | null;
  appointmentCount: number;
  totalSpent: number;
  lastVisit: Date | null;
  city: string | null;
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  // We aggregate from appointments because guests can book without an account.
  const rows = await prisma.appointment.findMany({
    where: q
      ? {
          OR: [
            { guestName: { contains: q, mode: "insensitive" } },
            { guestPhone: { contains: q } },
            { guestEmail: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: {
      guestName: true,
      guestPhone: true,
      guestEmail: true,
      priceSar: true,
      scheduledAt: true,
      city: true,
      status: true,
    },
    take: 1000,
    orderBy: { scheduledAt: "desc" },
  });

  const map = new Map<string, CustomerRow>();
  for (const a of rows) {
    const key = a.guestPhone ?? a.guestEmail ?? a.guestName ?? "";
    if (!key) continue;
    const existing = map.get(key) ?? {
      name: a.guestName,
      phone: a.guestPhone,
      email: a.guestEmail,
      appointmentCount: 0,
      totalSpent: 0,
      lastVisit: null,
      city: a.city,
    };
    existing.appointmentCount += 1;
    if (a.status === "COMPLETED" || a.status === "CONFIRMED") {
      existing.totalSpent += a.priceSar;
    }
    if (!existing.lastVisit || a.scheduledAt > existing.lastVisit) {
      existing.lastVisit = a.scheduledAt;
    }
    map.set(key, existing);
  }

  const customers = Array.from(map.values()).sort(
    (a, b) => (b.lastVisit?.getTime() ?? 0) - (a.lastVisit?.getTime() ?? 0),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Directory
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Customers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {customers.length} unique customer{customers.length === 1 ? "" : "s"}
          </p>
        </div>

        <form className="relative w-full max-w-xs">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name, phone, email…"
            className="w-full rounded-full border border-border bg-card py-2 ps-9 pe-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </form>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <Th className="ps-6">Customer</Th>
              <Th>Contact</Th>
              <Th>Visits</Th>
              <Th>Lifetime value</Th>
              <Th>Last visit</Th>
              <Th className="pe-6"></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                  <Users className="mx-auto h-6 w-6" />
                  <p className="mt-2 text-sm">
                    {q ? "No matches." : "No customers yet."}
                  </p>
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={(c.phone ?? c.email ?? c.name) as string} className="hover:bg-secondary/30">
                  <td className="ps-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-gradient text-xs font-semibold text-primary-foreground">
                        {(c.name ?? "?").charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{c.name ?? "—"}</p>
                        {c.city ? (
                          <p className="truncate text-xs text-muted-foreground">{c.city}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    {c.phone ? (
                      <a
                        href={`tel:${c.phone}`}
                        className="flex items-center gap-1.5 text-xs hover:text-primary"
                        dir="ltr"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {c.phone}
                      </a>
                    ) : null}
                    {c.email ? (
                      <a
                        href={`mailto:${c.email}`}
                        className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {c.email}
                      </a>
                    ) : null}
                  </td>
                  <td className="py-3.5 font-semibold tabular-nums">{c.appointmentCount}</td>
                  <td className="py-3.5 font-semibold tabular-nums">
                    {SAR.format(c.totalSpent)}
                  </td>
                  <td className="py-3.5 text-xs text-muted-foreground">
                    {c.lastVisit
                      ? new Intl.DateTimeFormat("en-SA", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(c.lastVisit)
                      : "—"}
                  </td>
                  <td className="pe-6 py-3.5 text-end">
                    {c.phone ? (
                      <a
                        href={waLink(c.phone, "Hi, regarding your Al-Shifa visit…")}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] font-medium hover:bg-accent"
                      >
                        WhatsApp
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`text-start font-medium py-3 ${className ?? ""}`}>{children}</th>
  );
}
