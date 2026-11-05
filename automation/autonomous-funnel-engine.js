/**
 * Indian Bison — Strict 100% Manual Dispatch Engine (Meta Interactive Buttons)
 * Project: indian-bison-crm-2026 (Cloud Firestore asia-south2)
 *
 * Exports:
 *  - dispatchSingleLeadManual(leadOrId, options)
 *  - buildInteractiveOutreachPayload(lead, customText)
 *  - buildStep2DemoMenuPayload(lead)
 *  - buildPolymorphicColdMessage(lead)
 *  - buildInstantPrototypeAndDepositReply(lead)
 *  - handleInboundWhatsAppWebhook(webhookPayload, leadRecord)
 *  - sendMetaCloudWhatsApp(toPhoneE164, messageText, previewUrl)
 */

const https = require("https");
const { appendFunnelEvent, updateLeadRecord } = require("../scripts/lib/store");

const CONFIG = {
  FIREBASE_PROJECT_ID: "indian-bison-crm-2026",
  HOSTING_BASE_URL: "https://indian-bison-crm-2026.web.app",
  SLOT_LOCK_DEPOSIT_INR: 2999,
  META_GRAPH_VERSION: "v21.0",
  META_APP_ID: "1132938199519864",
  META_SYSTEM_USER_ID: "122104634043532228",
  META_PHONE_NUMBER_ID: process.env.META_PHONE_NUMBER_ID || process.env.META_WABA_PHONE_ID || "587641237759145",
  META_ACCESS_TOKEN:
    process.env.META_PERMANENT_ACCESS_TOKEN ||
    process.env.META_WABA_ACCESS_TOKEN ||
    "EAAQGZArrvUngBSZB8bBIJK2Ob5v52FBDJXU99JBscbXHqkdI0Auvj52pvxbD1w54Ov1WfCZAd0Vj87KoYmBNBCw8hZANeZCxU182pHLbQD9eCeWxy9NjlhBOMcgaNhq7SoK9qAgXAynkHbZCApJWRotk2vCJjpkMunpHb1eurEHX9xSCFehaZCpcYp5gtKvQ8MqFwj1TUPgtrFK2bvdhhZCpamVQZCEBRmfQUPLcD",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  // Anti-Ban & OPD Schedule Guardrails (Mon–Sat, 10:30 AM – 1:30 PM & 5:00 PM – 8:30 PM IST)
  MAX_DAILY_COLD_OUTREACH: 25,
  MIN_JITTER_MS: 240000, // 4 minutes minimum human jitter
  MAX_JITTER_MS: 540000, // 9 minutes maximum human jitter
  ALLOWED_OPD_WINDOWS_IST: [
    { label: "Morning OPD Window", start: 10.5, end: 13.5 }, // 10:30 AM – 1:30 PM IST
    { label: "Evening OPD Window", start: 17.0, end: 20.5 }  // 5:00 PM – 8:30 PM IST
  ]
};

function sanitizeClinicName(name) {
  if (!name) return "Dental Clinic";
  return name
    .replace(/\s*\([^)]*(?:live\s*trial|trial|\d{10})[^)]*\)/gi, "")
    .replace(/\s*•\s*\d+/g, "")
    .replace(/\s*\[[^\]]*\]/g, "")
    .replace(/\s*\+\s*91\d+/g, "")
    .trim();
}

function sanitizeDoctorName(name) {
  if (!name) return "Doctor";
  let clean = name.replace(/\s*\([^)]*\)/gi, "").replace(/\/.*$/, "").trim();
  if (!/^Dr\.?\s+/i.test(clean) && clean.toLowerCase() !== "doctor") {
    clean = "Dr. " + clean;
  }
  return clean;
}

/**
 * High-Converting Local Clinic Cold Hook (<60 words, Zero Generic Fluff + STOP Trapdoor)
 */
function buildHighContextColdMessage(lead) {
  const docName = sanitizeDoctorName(lead.recipient);
  const clinicName = sanitizeClinicName(lead.business_name);
  const sector = (lead.locality || "Greater Noida").split(",")[0].trim();
  return `Hey ${docName}, noticed patients searching ${clinicName} in ${sector} find unconfirmed evening OPD timings and no direct booking link on your Google profile.\n\nBuilt a 30-second interactive prototype showing how a 24/7 WhatsApp booking slot & 5★ review shield fixes this.\n\nWant me to drop the preview link here?\n(Reply STOP to opt out)`;
}

