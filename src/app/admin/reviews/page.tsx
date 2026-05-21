import Link from "next/link";
import { MessageSquareQuote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ReviewRow } from "@/components/admin/review-row";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reviews" };

type Filter = "pending" | "approved" | "featured" | "all";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter = (sp.filter ?? "pending") as Filter;

  const where = (() => {
    switch (filter) {
      case "approved":
        return { approved: true };
      case "featured":
        return { featured: true };
      case "all":
        return {};
      default:
        return { approved: false };
    }
  })();

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Social proof
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Reviews
          </h1>
        </div>

        <nav className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          <Tab href="?filter=pending" label="Pending" current={filter === "pending"} />
          <Tab href="?filter=approved" label="Approved" current={filter === "approved"} />
          <Tab href="?filter=featured" label="Featured" current={filter === "featured"} />
          <Tab href="?filter=all" label="All" current={filter === "all"} />
        </nav>
      </header>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <MessageSquareQuote className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No reviews in this view yet. They land here when customers submit them
            after appointments.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {reviews.map((r) => (
            <ReviewRow
              key={r.id}
              id={r.id}
              authorName={r.authorName}
              rating={r.rating}
              body={r.body}
              approved={r.approved}
              featured={r.featured}
              createdAt={r.createdAt.toISOString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Tab({
  href,
  label,
  current,
}: {
  href: string;
  label: string;
  current: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
        current
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
