import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#8B3A2A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {/* Moroccan keyhole arch */}
        <div
          style={{
            width: 68,
            height: 88,
            background: "#F5F0E8",
            borderRadius: "34px 34px 6px 6px",
            opacity: 0.92,
            marginBottom: 8,
          }}
        />
        {/* Gold bar */}
        <div
          style={{
            width: 80,
            height: 5,
            background: "#B8943F",
            borderRadius: 3,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