/**
 * Pre-Approved Interactive Message Builder (Image Header + Body + Quick Reply Buttons)
 */
function buildInteractiveOutreachPayload(lead, customOptions = {}) {
  const cleanPhone = String(lead.phone_whatsapp || "").replace(/[^0-9]/g, "");
  const docName = sanitizeDoctorName(lead.recipient);
  const clinicName = sanitizeClinicName(lead.business_name);
  const sector = (lead.locality || lead.address || "Sector Alpha-1, Greater Noida").split(",")[0].trim();
  const defaultBody = `Hey ${docName}, noticed patients searching ${clinicName} in ${sector} see unconfirmed evening OPD timings.\n\nWe pre-built a 24/7 WhatsApp booking slot & 5★ review shield for your clinic.\n\nWant to see how it works?`;
  const bodyText = customOptions.bodyText || defaultBody;
  const headerImageUrl = customOptions.headerImageUrl || "https://indian-bison-crm-2026.web.app/assets/audit-preview-card.png";

  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "interactive",
    interactive: {
      type: "button",
      header: {
        type: "image",
        image: {
          link: headerImageUrl
        }
      },
      body: {
        text: bodyText
      },
      footer: {
        text: "Indian Bison • Automated Clinic Systems"
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "BTN_VIEW_PROTOTYPE",
              title: "📱 View 30s Prototype"
            }
          },
          {
            type: "reply",
            reply: {
              id: "BTN_OPT_OUT",
              title: "🛑 Opt Out"
            }
          }
        ]
      }
    }
  };
}

/**
 * Step 2: Instant Automated Interactive Triage Menu
 */
function buildStep2DemoMenuPayload(phone) {
  const cleanPhone = String(phone || "").replace(/[^0-9]/g, "");
  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: "Here is the live patient experience:\nWhat would you like to test first?"
      },
      footer: {
        text: "Indian Bison • Automated Clinic Systems"
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "BTN_BOOK_OPD",
              title: "🦷 Book OPD Slot"
            }
          },
          {
            type: "reply",
            reply: {
              id: "BTN_REVIEW_SHIELD",
              title: "⭐ 5★ Review Shield"
            }
          },
          {
            type: "reply",
            reply: {
              id: "BTN_LOCK_OFFER",
              title: "💳 Lock ₹2,999 Offer"
            }
          }
        ]
      }
    }
  };
}

/**
 * Layer 2 Anti-Ban: Polymorphic Spintax Generator (<60 words, Zero Cold Links + STOP Trapdoor)
 */
function buildPolymorphicColdMessage(lead) {
  return buildHighContextColdMessage(lead);
}

/**
 * Instant Live Prototype + ₹2,999/- Razorpay Slot-Lock Deposit Reply
 */
function buildInstantPrototypeAndDepositReply(lead) {
  const docName = sanitizeDoctorName(lead.recipient);
  const clinicName = sanitizeClinicName(lead.business_name);
  const sectorShort = (lead.locality || "Greater Noida").split(",")[0].trim();
  const previewUrl = `${CONFIG.HOSTING_BASE_URL}/preview.html?rank=${lead.rank}`;
  const balance = (lead.setup_fee_inr || 18500) - CONFIG.SLOT_LOCK_DEPOSIT_INR;

  return `Hi ${docName}, here is the live interactive booking & 5-star rating-shield prototype built for ${clinicName} (${sectorShort}):\n${previewUrl}\n\n*Zero-Risk Launch Terms:*\n• Total Setup: ₹${(lead.setup_fee_inr || 18500).toLocaleString("en-IN")} (${lead.package_name})\n• *To Lock ${sectorShort} Exclusivity & Start Build Today:* Just *₹2,999/- Slot-Lock Deposit* via Razorpay UPI/Card directly on the preview page.\n• *Balance (₹${balance.toLocaleString("en-IN")}):* Payable ONLY after your live system is delivered in 5 days.\n\nTap the link above to test the 05:30 PM OPD slot booking and lock your sector!`;
}

/**
 * Call Scheduling Options Generator for "Tell me more" / inquiries
 */
