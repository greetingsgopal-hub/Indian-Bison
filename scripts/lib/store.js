/**
 * Indian Bison — Shared Lead Store, Firestore Sync & Audit Event Bus (scripts/lib/store.js)
 * Connects `automation/autonomous-funnel-engine.js`, `scripts/webhook-receiver.js`, and the CRM Dashboard.
 */

const https = require("https");
const EventEmitter = require("events");

const PROJECT_ID = "indian-bison-crm-2026";
const funnelEventBus = new EventEmitter();

// In-memory ring buffer of recent funnel_events for instant diagnostic streaming
const recentFunnelEvents = [
  {
    id: "evt_boot_01",
    event_type: "SYSTEM_SCHEDULER_ARMED",
    timestamp: new Date(Date.now() - 360000).toISOString(),
    lead_rank: 21,
    lead_id: "lead_21",
    business_name: "Apex Dental & Implant Studio",
    phone_whatsapp: "+916209228845",
    status: "SCHEDULED",
    actor: "AutoScheduler",
    payload_summary: "Hybrid Dispatcher armed: Mon–Sat 10:30–13:30 & 17:00–20:30 IST (Jitter: 4m–9m)."
  }
];

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

function buildHighContextColdMessage(lead) {
  if (!lead) return "";
  const docName = sanitizeDoctorName(lead.recipient);
  const clinicName = sanitizeClinicName(lead.business_name);
  const sector = (lead.locality || lead.address || "Greater Noida").split(",")[0].trim();
  return `Hey ${docName}, noticed patients searching ${clinicName} in ${sector} find unconfirmed evening OPD timings and no direct booking link on your Google profile.\n\nBuilt a 30-second interactive prototype showing how a 24/7 WhatsApp booking slot & 5★ review shield fixes this.\n\nWant me to drop the preview link here?\n(Reply STOP to opt out)`;
}

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
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

function firestoreRequest(method, docPath, payloadObj) {
  return new Promise((resolve, reject) => {
    let body = null;
    const headers = { "Content-Type": "application/json" };
    if (payloadObj) {
      const fields = {};
      for (const [k, v] of Object.entries(payloadObj)) {
        if (v !== undefined) fields[k] = toFirestoreValue(v);
      }
      body = JSON.stringify({ fields });
      headers["Content-Length"] = Buffer.byteLength(body);
    }

    const req = https.request({
      hostname: "firestore.googleapis.com",
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${docPath}`,
      method,
      headers
    }, (res) => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(raw) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw });
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

/**
 * Append a structured event to the `funnel_events` Firestore audit collection & local EventEmitter
 */
async function appendFunnelEvent(eventData) {
  const evtId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const record = {
    event_type: eventData.event_type || "FUNNEL_EVENT",
    timestamp: eventData.timestamp || new Date().toISOString(),
    lead_rank: Number(eventData.lead_rank || 0),
    lead_id: String(eventData.lead_id || `lead_${eventData.lead_rank || 0}`),
    business_name: String(eventData.business_name || "Unknown Clinic"),
    phone_whatsapp: String(eventData.phone_whatsapp || ""),
    status: String(eventData.status || "INFO"),
    wamid: String(eventData.wamid || ""),
    razorpay_payment_id: String(eventData.razorpay_payment_id || ""),
    actor: String(eventData.actor || "System"),
    payload_summary: String(eventData.payload_summary || "").slice(0, 1900),
    raw_payload: typeof eventData.raw_payload === "string"
      ? eventData.raw_payload.slice(0, 4500)
      : JSON.stringify(eventData.raw_payload || {}).slice(0, 4500)
  };

  recentFunnelEvents.unshift({ id: evtId, ...record });
  if (recentFunnelEvents.length > 100) recentFunnelEvents.pop();
  funnelEventBus.emit("funnel_event", { id: evtId, ...record });

  try {
    await firestoreRequest("PATCH", `funnel_events/${evtId}`, record);
  } catch (err) {
    // Non-fatal in offline/sandbox environments
  }

  return { id: evtId, ...record };
}

/**
 * Update a lead's status and metadata in Firestore (`leads/lead_{rank}`)
 */
async function updateLeadRecord(leadRank, patchFields) {
  // Matches dashboard doc IDs (public/index.html -> lead_001 .. lead_021)
  const docId = `lead_${String(leadRank).padStart(3, "0")}`;
  const queryParams = Object.keys(patchFields)
    .map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join("&");

  try {
    const res = await firestoreRequest(
      "PATCH",
      `leads/${docId}?${queryParams}`,
      { ...patchFields, updated_at: new Date().toISOString() }
    );
    return res;
  } catch (err) {
    return { statusCode: 0, error: err.message };
  }
}

function getRecentFunnelEvents(limit = 50) {
  return recentFunnelEvents.slice(0, limit);
}

let cachedLeads = null;
function getAllLeads() {
  if (cachedLeads) return cachedLeads;
  try {
    const p = require("path").join(__dirname, "../../hot_leads_top20.json");
    if (require("fs").existsSync(p)) {
      cachedLeads = JSON.parse(require("fs").readFileSync(p, "utf8"));
    }
  } catch (e) {
    cachedLeads = [];
  }
  if (!cachedLeads) cachedLeads = [];
  if (!cachedLeads.some(l => l.rank === 21)) {
    cachedLeads.push({
      rank: 21,
      business_name: "Apex Dental & Implant Studio",
      recipient: "Dr. Gopal",
      locality: "Sector Alpha-1, Greater Noida",
      phone_whatsapp: "+916209228845",
      package_name: "Full Clinic Website + 24/7 WhatsApp Slot Bot + Rating Shield",
      setup_fee_inr: 18500,
      monthly_retainer_inr: 4500,
      status: "Prototype Sent"
    });
  }
  return cachedLeads;
}

function findLeadByPhone(rawPhone) {
  if (!rawPhone) return null;
  const digits = String(rawPhone).replace(/[^0-9]/g, "");
  const last10 = digits.slice(-10);
  const leads = getAllLeads();
  const matched = leads.find(l => {
    const lDigits = String(l.phone_whatsapp || "").replace(/[^0-9]/g, "");
    return lDigits.endsWith(last10) || digits.endsWith(lDigits.slice(-10));
  });

  if (matched) {
    return {
      ...matched,
      business_name: sanitizeClinicName(matched.business_name),
      recipient: sanitizeDoctorName(matched.recipient)
    };
  }

  return {
    rank: 21,
    business_name: "Apex Dental & Implant Studio",
    recipient: "Dr. Gopal",
    phone_whatsapp: rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`,
    setup_fee_inr: 18500
  };
}

module.exports = {
  PROJECT_ID,
  funnelEventBus,
  appendFunnelEvent,
  updateLeadRecord,
  getRecentFunnelEvents,
  firestoreRequest,
  getAllLeads,
  findLeadByPhone,
  sanitizeClinicName,
  sanitizeDoctorName,
  buildHighContextColdMessage
};
