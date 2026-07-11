import type { MetadataRoute } from "next";
import { getPublishedPortfolioSlugs } from "@/lib/public-portfolios";
import { buildAbsoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedPortfolios = await getPublishedPortfolioSlugs();

  return [
    {
      url: buildAbsoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: buildAbsoluteUrl("/templates"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...publishedPortfolios.map((portfolio) => ({
      url: buildAbsoluteUrl(`/p/${portfolio.slug}`),
      lastModified: portfolio.updatedAt ? new Date(portfolio.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
