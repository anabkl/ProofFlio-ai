import {
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  Code2,
  FileText,
  FolderGit,
  GraduationCap,
  LayoutDashboard,
  Palette,
  Route,
  ScanSearch,
  Sparkles,
  Target,
  UserCheck,
} from "lucide-react";

export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];
export type Direction = "ltr" | "rtl";

export const localeMeta: Record<Locale, { label: string; name: string; dir: Direction }> = {
  en: { label: "EN", name: "English", dir: "ltr" },
  fr: { label: "FR", name: "Français", dir: "ltr" },
};

export const futureLocaleMeta = {
  ar: { label: "AR", name: "Arabic", dir: "rtl" as Direction },
};

export const templateIds = [
  "minimal-executive",
  "dark-tech",
  "creative-grid",
  "story-journey",
  "recruiter-focus",
] as const;

export type TemplateId = (typeof templateIds)[number];

export const templateMeta: Record<
  TemplateId,
  {
    icon: typeof BriefcaseBusiness;
    className: string;
    accent: string;
    previewClass: string;
  }
> = {
  "minimal-executive": {
    icon: BriefcaseBusiness,
    className: "template-minimal",
    accent: "#315dff",
    previewClass: "bg-[#f8f4ed] text-[#172033]",
  },
  "dark-tech": {
    icon: Code2,
    className: "template-dark",
    accent: "#4da3ff",
    previewClass: "bg-[#071021] text-white",
  },
  "creative-grid": {
    icon: Palette,
    className: "template-creative",
    accent: "#ff7a66",
    previewClass: "bg-[#fff8ed] text-[#151926]",
  },
  "story-journey": {
    icon: Route,
    className: "template-story",
    accent: "#67e8a5",
    previewClass: "bg-[#141014] text-[#fff9f2]",
  },
  "recruiter-focus": {
    icon: UserCheck,
    className: "template-recruiter",
    accent: "#0f766e",
    previewClass: "bg-[#f7f9fc] text-[#172033]",
  },
};

export const icons = {
  award: Award,
  badge: BadgeCheck,
  briefcase: BriefcaseBusiness,
  code: Code2,
  file: FileText,
  github: FolderGit,
  graduate: GraduationCap,
  dashboard: LayoutDashboard,
  scan: ScanSearch,
  sparkles: Sparkles,
  target: Target,
};

