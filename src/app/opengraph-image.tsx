import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Al-Shifa Hijama Center";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #08433B 0%, #0E6E5A 60%, #08433B 100%)",
          color: "#FAF8F3",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "linear-gradient(135deg, #E6CE93, #C9A961)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, fontWeight: 600 }}>Al-Shifa</div>
            <div
              style={{
                fontSize: 13,
                letterSpacing: 4,
                color: "#C9A961",
                textTransform: "uppercase",
              }}
            >
              Hijama Center
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: -2,
            }}
          >
            The sunnah of healing,
            <br />
            <span
              style={{
                background:
                  "linear-gradient(110deg, #E6CE93, #C9A961, #E6CE93)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              refined.
            </span>
          </div>
          <div
            style={{
              fontSize: 22,
              color: "rgba(250, 248, 243, 0.75)",
              maxWidth: 760,
            }}
          >
            Licensed prophetic cupping in Saudi Arabia. Single-use sterile tools,
            certified practitioners, in-clinic and home visits.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
            color: "rgba(250, 248, 243, 0.6)",
          }}
        >
          <div>alshifa.sa</div>
          <div>Riyadh · Jeddah · Home visits</div>
        </div>
      </div>
    ),
    size,
  );
}
