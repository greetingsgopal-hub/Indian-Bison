---
name: technical-seo
description: >-
  Technical SEO and structured data enforcement skill. Enforces automated OpenGraph meta tags, Twitter Card tags, canonical URLs, sitemap.ts / sitemap.xml generation, and JSON-LD schema (LocalBusiness, Dentist, SoftwareApplication, FAQPage) on all marketing routes and client landing pages.
---

# Technical SEO Skill

## Core Directives

Before shipping any landing page, clinic prototype, or marketing route, enforce all four pillars below:

1. **Automated Meta & OpenGraph Tags**
   - Every route must include:
     - `<title>` (50–60 chars, primary local keyword + city/sector + brand)
     - `<meta name="description">` (140–160 chars, PAS summary + phone/CTA)
     - `<link rel="canonical" href="...">`
     - Complete OpenGraph tags (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:locale="en_IN"`)
     - Complete Twitter Card tags (`twitter:card="summary_large_image"`, `twitter:title`, `twitter:description`, `twitter:image`)

2. **JSON-LD Structured Data Schema (`application/ld+json`)**
   - Inject valid Schema.org JSON-LD into `<head>` for every marketing or local business route:
     - For Dental / Medical Clinics: `@type: ["Dentist", "MedicalBusiness", "LocalBusiness"]` including `name`, `telephone`, `priceRange`, `address` (`PostalAddress` with sector, city, `postalCode`, `addressRegion: "UP"`, `addressCountry: "IN"`), `geo`, `openingHoursSpecification`, and `aggregateRating`.
     - For SaaS / CRM Routes: `@type: "SoftwareApplication"` with `applicationCategory: "BusinessApplication"`, `offers`, and `aggregateRating`.

3. **Automated `sitemap.ts` / `sitemap.xml` & `robots.txt`**
   - In Next.js / TypeScript projects, generate a dynamic `app/sitemap.ts` and `app/robots.ts`.
   - In static / Firebase Hosting builds, generate `public/sitemap.xml` and `public/robots.txt` referencing all live routes with `lastmod`, `changefreq`, and `priority`.

4. **Core Web Vitals & Local Pack Signals**
   - Enforce semantic heading hierarchy (single `<h1>` containing the target locality + niche), responsive WebP/SVG assets, and zero render-blocking scripts.
