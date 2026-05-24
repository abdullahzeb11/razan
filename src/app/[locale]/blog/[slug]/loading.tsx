export default function PostLoading() {
  return (
    <article className="relative pb-24 pt-10 sm:pt-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10),transparent_60%)]" />

      <div className="container-wide max-w-3xl">
        {/* Back-link skeleton */}
        <div className="h-5 w-32 animate-pulse rounded bg-secondary" />

        {/* Category pill */}
        <div className="mt-6 h-7 w-24 animate-pulse rounded-full bg-secondary" />

        {/* Title */}
        <div className="mt-4 space-y-3">
          <div className="h-12 w-full animate-pulse rounded bg-secondary" />
          <div className="h-12 w-3/4 animate-pulse rounded bg-secondary" />
        </div>

        {/* Excerpt */}
        <div className="mt-6 space-y-2">
          <div className="h-5 w-full animate-pulse rounded bg-secondary" />
          <div className="h-5 w-5/6 animate-pulse rounded bg-secondary" />
        </div>

        {/* Meta row */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
        </div>

        {/* Cover image */}
        <div className="mt-10 aspect-[16/9] w-full animate-pulse rounded-2xl bg-secondary" />

        {/* Body */}
        <div className="mt-10 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`h-4 animate-pulse rounded bg-secondary ${i % 4 === 3 ? "w-2/3" : "w-full"}`}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
