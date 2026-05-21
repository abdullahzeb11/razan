"use client";

import * as React from "react";

/**
 * Hand-rolled responsive area chart. No external dep, ~1kb.
 * Pass an array of {label, value}. We auto-scale Y and draw a smooth path.
 */
export function RevenueChart({
  points,
  unit = "SAR",
}: {
  points: { label: string; value: number }[];
  unit?: string;
}) {
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  const width = 720;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 28, left: 44 };

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(1, ...points.map((p) => p.value));
  // Round max up to a nicer tick value
  const niceMax = niceCeiling(max);

  const xStep = points.length > 1 ? innerW / (points.length - 1) : 0;

  const coords = points.map((p, i) => ({
    x: padding.left + i * xStep,
    y: padding.top + innerH - (p.value / niceMax) * innerH,
  }));

  const linePath = smoothPath(coords);
  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x} ${padding.top + innerH} L ${coords[0].x} ${padding.top + innerH} Z`
      : "";

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((niceMax / yTicks) * i),
  );

  const hovered = hoverIndex !== null ? coords[hoverIndex] : null;
  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[260px] w-full"
        role="img"
        aria-label="Revenue last 30 days"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="rc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y grid + labels */}
        {tickValues.map((v, i) => {
          const y = padding.top + innerH - (v / niceMax) * innerH;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={padding.left + innerW}
                y1={y}
                y2={y}
                stroke="hsl(var(--border))"
                strokeDasharray={i === 0 ? "0" : "2 4"}
                strokeWidth="0.75"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
              </text>
            </g>
          );
        })}

        {/* X labels — every 5th to avoid crowding */}
        {points.map((p, i) => {
          if (i % Math.max(1, Math.floor(points.length / 6)) !== 0) return null;
          return (
            <text
              key={p.label + i}
              x={padding.left + i * xStep}
              y={height - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {p.label}
            </text>
          );
        })}

        {/* Area + line */}
        {areaPath ? (
          <path d={areaPath} fill="url(#rc-area)" />
        ) : null}
        {linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {/* Hover capture */}
        {coords.map((c, i) => (
          <rect
            key={i}
            x={c.x - xStep / 2}
            y={padding.top}
            width={xStep || 8}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
          />
        ))}

        {/* Hover marker */}
        {hovered && hoveredPoint ? (
          <g>
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={padding.top}
              y2={padding.top + innerH}
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <circle
              cx={hovered.x}
              cy={hovered.y}
              r="5"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--background))"
              strokeWidth="2"
            />
          </g>
        ) : null}
      </svg>

      {hovered && hoveredPoint ? (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-elevated"
          style={{
            left: `${(hovered.x / width) * 100}%`,
            top: `${(hovered.y / height) * 100}%`,
          }}
        >
          <p className="font-semibold">
            {hoveredPoint.value.toLocaleString()} {unit}
          </p>
          <p className="text-[10px] text-muted-foreground">{hoveredPoint.label}</p>
        </div>
      ) : null}
    </div>
  );
}

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  const path = [`M ${pts[0].x} ${pts[0].y}`];
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    path.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`);
  }
  return path.join(" ");
}

function niceCeiling(v: number): number {
  if (v <= 10) return 10;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / pow;
  const niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return niceNorm * pow;
}
