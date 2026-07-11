import type { Metadata } from "next";
import { PublicPortfolioPage } from "@/components/public/public-portfolio-page";
import { getPublicPortfolioData } from "@/lib/public-portfolios";
import { buildAbsoluteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = await getPublicPortfolioData({ slug, preview: false });
  const description = portfolio.headline || "Evidence-backed portfolio with user-approved work and source-linked projects.";
  const canonical = buildAbsoluteUrl(`/p/${portfolio.slug}`);

  return {
    title: `${portfolio.displayName} | ${portfolio.title}`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${portfolio.displayName} | ${portfolio.title}`,
      description,
      url: canonical,
      type: "profile",
      images: [
        {
          url: buildAbsoluteUrl(`/p/${portfolio.slug}/opengraph-image`),
          width: 1200,
          height: 630,
          alt: portfolio.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${portfolio.displayName} | ${portfolio.title}`,
      description,
      images: [buildAbsoluteUrl(`/p/${portfolio.slug}/opengraph-image`)],
    },
  };
}

export default async function PublicPortfolioRoute({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const preview = resolvedSearchParams.preview === "1";
  const portfolioId =
    typeof resolvedSearchParams.portfolio === "string" ? resolvedSearchParams.portfolio : undefined;
  const portfolio = await getPublicPortfolioData({ slug, preview, portfolioId });

  return <PublicPortfolioPage portfolio={portfolio} />;
}
