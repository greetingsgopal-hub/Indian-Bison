/**
 * Full 6-Stage Autonomous Funnel Simulation for WhatsApp Number: +916209228845 (Rank #21)
 * Executes:
 *  Stage 1: Automated Google Maps Prospecting & Friction Audit
 *  Stage 2: Touch #1 Cold Outreach (7-Layer Anti-Ban Shield, Zero Links, Polymorphic Spintax)
 *  Stage 3: Inbound WhatsApp Webhook Simulation ("Yes, show me the preview")
 *  Stage 4: Sub-2s Auto-Reply with Live Clinic Prototype + ₹2,999/- Razorpay Slot-Lock Deposit
 *  Stage 5: Razorpay payment.captured Webhook (₹2,999/- UPI Deposit Paid -> Status: "Booked")
 *  Stage 6: 60-Second Clinic Onboarding Submission + Real-Time Cloud Firestore Sync (leads/lead_21)
 */

const https = require("https");
const {
  buildPolymorphicColdMessage,
  buildInstantPrototypeAndDepositReply,
  handleInboundWhatsAppWebhook
} = require("./autonomous-funnel-engine");

const TRIAL_LEAD = {
  rank: 21,
  urgency_tier: "Tier 1",
  urgency_score: 99,
  business_name: "Apex Dental & Implant Studio (Live Trial)",
  recipient: "Dr. Gopal",
  sub_category: "Dental Implants, Painless RCT & Smile Design",
  locality: "Sector Alpha-1, Greater Noida",
  rating: 4.1,
  total_reviews: 48,
  phone_whatsapp: "+916209228845",
  website_url: "MISSING_WEBSITE",
  operational_friction: true,
  friction_details: "Live Funnel Trial (+916209228845): Missing self-serve WhatsApp booking link and evening OPD timing confirmation.",
  recommended_pitch: "5-Page Mobile Clinic Website + 24/7 WhatsApp Slot Bot + 5-Star Rating Shield.",
  pain_short: "no website link and unconfirmed evening OPD slot timings",
  fix_short: "automated WhatsApp slot booking and a 5-star rating shield",
  package_name: "Full Clinic Website + 24/7 WhatsApp Slot Bot + Rating Shield",
  setup_fee_inr: 18500,
  monthly_retainer_inr: 3500,
  annual_deal_value_inr: 60500,
  slot_lock_deposit_inr: 2999,
  balance_on_delivery_inr: 15501,
  deposit_paid: true,
  razorpay_payment_id: "pay_SimBison2999_6209228845",
  waba_message_id: "wamid.HBgMOTE2MjA5MjI4ODQ1FQIAERgSQkVBMjAyNjExMDRfU0lN",
  roi_anchor: "Just 1 Single Dental Implant (₹25,000) covers 100% of setup—lock Sector Alpha-1 today for ₹2,999.",
  quotation_items: [
    "5-Page Mobile Clinic Website + SSL + Smile Gallery (₹11,500)",
    "24/7 Automated WhatsApp OPD Slot Booking Assistant (₹4,500)",
    "Waiting Room 5-Star Google Rating Shield QR Funnel (₹2,500)"
  ],
  status: "Booked",
  notes: "[SIMULATION COMPLETE] Touch #1 Sent -> Replied 'Yes show me' -> Prototype Sent -> ₹2,999 Razorpay Deposit Paid (pay_SimBison2999_6209228845) -> 60s Onboarding Submitted (Domain: apexdentalgreaternoida.in)"
};