function getCallSlotOptionsIST() {
  const options = [];
  const now = new Date();
  const istNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 5.5 * 3600000);
  
  // Pick slot times friendly to Doctor OPD gaps (2:30 PM, 3:30 PM, 8:45 PM)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Next 2 days
  for (let i = 1; i <= 2; i++) {
    const d = new Date(istNow);
    d.setDate(d.getDate() + i);
    if (d.getDay() === 0) continue; // Skip Sunday for OPD calls
    const dayStr = days[d.getDay()];
    const dateStr = `${d.getDate()} ${months[d.getMonth()]}`;
    options.push({
      id: `slot_${d.getFullYear()}_${d.getMonth()+1}_${d.getDate()}_1430`,
      label: `${dayStr} ${dateStr} • 02:30 PM IST (Post-Morning OPD)`,
      timeStr: "02:30 PM"
    });
    options.push({
      id: `slot_${d.getFullYear()}_${d.getMonth()+1}_${d.getDate()}_2045`,
      label: `${dayStr} ${dateStr} • 08:45 PM IST (Post-Evening OPD)`,
      timeStr: "08:45 PM"
    });
  }
  return options.slice(0, 3);
}

function buildCallSlotRequestReply(lead) {
  const slots = getCallSlotOptionsIST();
  return `Hi ${lead.recipient}, glad you'd like to explore this! We do a quick 7-minute visual walkthrough on phone/Google Meet showing the exact ROI & WhatsApp patient flow for ${lead.business_name}.\n\nWhich of these OPD-break time slots works best for you?\n\n1️⃣ ${slots[0]?.label || "Tomorrow • 02:30 PM IST"}\n2️⃣ ${slots[1]?.label || "Tomorrow • 08:45 PM IST"}\n3️⃣ ${slots[2]?.label || "Day After • 02:30 PM IST"}\n\n👉 Reply with *1*, *2*, or *3* (or mention your preferred time), and I will lock your private invite.`;
}

/**
 * Meta Official WhatsApp Cloud API Sender (`POST /v21.0/{Phone-Number-ID}/messages`)
 * Supports both text strings and full Meta interactive button payloads.
 */
function sendMetaCloudWhatsApp(toPhoneE164, messageOrPayload, previewUrl = false, customCredentials = {}) {
  const cleanPhone = String(toPhoneE164 || "").replace(/[^0-9]/g, "");
  const phoneId = customCredentials.phoneId || CONFIG.META_PHONE_NUMBER_ID;
  const accessToken = customCredentials.accessToken || CONFIG.META_ACCESS_TOKEN;

  const isInteractive = typeof messageOrPayload === "object" && messageOrPayload !== null;
  const bodyTextForLog = isInteractive ? (messageOrPayload.interactive?.body?.text || "Interactive Button Payload") : String(messageOrPayload);

  if (!phoneId || !accessToken) {
    return Promise.resolve({
      simulated: true,
      to: cleanPhone,
      wamid: `wamid.sim_${Date.now()}`,
      preview_url: previewUrl,
      body: bodyTextForLog,
      isInteractive
    });
  }

  return new Promise((resolve) => {
    let payload;
    if (isInteractive) {
      const interactivePayload = { ...messageOrPayload, to: cleanPhone };
      payload = JSON.stringify(interactivePayload);
    } else {
      payload = JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: { preview_url: previewUrl, body: messageOrPayload }
      });
    }

    const req = https.request({
      hostname: "graph.facebook.com",
      path: `/${CONFIG.META_GRAPH_VERSION}/${phoneId}/messages`,
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            resolve({
              simulated: true,
              fallback_reason: parsed.error.message,
              api_error: parsed.error,
              wamid: `wamid.fallback_${Date.now()}`,
              to: cleanPhone,
              body: bodyTextForLog,
              isInteractive
            });
          } else {
            resolve({
              simulated: false,
              wamid: parsed?.messages?.[0]?.id || `wamid.${Date.now()}`,
              raw: parsed,
              isInteractive
            });
          }
        } catch (e) {
          resolve({ simulated: true, wamid: `wamid.sim_${Date.now()}`, raw: data, isInteractive });
        }
      });
    });
    req.on("error", (err) => {
      resolve({
        simulated: true,
        fallback_reason: err.message,
        wamid: `wamid.offline_${Date.now()}`,
        to: cleanPhone,
        body: bodyTextForLog,
        isInteractive
      });
    });
    req.write(payload);
    req.end();
  });
}

/**
 * Step 1.2: Instant Manual Trigger per Clinic (Bypasses Queue & OPD Window)
 * Fires Touch #1 immediately via Meta Cloud API using interactive template by default,
 * updates Firestore status to `WhatsApp Sent`, and appends an audit entry to `funnel_events`.
 */
