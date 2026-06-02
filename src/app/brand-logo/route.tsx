import { ImageResponse } from "next/og";

/**
 * High-resolution brand logo (1024×1024) for external use —
 * Google Business Profile, social media avatars, partner directories, etc.
 * Same eight-pointed Islamic star design as the favicon/apple-icon,
 * rendered at full size with no rounded corners (so it works as a square
 * avatar that platforms can crop into circles if they want).
 */
export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0E6E5A 0%, #08433B 100%)",
        }}
      >
        {/* Eight-pointed Islamic star: two squares rotated 45° */}
        <div
          style={{
            position: "relative",
            width: 540,
            height: 540,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 540,
              height: 540,
              background:
                "linear-gradient(135deg, #E6CE93 0%, #C9A961 100%)",
              borderRadius: 40,
              opacity: 0.55,
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 540,
              height: 540,
              background:
                "linear-gradient(135deg, #E6CE93 0%, #C9A961 100%)",
              borderRadius: 40,
            }}
          />
          {/* Inner emerald "drop" center */}
          <div
            style={{
              position: "relative",
              width: 170,
              height: 170,
              borderRadius: 999,
              background:
                "linear-gradient(135deg, #08433B 0%, #0E6E5A 100%)",
            }}
          />
        </div>
      </div>
    ),
    { width: 1024, height: 1024 },
  );
}
