import { notFound } from "next/navigation";
import { TemplatePageView } from "@/components/product-views";
import { templateIds, type TemplateId } from "@/lib/content";

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

  return <TemplatePageView templateId={template as TemplateId} />;
}

