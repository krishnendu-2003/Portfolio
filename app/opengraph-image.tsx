import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "#008080",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#c0c0c0",
            border: "4px solid #000000",
            padding: "48px 56px",
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 700, color: "#000000" }}>
            Krishnendu Samanta
          </div>
          <div style={{ fontSize: 28, color: "#333333", marginTop: 16 }}>
            AI/ML and frontend engineer
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
