import Link from "next/link";
import { Inbox, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SubscriberRowActions } from "@/components/admin/subscriber-row-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subscribers" };

type Filter = "all" | "ar" | "en";

const LOCALE_LABEL: Record<string, string> = { ar: "AR", en: "EN" };

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const { locale } = await searchParams;
  const filter: Filter =
    locale === "ar" || locale === "en" ? (locale as Filter) : "all";

  const [subscribers, counts] = await Promise.all([
    prisma.subscriber.findMany({
      where: filter === "all" ? undefined : { locale: filter },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.subscriber.groupBy({
      by: ["locale"],
      _count: { _all: true },
    }),
  ]);

  const countBy = Object.fromEntries(
    counts.map((c) => [c.locale, c._count._all]),
  ) as Record<string, number>;
  const total = counts.reduce((a, c) => a + c._count._all, 0);

  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Marketing
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Newsletter subscribers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} total · captured from the footer subscribe form.
          </p>
        </div>
        <a
          href="/api/admin/subscribers/export"
          download
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </header>

      <Filters filter={filter} counts={countBy} total={total} />

      {subscribers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 text-sm font-semibold">No subscribers yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            When visitors enter their email in the footer, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-medium">Email</th>
                <th className="px-4 py-3 text-start font-medium">Locale</th>
                <th className="px-4 py-3 text-start font-medium">Subscribed</th>
                <th className="px-4 py-3 text-end font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border/70 last:border-0 hover:bg-secondary/30"
                >
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${s.email}`}
                      className="font-medium text-foreground hover:text-primary"
                      dir="ltr"
                    >
                      {s.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium">
                      {LOCALE_LABEL[s.locale] ?? s.locale.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {dateFmt.format(s.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <SubscriberRowActions id={s.id} email={s.email} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subscribers.length === 500 ? (
        <p className="text-xs text-muted-foreground">
          Showing first 500 subscribers. Export CSV for the full list.
        </p>
      ) : null}
    </div>
  );
}

function Filters({
  filter,
  counts,
  total,
}: {
  filter: Filter;
  counts: Record<string, number>;
  total: number;
}) {
  const pills: Array<{ value: Filter; label: string; count: number }> = [
    { value: "all", label: "All", count: total },
    { value: "ar", label: "Arabic", count: counts.ar ?? 0 },
    { value: "en", label: "English", count: counts.en ?? 0 },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {pills.map((p) => (
        <Link
          key={p.value}
          href={p.value === "all" ? "/admin/subscribers" : `/admin/subscribers?locale=${p.value}`}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            filter === p.value
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          {p.label}
          {p.count > 0 ? (
            <span
              className={`rounded-full px-1.5 py-0 text-[10px] font-semibold ${
                filter === p.value
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {p.count}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
