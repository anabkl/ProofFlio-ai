"use client";

import { CareerChronicleTemplate } from "@/components/templates/career-chronicle-template";
import { CreativeGridTemplate } from "@/components/templates/creative-grid-template";
import { DarkTechTemplate } from "@/components/templates/dark-tech-template";
import { DeveloperSignatureTemplate } from "@/components/templates/developer-signature-template";
import { MinimalExecutiveTemplate } from "@/components/templates/minimal-executive-template";
import { MonographTemplate } from "@/components/templates/monograph-template";
import { RecruiterFocusTemplate } from "@/components/templates/recruiter-focus-template";
import { SignalOsTemplate } from "@/components/templates/signal-os-template";
import { StoryJourneyTemplate } from "@/components/templates/story-journey-template";
import type { TemplateId } from "@/lib/content";

export function LivingTemplatePage({ templateId }: { templateId: TemplateId }) {
  if (templateId === "minimal-executive") {
    return <MinimalExecutiveTemplate />;
  }

  if (templateId === "dark-tech") {
    return <DarkTechTemplate />;
  }

  if (templateId === "creative-grid") {
    return <CreativeGridTemplate />;
  }

  if (templateId === "story-journey") {
    return <StoryJourneyTemplate />;
  }

  if (templateId === "recruiter-focus") {
    return <RecruiterFocusTemplate />;
  }

  if (templateId === "developer-signature") {
    return <DeveloperSignatureTemplate />;
  }

  if (templateId === "career-chronicle") {
    return <CareerChronicleTemplate />;
  }

  if (templateId === "signal-os") {
    return <SignalOsTemplate />;
  }

  if (templateId === "monograph") {
    return <MonographTemplate />;
  }

  return <RecruiterFocusTemplate />;
}
