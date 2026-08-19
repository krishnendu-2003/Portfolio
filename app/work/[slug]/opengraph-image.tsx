import { ImageResponse } from "next/og";
import { caseBySlug } from "@/content/cases";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = caseBySlug[slug];
  const title = item?.title ?? "Krishnendu Samanta";
  const role = item?.role ?? "";

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
            maxWidth: "900px",
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 700, color: "#000000" }}>{title}</div>
          {role && (
            <div style={{ fontSize: 28, color: "#333333", marginTop: 16 }}>{role}</div>
          )}
          <div style={{ fontSize: 24, color: "#000080", marginTop: 32 }}>
            Krishnendu Samanta
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
