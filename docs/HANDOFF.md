# ProofFolio AI Handoff

## What Changed In This Sprint

- Upgraded the landing page with stronger hero signals, approval-based AI framing, and a product workflow section.
- Added a premium visual refinement pass across hero depth, layered product mockups, animated lighting, dynamic backgrounds, and template-specific atmospheres.
- Replaced generic pricing with the correct Free / Student / VIP model in English and French.
- Added monthly/yearly pricing toggle and a responsive feature comparison table.
- Replaced static template detail pages with five distinct living portfolio experiences.
- Improved editor status polish with visible draft and published-preview states.
- Updated smoke tests for pricing, language switching, template navigation, and creative project expansion.

## Routes To Review

- `/`
- `/demo`
- `/templates`
- `/templates/minimal-executive`
- `/templates/dark-tech`
- `/templates/creative-grid`
- `/templates/story-journey`
- `/templates/recruiter-focus`
- `/editor`

## Template Notes

- Minimal Executive: calm editorial layout, progress indicator, skill bars, contact panel, mobile work carousel.
- Dark Tech: flagship dark developer atmosphere, role ticker, command console, activity heatmap, system signals, project cards, skill constellation.
- Creative Grid: visual adaptive grid, category filtering, expandable project modal.
- Story Journey: narrative timeline, sticky chapter indicator, expandable learning panels, career graph.
- Recruiter Focus: high-signal summary, scan rail, top proof cards, skill clusters, CV preview panel.

## Current Limitations

- Local UI demo only.
- No authentication, onboarding backend, database, persistence, GitHub OAuth, LinkedIn connection, CV parsing, real AI, payment processing, analytics persistence, notifications, moderation, or admin tooling.
- The 3D experience is isolated to the landing hero and has static/reduced-motion/mobile fallbacks.

## Commands

```bash
npm run lint
npm run build
npm run test:e2e
```
