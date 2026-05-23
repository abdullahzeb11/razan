import Link from "next/link";
import { Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MessageCard, type MessageCardData } from "@/components/admin/message-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

type Filter = "all" | "NEW" | "READ" | "REPLIED" | "ARCHIVED";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter: Filter =
    status === "NEW" ||
    status === "READ" ||
    status === "REPLIED" ||
    status === "ARCHIVED"
      ? status
      : "all";

  const [messages, counts] = await Promise.all([
    prisma.contactMessage.findMany({
      where: filter === "all" ? undefined : { status: filter },
      orderBy: [{ createdAt: "desc" }],
      take: 100,
    }),
    prisma.contactMessage.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countByStatus = Object.fromEntries(
    counts.map((c) => [c.status, c._count._all]),
  ) as Record<string, number>;
  const total = counts.reduce((a, c) => a + c._count._all, 0);

  const cards: MessageCardData[] = messages.map((m) => ({
    id: m.id,
    name: m.name,
    phone: m.phone,
    email: m.email,
    subject: m.subject,
    message: m.message,
    status: m.status,
    source: m.source,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Inbox
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Messages
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} total · contact form submissions from the public site.
        </p>
      </header>

      <Filters filter={filter} counts={countByStatus} total={total} />

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 text-sm font-semibold">
            {filter === "all" ? "No messages yet" : `No ${filter.toLowerCase()} messages`}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter === "all"
              ? "When visitors submit the contact form, their messages will appear here."
              : "Try a different filter."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {cards.map((m) => (
            <MessageCard key={m.id} message={m} />
          ))}
        </div>
      )}
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
    { value: "NEW", label: "New", count: counts.NEW ?? 0 },
    { value: "READ", label: "Read", count: counts.READ ?? 0 },
    { value: "REPLIED", label: "Replied", count: counts.REPLIED ?? 0 },
    { value: "ARCHIVED", label: "Archived", count: counts.ARCHIVED ?? 0 },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {pills.map((p) => (
        <Link
          key={p.value}
          href={p.value === "all" ? "/admin/messages" : `/admin/messages?status=${p.value}`}
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
