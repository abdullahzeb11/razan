import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            background: "linear-gradient(135deg, #E6CE93 0%, #C9A961 100%)",
            transform: "rotate(45deg)",
            borderRadius: 2,
            boxShadow: "0 0 0 1.5px rgba(255,255,255,0.18)",
          }}
        />
      </div>
    ),
    size,
  );
}
