import { ImageResponse } from "next/og";
import { getPublicPortfolioData } from "@/lib/public-portfolios";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portfolio = await getPublicPortfolioData({ slug, preview: false });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background: "linear-gradient(180deg, #071021 0%, #040813 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            border: `1px solid ${portfolio.designSettings.accent}`,
            color: portfolio.designSettings.accent,
            borderRadius: 999,
            padding: "10px 18px",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Evidence-backed portfolio
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 28, opacity: 0.72 }}>{portfolio.displayName}</div>
          <div style={{ fontSize: 74, lineHeight: 1.05, fontWeight: 800, maxWidth: 920 }}>{portfolio.title}</div>
          <div style={{ fontSize: 30, opacity: 0.78, maxWidth: 900 }}>{portfolio.headline}</div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          <div
            style={{
              borderRadius: 22,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "18px 22px",
              fontSize: 24,
            }}
          >
            {portfolio.proofCount} verified signals
          </div>
          <div
            style={{
              borderRadius: 22,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "18px 22px",
              fontSize: 24,
            }}
          >
            {portfolio.projects.length} source-linked projects
          </div>
        </div>
      </div>
    ),
    size,
  );
}
