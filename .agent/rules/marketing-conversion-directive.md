---
trigger: always_on
description: Enforces Marketing & Conversion Skills (conversion-copywriter, technical-seo, analytics-tracking, aso-strategist) and High-Conversion UI Patterns across all landing pages, UI copy, metadata, and mobile/desktop onboarding.
---

# Marketing & Conversion Engineering Directive

Before building landing pages, UI copy, metadata, or mobile/desktop user onboarding:

1. **Activate Marketing Guidelines in `.agent/skills/`**:
   - `conversion-copywriter`: Ban generic placeholder copy (e.g., "Welcome to our platform"). Use Problem-Agitation-Solution (PAS) messaging focused on user transformation and quantified ₹ ROI.
   - `technical-seo`: Enforce automated OpenGraph meta tags, Twitter card tags, `sitemap.ts` / `sitemap.xml` generation, and JSON-LD schema on all marketing routes.
   - `analytics-tracking`: Every CTA button, lead capture form, and authentication/sync event must include clean telemetry tracking handlers (PostHog/GA4).
   - `aso-strategist`: Prepare the App Store and Google Play metadata package (promotional text, keywords, and release notes) alongside mobile/PWA client builds.

2. **Enforce High-Conversion UI Patterns**:
   - **Above-the-fold value proposition clarity**: Immediate PAS headline and quantified Rupee pipeline/ROI metrics visible without scrolling.
   - **Prominent trust badges and social proof blocks**: Live verified review counts, NCR market-rate benchmarks, and security/compliance badges.
   - **Single clear primary action per screen**: One unmistakable primary conversion CTA per view.
