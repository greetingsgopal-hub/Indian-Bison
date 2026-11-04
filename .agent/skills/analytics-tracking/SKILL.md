---
name: analytics-tracking
description: >-
  Product & conversion telemetry skill. Ensures every CTA button, lead capture form, WhatsApp launch action, quotation toggle, and authentication event includes clean, structured telemetry tracking handlers compatible with PostHog and Google Analytics 4 (GA4 / gtag).
---

# Analytics & Conversion Tracking Skill

## Core Directives

1. **Mandatory Event Instrumentation**
   - Every interactive conversion element MUST trigger a unified telemetry dispatcher (`window.trackConversionEvent(eventName, properties)`), forwarding automatically to **PostHog** (`window.posthog?.capture`) and **GA4** (`window.gtag?.('event', ...)`), plus a local audit log for offline/CRM inspection.

2. **Required Tracked Events**
   - **CTA Clicks (`cta_clicked`)**: `{ cta_id, cta_label,hook_mode, lead_rank, business_name, setup_fee_inr }`
   - **WhatsApp Outbound Launch (`whatsapp_outreach_launched`)**: `{ lead_rank, business_name, phone_whatsapp, message_mode, setup_fee_inr, annual_deal_value_inr }`
   - **Quotation Viewed / Loaded (`quotation_loaded`)**: `{ lead_rank, business_name, package_name, setup_fee_inr, monthly_retainer_inr }`
   - **Lead Capture / Prospect Added (`lead_captured`)**: `{ business_name, locality, setup_fee_inr, source }`
   - **Pipeline Stage Changed (`pipeline_stage_updated`)**: `{ lead_rank, business_name, previous_status, new_status, deal_value_inr }`
   - **Authentication / Cloud Sync (`auth_or_sync_event`)**: `{ provider, project_id, doc_count, status }`

3. **Clean Telemetry Implementation Pattern**
   ```javascript
   window.trackEvent = function(eventName, payload = {}) {
     const enriched = {
       ...payload,
       timestamp: new Date().toISOString(),
       campaign: "greater_noida_dentists"
     };
     if (typeof window.posthog?.capture === "function") {
       window.posthog.capture(eventName, enriched);
     }
     if (typeof window.gtag === "function") {
       window.gtag("event", eventName, enriched);
     }
     console.debug("[Telemetry]", eventName, enriched);
   };
   ```
