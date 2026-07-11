import { notFound } from "next/navigation";
import { TemplatePageView } from "@/components/product-views";
import { templateIds, type TemplateId } from "@/lib/content";
import { getMarketingUser } from "@/lib/auth/session";

export function generateStaticParams() {
  return templateIds.map((template) => ({ template }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ template: string }>;
}) {
  const { template } = await params;

  if (!templateIds.includes(template as TemplateId)) {
    notFound();
  }

  const user = await getMarketingUser();

  return <TemplatePageView templateId={template as TemplateId} user={user} />;
}
