import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion vocabulary for ProofFolio AI.
 * Timing bands: instant feedback (100-160ms), standard interaction
 * (180-260ms), panel transition (280-380ms), section reveal (450-650ms),
 * plus a restrained spring for selected cards/nav indicators.
 */
export const durations = {
  instant: 0.12,
  standard: 0.22,
  panel: 0.32,
  reveal: 0.55,
} as const;

export const easings = {
  standard: [0.2, 0.8, 0.2, 1] as const,
  entrance: [0.16, 1, 0.3, 1] as const,
};

export const springSelected: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 28,
  mass: 0.9,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.reveal, ease: easings.entrance },
  },
};

export const panelEnter: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.panel, ease: easings.standard },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: durations.standard, ease: easings.standard },
  },
};

export const cardSelect: Variants = {
  rest: { scale: 1, y: 0 },
  selected: { scale: 1.015, y: -2, transition: springSelected },
};

export const staggerChildren = (stagger = 0.06): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger },
  },
});

/** Section reveal: fade/translate in once, respecting reduced motion via viewport-once. */
export const sectionReveal = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, margin: "-80px" },
  variants: fadeUp,
} as const;