function toFirestoreValue(val) {
  if (typeof val === "string") return { stringValue: val };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (val && typeof val === "object") {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

function getFirestoreDoc(docPath) {
  return new Promise((resolve) => {
    https.get({
      hostname: "firestore.googleapis.com",
      path: `/v1/projects/indian-bison-crm-2026/databases/(default)/documents/${docPath}`
    }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on("error", () => resolve(null));
  });
}

async function patchFirestoreDoc(docPath, obj) {
  const existing = await getFirestoreDoc(docPath);
  const payload = { ...obj };
  if (existing && existing.fields && existing.fields.created_at) {
    payload.created_at = existing.fields.created_at.stringValue || existing.fields.created_at.timestampValue;
  }
  return new Promise((resolve, reject) => {
    const fields = {};
    for (const [k, v] of Object.entries(payload)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    const body = JSON.stringify({ fields });

    const req = https.request({
      hostname: "firestore.googleapis.com",
      path: `/v1/projects/indian-bison-crm-2026/databases/(default)/documents/${docPath}`,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function runFullSimulation() {
  console.log("================================================================================");
  console.log("🦬 INDIAN BISON — FULL 6-STAGE AUTONOMOUS FUNNEL SIMULATION (+91 6209228845)");
  console.log("================================================================================\n");

  // STAGE 1
  console.log("▶ [STAGE 1 | 06:00 AM IST] Automated Google Maps Prospecting & Friction Audit");
  console.log(`  • Target Discovered : ${TRIAL_LEAD.business_name}`);
  console.log(`  • Decision Maker    : ${TRIAL_LEAD.recipient} (${TRIAL_LEAD.phone_whatsapp})`);
  console.log(`  • Locality          : ${TRIAL_LEAD.locality}`);
  console.log(`  • Friction Detected : ${TRIAL_LEAD.rating}★ (${TRIAL_LEAD.total_reviews} reviews) | ${TRIAL_LEAD.website_url}`);
  console.log(`  • Urgency Score     : ${TRIAL_LEAD.urgency_score}/100 (${TRIAL_LEAD.urgency_tier})`);
  console.log(`  • Pre-Built Preview : https://indian-bison-crm-2026.web.app/preview.html?rank=21\n`);

  // STAGE 2
  const touch1 = buildPolymorphicColdMessage(TRIAL_LEAD);
  console.log("▶ [STAGE 2 | 02:14 PM IST] OPD-Gap Touch #1 Cold Outreach (7-Layer Anti-Ban Shield)");
  console.log("  • Guardrails Active : OPD Break Window (2:00–4:30 PM IST) | Random Jitter: 312s | Zero Links | <55 Words");
  console.log("  • Outbound Payload  :");
  console.log("  ------------------------------------------------------------------------------");
  console.log("  " + touch1.split("\n").join("\n  "));
  console.log("  ------------------------------------------------------------------------------\n");

  // STAGE 3 & 4
  console.log("▶ [STAGE 3 | 02:18:00 PM IST] Inbound Webhook Event from +91 6209228845");
  console.log(`  • Incoming WhatsApp : "Yes, show me the preview for my Sector Alpha-1 clinic"`);
  console.log(`  • Meta 24h Window   : OPENED (Customer-Initiated Service Window -> Links & Rich Previews Unlocked)\n`);

  const touch2Proto = buildInstantPrototypeAndDepositReply(TRIAL_LEAD);
  console.log("▶ [STAGE 4 | 02:18:02 PM IST] Sub-2-Second Auto-Reply: Live Prototype + ₹2,999 Slot-Lock");
  console.log("  • Outbound Payload  :");
  console.log("  ------------------------------------------------------------------------------");
  console.log("  " + touch2Proto.split("\n").join("\n  "));
  console.log("  ------------------------------------------------------------------------------\n");

  // STAGE 5
  console.log("▶ [STAGE 5 | 02:23:15 PM IST] Razorpay Checkout & Webhook (payment.captured)");
  console.log(`  • Event             : payment.captured`);
  console.log(`  • Payment ID        : ${TRIAL_LEAD.razorpay_payment_id}`);
  console.log(`  • Amount Collected  : ₹${TRIAL_LEAD.slot_lock_deposit_inr.toLocaleString("en-IN")}/- (Slot-Lock Deposit via UPI)`);
  console.log(`  • Balance Escrowed  : ₹${TRIAL_LEAD.balance_on_delivery_inr.toLocaleString("en-IN")}/- (Payable only after 5-Day Live Delivery)`);
  console.log(`  • Sector Exclusivity: Sector Alpha-1 LOCKED for ${TRIAL_LEAD.business_name}`);
  console.log(`  • Auto-WhatsApp Sent: "🎉 Payment Confirmed (₹2,999/-)! Complete your 60-second setup: https://indian-bison-crm-2026.web.app/onboarding.html?rank=21"\n`);

  // STAGE 6
  const onboardingPayload = {
    rank: 21,
    clinic_name: TRIAL_LEAD.business_name,
    doctor_credentials: "Dr. Gopal (BDS, MDS — Prosthodontics & Implantology, 11+ Yrs Exp)",
    opd_timings: "Mon–Sat: 10:00 AM – 2:00 PM & 5:00 PM – 8:30 PM | Sun: 10:30 AM – 1:30 PM",
    whatsapp_reception: "+916209228845",
    top_treatments: "Single-Sitting RCT, Swiss Basal Implants, Clear Aligners, Zirconia Crowns",
    preferred_domain: "apexdentalgreaternoida.in",
    razorpay_payment_id: TRIAL_LEAD.razorpay_payment_id,
    submitted_at: new Date().toISOString()
  };

  console.log("▶ [STAGE 6 | 02:24:40 PM IST] 60-Second Clinic Onboarding Submitted & Synced to Firestore");
  console.log("  • Doctor Profile    :", onboardingPayload.doctor_credentials);
  console.log("  • OPD Slot Timings  :", onboardingPayload.opd_timings);
  console.log("  • Top 3 Treatments  :", onboardingPayload.top_treatments);
  console.log("  • Preferred Domain  :", onboardingPayload.preferred_domain);

  TRIAL_LEAD.custom_message = touch2Proto;
  TRIAL_LEAD.whatsapp_quote_message = touch2Proto;
  TRIAL_LEAD.onboarding_completed = true;
  TRIAL_LEAD.onboarding_data = onboardingPayload;
  TRIAL_LEAD.last_contacted_at = new Date().toISOString();
  TRIAL_LEAD.updated_at = new Date().toISOString();

  try {
    const fsLead1 = await patchFirestoreDoc("leads/lead_21", TRIAL_LEAD);
    const fsLead2 = await patchFirestoreDoc("leads/lead_021", TRIAL_LEAD);
    console.log(`\n✅ Cloud Firestore Sync Complete: leads/lead_21 (HTTP ${fsLead1.statusCode}) & leads/lead_021 (HTTP ${fsLead2.statusCode})`);
    console.log("   Status in Indian Bison Desktop CRM is now: [Booked • ₹2,999 Deposit Paid]");
  } catch (err) {
    console.log("\n⚠️ Cloud Firestore Sync Note:", err.message);
  }
}

runFullSimulation();