export const copy = {
  en: {
    nav: {
      product: "Product",
      demo: "Live demo",
      templates: "Templates",
      pricing: "Plans",
      editor: "Editor",
      create: "Create your portfolio",
      language: "Language",
    },
    common: {
      preview: "Preview template",
      useTemplate: "Use this template",
      create: "Create your portfolio",
      demo: "Explore a live demo",
      openEditor: "Open editor",
      viewTemplates: "View templates",
      proof: "Verified proof",
      draft: "Draft",
      published: "Published",
      score: "Readiness score",
      hosted: "Hosted portfolio",
    },
    hero: {
      eyebrow: "ProofFolio AI portfolio operating system",
      title: "ProofFolio AI",
      emphasis: "Turn your CV, GitHub and achievements into a living professional portfolio.",
      value:
        "A premium demo of the product experience for ambitious students, builders, designers and early-career professionals.",
      trust: ["Editable", "Privacy-controlled", "Hosted", "Multilingual"],
      pipeline: ["CV", "GitHub", "Certificates", "AI Intelligence", "Premium Live Portfolio"],
      mockupTitle: "Recruiter-ready snapshot",
      mockupSubtitle: "Frontend engineer · AI product builder",
      cards: [
        { label: "GitHub evidence", value: "38 repos mapped", icon: "github" },
        { label: "Certificate stack", value: "6 proofs attached", icon: "award" },
        { label: "Career signal", value: "Frontend + AI", icon: "target" },
      ],
    },
    transformation: {
      kicker: "Transformation demo",
      title: "From scattered proof to a coherent professional presence.",
      body:
        "ProofFolio turns disconnected career material into a structured portfolio story with evidence, clarity and hiring context.",
      beforeTitle: "Before",
      afterTitle: "After",
      before: ["Plain CV document", "Disconnected GitHub repositories", "Unstructured certificates", "Generic student profile"],
      after: ["Premium hosted portfolio", "Proof-of-work cards", "Readiness score", "Recruiter snapshot", "Explainable AI insights"],
    },
    intelligence: {
      kicker: "AI intelligence visualization",
      title: "Every recommendation is visible, explainable and editable.",
      body:
        "The interface presents what the assistant would read and what it would produce, while keeping this first pass as local mock data only.",
      inputTitle: "Input",
      outputTitle: "Output",
      inputs: ["CV text", "GitHub README", "Skills", "Certificates", "Project evidence"],
      outputs: ["Skill map", "Readiness score", "Career evolution", "Project descriptions", "Template recommendation"],
      labels: ["Evidence", "Signal strength", "Narrative", "Recommendation"],
    },
    templateShowcase: {
      kicker: "Template showcase",
      title: "Five templates, five different professional stories.",
      body:
        "Each template changes layout rhythm, typography, motion and mood so the portfolio fits the candidate rather than forcing everyone into one skin.",
    },
    proof: {
      kicker: "Proof of work and GitHub intelligence",
      title: "Projects become evidence, not a list of links.",
      body:
        "The demo organizes repositories, outcomes, certificates and writing into proof cards a recruiter can scan quickly.",
      stats: [
        ["12", "projects analyzed"],
        ["6", "verified certificates"],
        ["4", "career themes"],
        ["91", "portfolio score"],
      ],
      projects: [
        { name: "Atlas UI Systems", signal: "Design system · 18 reusable components", proof: "Storybook, accessibility notes, release changelog" },
        { name: "ModelOps Notes", signal: "AI workflow · local inference prototype", proof: "README, benchmark table, demo screenshots" },
        { name: "Campus Connect", signal: "Full-stack product · student services", proof: "API docs, deployment log, testing notes" },
      ],
    },
    career: {
      kicker: "Career evolution",
      title: "A living timeline shows where the profile is growing.",
      body:
        "The product demo maps skill momentum over time and turns it into a practical next-step recommendation.",
      skills: [
        ["Frontend", "92"],
        ["Backend", "76"],
        ["AI", "68"],
        ["Cloud", "63"],
        ["Data", "58"],
      ],
      recommendation:
        "Recommended focus: publish two AI-assisted interface case studies and add deployment evidence for the cloud track.",
    },
    recruiter: {
      kicker: "Recruiter snapshot",
      title: "A focused view for fast evaluation.",
      summary:
        "Candidate with strong product UI craft, credible implementation evidence and a clear AI tooling direction.",
      target: "Target role",
      role: "Frontend Engineer · AI Product Interfaces",
      availability: "Available for internships and junior roles",
      skills: ["React", "Design systems", "TypeScript", "AI workflows", "Accessibility"],
      contact: "Contact candidate",
    },
    plans: {
      kicker: "Plan comparison preview",
      title: "Simple packaging for a future SaaS model.",
      note: "Preview only. No payments or production billing are implemented in this demo.",
      tiers: [
        { name: "Starter", price: "$0", description: "One portfolio, core template library, local draft editing." },
        { name: "Pro", price: "$12", description: "Advanced templates, readiness insights and custom domain preview." },
        { name: "Career Studio", price: "$29", description: "Recruiter snapshots, guided improvements and team feedback workflows." },
      ],
    },
    finalCta: {
      title: "Build a portfolio that behaves like a product.",
      body: "Start with the editor demo, switch templates, tune the story and see how the public profile changes instantly.",
    },
    footer: {
      product: "Product demo",
      templates: "Templates",
      note:
        "ProofFolio AI is presented here as a bilingual UI demo using local mock data only. No external AI, GitHub connection, payments or persistence are active.",
    },
    demo: {
      kicker: "Live product demo",
      title: "A complete sample portfolio generated from realistic student evidence.",
      body:
        "This route shows how the dashboard, readiness score and public portfolio preview work together before any real backend is added.",
      tabs: ["Portfolio", "Evidence", "Readiness"],
      candidate: "Maya Chen",
      headline: "Product-minded frontend engineer building AI-assisted learning tools.",
      location: "Paris · Remote friendly",
      highlights: ["Shipped 4 polished demos", "Maintains an accessibility checklist", "Documents product decisions clearly"],
    },
    editor: {
      kicker: "Portfolio editor",
      title: "Tune the profile and watch the preview respond instantly.",
      body: "The editor is local-state only for this first pass, with a state model prepared for undo and redo.",
      status: "Saved locally",
      undo: "Undo",
      redo: "Redo",
      mobilePreview: "Mobile preview",
      desktopPreview: "Desktop preview",
      controls: {
        template: "Template",
        color: "Accent color",
        typography: "Typography",
        layout: "Layout",
        projects: "Project display",
        spacing: "Spacing",
        animation: "Animation level",
      },
      options: {
        typography: ["Editorial", "Technical", "Compact"],
        layout: ["Narrative", "Grid", "Snapshot"],
        projects: ["Case studies", "Evidence cards", "Repository feed"],
        spacing: ["Compact", "Balanced", "Airy"],
        animation: ["Reduced", "Refined", "Expressive"],
      },
      empty: "No project selected",
      loading: "Refreshing preview",
    },
    templates: {
      "minimal-executive": {
        name: "Minimal Executive",
        tag: "Elegant, calm, senior-facing.",
        motion: "Nearly static reveals, refined hover states and understated section transitions.",
        profile: "A precise portfolio for business-oriented technical candidates.",
      },
      "dark-tech": {
        name: "Dark Tech",
        tag: "Depth, blue lighting, developer energy.",
        motion: "Ambient depth, interactive project cards and GitHub activity rhythm.",
        profile: "A premium technical portfolio for builders with strong implementation evidence.",
      },
      "creative-grid": {
        name: "Creative Grid",
        tag: "Visual, modular, still professional.",
        motion: "Smooth gallery movement, project expansion and image-led rhythm.",
        profile: "A design-forward portfolio for creative technologists and interface designers.",
      },
      "story-journey": {
        name: "Story Journey",
        tag: "Career narrative with momentum.",
        motion: "Scroll-linked milestones, progressive reveals and timeline emphasis.",
        profile: "A storytelling portfolio for candidates changing levels, domains or roles.",
      },
      "recruiter-focus": {
        name: "Recruiter Focus",
        tag: "Fast scanning, high clarity.",
        motion: "Restrained scoring, clear actions and quick evidence access.",
        profile: "A concise portfolio for recruiters who need fit, proof and contact paths quickly.",
      },
    },
  },
  fr: {
    nav: {
      product: "Produit",
      demo: "Démo live",
      templates: "Modèles",
      pricing: "Offres",
      editor: "Éditeur",
      create: "Créer votre portfolio",
      language: "Langue",
    },
    common: {
      preview: "Prévisualiser le modèle",
      useTemplate: "Utiliser ce modèle",
      create: "Créer votre portfolio",
      demo: "Explorer une démo live",
      openEditor: "Ouvrir l'éditeur",
      viewTemplates: "Voir les modèles",
      proof: "Preuve vérifiée",
      draft: "Brouillon",
      published: "Publié",
      score: "Score de préparation",
      hosted: "Portfolio hébergé",
    },
    hero: {
      eyebrow: "Système de portfolio ProofFolio AI",
      title: "ProofFolio AI",
      emphasis: "Transformez votre CV, GitHub et vos réalisations en portfolio professionnel vivant.",
      value:
        "Une démo premium de l'expérience produit pour étudiants ambitieux, développeurs, designers et jeunes professionnels.",
      trust: ["Éditable", "Contrôle de confidentialité", "Hébergé", "Multilingue"],
      pipeline: ["CV", "GitHub", "Certificats", "Intelligence IA", "Portfolio live premium"],
      mockupTitle: "Aperçu prêt pour recruteur",
      mockupSubtitle: "Ingénieure frontend · créatrice produit IA",
      cards: [
        { label: "Preuves GitHub", value: "38 repos cartographiés", icon: "github" },
        { label: "Certificats", value: "6 preuves jointes", icon: "award" },
        { label: "Signal carrière", value: "Frontend + IA", icon: "target" },
      ],
    },
    transformation: {
      kicker: "Démo de transformation",
      title: "Des preuves dispersées vers une présence professionnelle cohérente.",
      body:
        "ProofFolio transforme les éléments de carrière isolés en histoire de portfolio structurée, claire et utile au recrutement.",
      beforeTitle: "Avant",
      afterTitle: "Après",
      before: ["CV simple", "Repos GitHub déconnectés", "Certificats non structurés", "Profil étudiant générique"],
      after: ["Portfolio premium hébergé", "Cartes de preuve de travail", "Score de préparation", "Aperçu recruteur", "Insights IA explicables"],
    },
    intelligence: {
      kicker: "Visualisation de l'intelligence IA",
      title: "Chaque recommandation reste visible, explicable et éditable.",
      body:
        "L'interface montre ce que l'assistant lirait et ce qu'il produirait, tout en restant sur des données locales fictives pour ce premier passage.",
      inputTitle: "Entrées",
      outputTitle: "Sorties",
      inputs: ["Texte du CV", "README GitHub", "Compétences", "Certificats", "Preuves projet"],
      outputs: ["Carte de compétences", "Score de préparation", "Évolution de carrière", "Descriptions projets", "Recommandation de modèle"],
      labels: ["Preuve", "Force du signal", "Narratif", "Recommandation"],
    },
    templateShowcase: {
      kicker: "Galerie de modèles",
      title: "Cinq modèles, cinq façons de raconter un parcours.",
      body:
        "Chaque modèle change le rythme de mise en page, la typographie, le mouvement et l'ambiance pour s'adapter au candidat.",
    },
    proof: {
      kicker: "Preuves de travail et intelligence GitHub",
      title: "Les projets deviennent des preuves, pas une simple liste de liens.",
      body:
        "La démo organise repositories, résultats, certificats et écrits en cartes de preuve faciles à scanner.",
      stats: [
        ["12", "projets analysés"],
        ["6", "certificats vérifiés"],
        ["4", "thèmes carrière"],
        ["91", "score portfolio"],
      ],
      projects: [
        { name: "Atlas UI Systems", signal: "Design system · 18 composants réutilisables", proof: "Storybook, notes accessibilité, changelog" },
        { name: "ModelOps Notes", signal: "Workflow IA · prototype local", proof: "README, table de benchmark, captures démo" },
        { name: "Campus Connect", signal: "Produit full-stack · services étudiants", proof: "Docs API, journal de déploiement, notes de test" },
      ],
    },
    career: {
      kicker: "Évolution de carrière",
      title: "Une timeline vivante montre la progression du profil.",
      body:
        "La démo cartographie la dynamique des compétences dans le temps et la transforme en prochaine action concrète.",
      skills: [
        ["Frontend", "92"],
        ["Backend", "76"],
        ["IA", "68"],
        ["Cloud", "63"],
        ["Data", "58"],
      ],
      recommendation:
        "Priorité recommandée : publier deux cas d'étude d'interfaces assistées par IA et ajouter des preuves de déploiement pour l'axe cloud.",
    },
    recruiter: {
      kicker: "Aperçu recruteur",
      title: "Une vue concentrée pour évaluer rapidement.",
      summary:
        "Candidate avec une forte qualité d'interface produit, des preuves d'implémentation crédibles et une direction claire autour des outils IA.",
      target: "Rôle cible",
      role: "Ingénieure Frontend · Interfaces produit IA",
      availability: "Disponible pour stages et premiers postes",
      skills: ["React", "Design systems", "TypeScript", "Workflows IA", "Accessibilité"],
      contact: "Contacter la candidate",
    },
    plans: {
      kicker: "Aperçu des offres",
      title: "Un packaging simple pour un futur modèle SaaS.",
      note: "Aperçu uniquement. Aucun paiement ni billing de production n'est implémenté dans cette démo.",
      tiers: [
        { name: "Starter", price: "0 $", description: "Un portfolio, bibliothèque de modèles de base, édition locale du brouillon." },
        { name: "Pro", price: "12 $", description: "Modèles avancés, insights de préparation et aperçu de domaine personnalisé." },
        { name: "Career Studio", price: "29 $", description: "Aperçus recruteur, améliorations guidées et retours d'équipe." },
      ],
    },
    finalCta: {
      title: "Construisez un portfolio qui se comporte comme un produit.",
      body: "Commencez avec l'éditeur démo, changez de modèle, ajustez le récit et voyez le profil public évoluer instantanément.",
    },
    footer: {
      product: "Démo produit",
      templates: "Modèles",
      note:
        "ProofFolio AI est présentée ici comme démo UI bilingue avec données locales fictives. Aucune IA externe, connexion GitHub, paiement ou persistance n'est active.",
    },
    demo: {
      kicker: "Démo produit live",
      title: "Un portfolio exemple complet généré depuis des preuves étudiantes réalistes.",
      body:
        "Cette route montre comment le dashboard, le score de préparation et l'aperçu public fonctionnent ensemble avant tout backend réel.",
      tabs: ["Portfolio", "Preuves", "Préparation"],
      candidate: "Maya Chen",
      headline: "Ingénieure frontend orientée produit, créatrice d'outils d'apprentissage assistés par IA.",
      location: "Paris · Ouverte au remote",
      highlights: ["4 démos soignées livrées", "Checklist accessibilité maintenue", "Décisions produit documentées clairement"],
    },
    editor: {
      kicker: "Éditeur de portfolio",
      title: "Ajustez le profil et observez l'aperçu répondre instantanément.",
      body: "L'éditeur utilise seulement l'état local dans ce premier passage, avec une structure prête pour annuler et rétablir.",
      status: "Enregistré localement",
      undo: "Annuler",
      redo: "Rétablir",
      mobilePreview: "Aperçu mobile",
      desktopPreview: "Aperçu desktop",
      controls: {
        template: "Modèle",
        color: "Couleur d'accent",
        typography: "Typographie",
        layout: "Mise en page",
        projects: "Affichage projets",
        spacing: "Espacement",
        animation: "Niveau d'animation",
      },
      options: {
        typography: ["Éditoriale", "Technique", "Compacte"],
        layout: ["Narratif", "Grille", "Snapshot"],
        projects: ["Cas d'étude", "Cartes de preuve", "Flux repository"],
        spacing: ["Compact", "Équilibré", "Aérien"],
        animation: ["Réduit", "Raffiné", "Expressif"],
      },
      empty: "Aucun projet sélectionné",
      loading: "Actualisation de l'aperçu",
    },
    templates: {
      "minimal-executive": {
        name: "Minimal Executive",
        tag: "Élégant, calme, orienté senior.",
        motion: "Reveals presque statiques, survols raffinés et transitions discrètes.",
        profile: "Un portfolio précis pour candidats techniques proches du business.",
      },
      "dark-tech": {
        name: "Dark Tech",
        tag: "Profondeur, lumière bleue, énergie développeur.",
        motion: "Profondeur ambiante, cartes projet interactives et rythme GitHub.",
        profile: "Un portfolio technique premium pour builders avec preuves solides.",
      },
      "creative-grid": {
        name: "Creative Grid",
        tag: "Visuel, modulaire, toujours professionnel.",
        motion: "Mouvement de galerie fluide, expansion projet et rythme image.",
        profile: "Un portfolio design-forward pour creative technologists et designers UI.",
      },
      "story-journey": {
        name: "Story Journey",
        tag: "Narration de carrière avec élan.",
        motion: "Jalons liés au scroll, reveals progressifs et timeline centrale.",
        profile: "Un portfolio narratif pour candidats en progression, reconversion ou pivot.",
      },
      "recruiter-focus": {
        name: "Recruiter Focus",
        tag: "Scan rapide, clarte maximale.",
        motion: "Score retenu, actions nettes et acces rapide aux preuves.",
        profile: "Un portfolio concis pour recruteurs qui veulent fit, preuve et contact vite.",
      },
    },
  },
} as const;

export type Copy = (typeof copy)["en"];

export function getCopy(locale: Locale): Copy {
  return copy[locale] as Copy;
}
