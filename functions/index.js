/**
 * Indian Bison — 24/7/365 Permanent Cloud Function Webhook Receiver
 * Location: functions/index.js
 * Region: asia-south2 (Mumbai, India)
 *
 * Provides a permanent, serverless 24/7 webhook endpoint connected directly to
 * Firebase Hosting: https://indian-bison-crm-2026.web.app/webhook
 */

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const https = require("https");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const app = express();

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "indian_bison_secret_2026";
const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID || "587641237759145";
const META_ACCESS_TOKEN = process.env.META_PERMANENT_ACCESS_TOKEN ||
  process.env.META_WABA_ACCESS_TOKEN ||
  "EAAQGZArrvUngBSZB8bBIJK2Ob5v52FBDJXU99JBscbXHqkdI0Auvj52pvxbD1w54Ov1WfCZAd0Vj87KoYmBNBCw8hZANeZCxU182pHLbQD9eCeWxy9NjlhBOMcgaNhq7SoK9qAgXAynkHbZCApJWRotk2vCJjpkMunpHb1eurEHX9xSCFehaZCpcYp5gtKvQ8MqFwj1TUPgtrFK2bvdhhZCpamVQZCEBRmfQUPLcD";

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Helper: send Meta Cloud API message
function sendMetaWhatsApp(toPhone, textBody, previewUrl = false) {
  const cleanPhone = String(toPhone || "").replace(/[^0-9]/g, "");
  if (!cleanPhone || !META_ACCESS_TOKEN) return Promise.resolve({ simulated: true });

  const payload = JSON.stringify({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "text",
    text: { preview_url: previewUrl, body: textBody }
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: "graph.facebook.com",
      path: `/v21.0/${META_PHONE_NUMBER_ID}/messages`,
      method: "POST",
      headers: {
        "Authorization": `Bearer ${META_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    }, (res) => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try { resolve(JSON.parse(raw)); } catch(e) { resolve({ raw }); }
      });
    });
    req.on("error", () => resolve({ error: true }));
    req.write(payload);
    req.end();
  });
}

// 1. Meta Webhook Challenge Handshake (GET /webhook & GET /)
function verifyChallenge(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log(`[Meta Challenge Verified 24/7] Path: ${req.path}`);
    return res.status(200).send(String(challenge || "OK"));
  }
  return res.status(403).send("Forbidden");
}

app.get("/", verifyChallenge);
app.get("/webhook", verifyChallenge);
app.get("/webhook/whatsapp", verifyChallenge);

// 2. Inbound WhatsApp Messages & Receipts (POST /webhook & POST /)
async function handleInbound(req, res) {
  res.status(200).send("EVENT_RECEIVED");

  try {
    const body = req.body;
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0]?.value || body;

    // Delivery Ticks
    if (Array.isArray(changes?.statuses)) {
      for (const st of changes.statuses) {
        const deliveryStatus = String(st.status || "sent").toLowerCase();
        const evtId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        await db.collection("funnel_events").doc(evtId).set({
          event_type: `WABA_STATUS_${deliveryStatus.toUpperCase()}`,
          timestamp: new Date().toISOString(),
          phone_whatsapp: st.recipient_id || "",
          status: deliveryStatus === "read" ? "Read (Blue Tick)" : deliveryStatus,
          wamid: st.id || "",
          actor: "MetaWebhookCloud",
          payload_summary: `24/7 Cloud Function: Delivery tick -> ${deliveryStatus.toUpperCase()}`
        }, { merge: true });
      }
    }

    // Doctor Inbound Messages
    if (Array.isArray(changes?.messages)) {
      for (const msg of changes.messages) {
        const fromPhone = msg.from;
        const textBody = (msg.text?.body || msg.body || "").trim();

        if (/\byes\b/i.test(textBody)) {
          console.log(`[24/7 Webhook] Doctor replied YES from ${fromPhone}`);
          const previewUrl = `https://indian-bison-crm-2026.web.app/preview.html?phone=${fromPhone}&slot_lock=2999`;
          const replyText = `Hi Doctor, here is your customized 30-sec live prototype:\n\n🔗 ${previewUrl}\n\n*Zero-Risk Slot-Lock Terms:*\n• Lock Your Sector Slot: Just *₹2,999/- Slot-Lock Deposit* via Razorpay UPI/Card on the preview link.\n• Balance payable ONLY after live delivery in 5 days.\n\nTap the link above to test slot booking and lock your sector!`;

          await sendMetaWhatsApp(fromPhone, replyText, true);

          const evtId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          await db.collection("funnel_events").doc(evtId).set({
            event_type: "DOCTOR_REPLIED_YES",
            timestamp: new Date().toISOString(),
            phone_whatsapp: fromPhone,
            status: "Prototype Sent",
            actor: "DoctorInbound24x7",
            payload_summary: `24/7 Cloud Function: Doctor replied "YES"! Slot-lock prototype dispatched.`
          }, { merge: true });

        } else if (/\bstop\b/i.test(textBody)) {
          const optOutNotice = `You have been unsubscribed from Indian Bison Dental CRM. No further messages will be sent to ${fromPhone}.`;
          await sendMetaWhatsApp(fromPhone, optOutNotice, false);

          const evtId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          await db.collection("funnel_events").doc(evtId).set({
            event_type: "DOCTOR_OPTED_OUT_STOP",
            timestamp: new Date().toISOString(),
            phone_whatsapp: fromPhone,
            status: "Opted Out",
            actor: "DoctorInbound24x7",
            payload_summary: `24/7 Cloud Function: Doctor replied "STOP". Suppressed.`
          }, { merge: true });
        }
      }
    }
  } catch (err) {
    console.error("[24/7 Cloud Function Error]", err);
  }
}

app.post("/", handleInbound);
app.post("/webhook", handleInbound);
app.post("/webhook/whatsapp", handleInbound);

// Export as 2nd Generation Cloud Function in asia-south2
exports.webhook = onRequest({
  region: "asia-south2",
  cors: true,
  maxInstances: 10
}, app);