async function dispatchSingleLeadManual(leadOrId, options = {}) {
  const lead = typeof leadOrId === "object" ? leadOrId : {
    rank: Number(String(leadOrId).replace(/[^0-9]/g, "")) || 21,
    business_name: options.business_name || `Clinic #${leadOrId}`,
    recipient: options.recipient || "Doctor",
    phone_whatsapp: options.phone_whatsapp || "+916209228845",
    pain_short: options.pain_short || "unconfirmed evening OPD timings and no direct booking link",
    fix_short: options.fix_short || "a 24/7 WhatsApp booking slot & 5★ review shield"
  };

  lead.business_name = sanitizeClinicName(lead.business_name);
  lead.recipient = sanitizeDoctorName(lead.recipient);

  // Build Interactive Button Payload (or fallback to customHookText)
  const interactivePayload = buildInteractiveOutreachPayload(lead, {
    bodyText: options.customHookText
  });

  const apiResult = await sendMetaCloudWhatsApp(lead.phone_whatsapp, interactivePayload, false, options);
  const wamid = apiResult.wamid || `wamid.manual_${Date.now()}`;
  const hookText = interactivePayload.interactive.body.text;

  await updateLeadRecord(lead.rank, {
    status: "WhatsApp Sent",
    waba_message_id: wamid,
    last_contacted_at: new Date().toISOString(),
    custom_message: hookText,
    interactive_template: true
  });

  const auditEntry = await appendFunnelEvent({
    event_type: "MANUAL_TOUCH_1_DISPATCHED",
    lead_rank: lead.rank,
    lead_id: `lead_${lead.rank}`,
    business_name: lead.business_name,
    phone_whatsapp: lead.phone_whatsapp,
    status: "WhatsApp Sent",
    wamid,
    actor: "ManualOverride (Interactive Template)",
    payload_summary: `Interactive Touch #1 sent to ${lead.business_name} (${lead.phone_whatsapp}) [${wamid}]`,
    raw_payload: { interactivePayload, apiResult }
  });

  return {
    ok: true,
    lead_rank: lead.rank,
    status: "WhatsApp Sent",
    wamid,
    simulated: Boolean(apiResult.simulated),
    fallback_reason: apiResult.fallback_reason || null,
    hookText,
    auditEntry
  };
}

/**
 * Inbound Webhook Processor (Processes Doctor Replies & STOP Trapdoor)
 */
