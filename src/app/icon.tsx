import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#8B3A2A",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Moroccan arch silhouette */}
        <div
          style={{
            position: "absolute",
            width: 14,
            height: 18,
            background: "#F5F0E8",
            borderRadius: "7px 7px 2px 2px",
            opacity: 0.92,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
