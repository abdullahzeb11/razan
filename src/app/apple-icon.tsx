import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0E6E5A 0%, #08433B 100%)",
          // Apple touch icons should be a full square — iOS rounds corners.
        }}
      >
        {/* Eight-fold star: two squares rotated 45° */}
        <div
          style={{
            position: "relative",
            width: 96,
            height: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 96,
              height: 96,
              background: "linear-gradient(135deg, #E6CE93 0%, #C9A961 100%)",
              borderRadius: 8,
              opacity: 0.55,
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 96,
              height: 96,
              background: "linear-gradient(135deg, #E6CE93 0%, #C9A961 100%)",
              borderRadius: 8,
            }}
          />
          {/* Inner emerald circle for the "drop" center */}
          <div
            style={{
              position: "relative",
              width: 30,
              height: 30,
              borderRadius: 999,
              background:
                "linear-gradient(135deg, #08433B 0%, #0E6E5A 100%)",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