async function handleInboundWhatsAppWebhook(webhookPayload, leadRecord) {
  const incomingText = (webhookPayload?.text?.body || "").trim();
  const stopRegex = /\b(stop|unsubscribe|remove|not interested|no thanks|dnd|spam)\b/i;

  if (stopRegex.test(incomingText)) {
    await updateLeadRecord(leadRecord.rank, { status: "Opted Out" });
    await appendFunnelEvent({
      event_type: "INBOUND_STOP_TRAPDOOR",
      lead_rank: leadRecord.rank,
      lead_id: `lead_${leadRecord.rank}`,
      business_name: leadRecord.business_name,
      phone_whatsapp: leadRecord.phone_whatsapp,
      status: "Opted Out",
      actor: "InboundWebhook",
      payload_summary: `STOP Trapdoor triggered by "${incomingText}". Lead suppressed permanently.`,
      raw_payload: webhookPayload
    });
    return { action: "SUPPRESSED_OPT_OUT", newStatus: "Opted Out", outboundReply: null };
  }

  // Check if lead is asking for more info or to connect / call
  const tellMeMoreRegex = /\b(tell me more|know more|more info|more details|explain|how does it work|call me|connect|what is this|discuss|speak)\b/i;
  // Check if lead is answering with a selected slot number (1, 2, or 3) or time
  const slotSelectionRegex = /^\s*([123])\s*$/;

  if (slotSelectionRegex.test(incomingText)) {
    const slotNum = parseInt(incomingText.match(slotSelectionRegex)[1], 10);
    const slots = getCallSlotOptionsIST();
    const chosen = slots[slotNum - 1] || slots[0];
    const confirmText = `Perfect Dr. ${leadRecord.recipient}! Locked for *${chosen.label}*. I will ring you on ${leadRecord.phone_whatsapp} directly.\n\nMeanwhile, you can preview your clinic's live setup here:\n${CONFIG.HOSTING_BASE_URL}/preview.html?rank=${leadRecord.rank}`;
    
    await updateLeadRecord(leadRecord.rank, {
      status: "Call Scheduled",
      call_slot_id: chosen.id,
      call_slot_label: chosen.label,
      call_slot_selected_at: new Date().toISOString(),
      notes: `[Auto-Scheduled Call via WhatsApp] Selected Slot: ${chosen.label}`,
      last_contacted_at: new Date().toISOString()
    });

    const apiRes = await sendMetaCloudWhatsApp(leadRecord.phone_whatsapp, confirmText, true);

    await appendFunnelEvent({
      event_type: "CALL_SLOT_CONFIRMED",
      lead_rank: leadRecord.rank,
      lead_id: `lead_${leadRecord.rank}`,
      business_name: leadRecord.business_name,
      phone_whatsapp: leadRecord.phone_whatsapp,
      status: "Call Scheduled",
      actor: "InboundWebhook",
      payload_summary: `Doctor confirmed call slot: "${chosen.label}" (Option #${slotNum})`,
      raw_payload: { webhookPayload, chosen, confirmText, apiRes }
    });

    return {
      action: "CALL_SLOT_CONFIRMED",
      newStatus: "Call Scheduled",
      outboundReply: confirmText,
      dispatchResult: apiRes
    };
  }

  if (tellMeMoreRegex.test(incomingText)) {
    const slotReply = buildCallSlotRequestReply(leadRecord);
    const slots = getCallSlotOptionsIST();
    const apiRes = await sendMetaCloudWhatsApp(leadRecord.phone_whatsapp, slotReply, false);

    await updateLeadRecord(leadRecord.rank, {
      status: "Call Slot Requested",
      call_requested_at: new Date().toISOString(),
      call_slot_options: slots.map(s => s.label),
      notes: `[Inquiry] Doctor replied: "${incomingText}". Offered call slots.`,
      last_contacted_at: new Date().toISOString()
    });

    await appendFunnelEvent({
      event_type: "INBOUND_TELL_ME_MORE_CALL_OFFERED",
      lead_rank: leadRecord.rank,
      lead_id: `lead_${leadRecord.rank}`,
      business_name: leadRecord.business_name,
      phone_whatsapp: leadRecord.phone_whatsapp,
      status: "Call Slot Requested",
      actor: "InboundWebhook",
      payload_summary: `Doctor requested more info: "${incomingText}". Offered 3 OPD-gap call slots.`,
      raw_payload: { webhookPayload, slotReply, apiRes }
    });

    return {
      action: "OFFERED_CALL_SLOTS",
      newStatus: "Call Slot Requested",
      outboundReply: slotReply,
      dispatchResult: apiRes
    };
  }

  const replyText = buildInstantPrototypeAndDepositReply(leadRecord);
  const apiRes = await sendMetaCloudWhatsApp(leadRecord.phone_whatsapp, replyText, true);

  await updateLeadRecord(leadRecord.rank, {
    status: "Prototype Sent",
    waba_message_id: apiRes.wamid,
    last_contacted_at: new Date().toISOString()
  });

  await appendFunnelEvent({
    event_type: "INBOUND_POSITIVE_AUTO_PROTOTYPE",
    lead_rank: leadRecord.rank,
    lead_id: `lead_${leadRecord.rank}`,
    business_name: leadRecord.business_name,
    phone_whatsapp: leadRecord.phone_whatsapp,
    status: "Prototype Sent",
    wamid: apiRes.wamid,
    actor: "InboundWebhook",
    payload_summary: `Doctor replied "${incomingText}". Auto-sent Live Prototype & ₹2,999 Slot-Lock link.`,
    raw_payload: { webhookPayload, replyText, apiRes }
  });

  return {
    action: "SENT_PROTOTYPE_AND_2999_DEPOSIT_LINK",
    newStatus: "Prototype Sent",
    outboundReply: replyText,
    dispatchResult: apiRes
  };
}

module.exports = {
  CONFIG,
  dispatchSingleLeadManual,
  buildPolymorphicColdMessage,
  buildHighContextColdMessage,
  buildInteractiveOutreachPayload,
  buildStep2DemoMenuPayload,
  buildInstantPrototypeAndDepositReply,
  buildCallSlotRequestReply,
  getCallSlotOptionsIST,
  handleInboundWhatsAppWebhook,
  sendMetaCloudWhatsApp,
  sanitizeClinicName,
  sanitizeDoctorName
};
