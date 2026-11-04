const https = require("https");

const TOKEN = "EAAQGZArrvUngBSZB8bBIJK2Ob5v52FBDJXU99JBscbXHqkdI0Auvj52pvxbD1w54Ov1WfCZAd0Vj87KoYmBNBCw8hZANeZCxU182pHLbQD9eCeWxy9NjlhBOMcgaNhq7SoK9qAgXAynkHbZCApJWRotk2vCJjpkMunpHb1eurEHX9xSCFehaZCpcYp5gtKvQ8MqFwj1TUPgtrFK2bvdhhZCpamVQZCEBRmfQUPLcD";
const TO_PHONE = "916209228845";

function graphGet(path) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: "graph.facebook.com",
      path: `/v21.0${path}`,
      headers: { "Authorization": `Bearer ${TOKEN}` }
    }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve({ raw: data }); }
      });
    }).on("error", reject);
  });
}

function graphPost(path, bodyObj) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(bodyObj);
    const req = https.request({
      hostname: "graph.facebook.com",
      path: `/v21.0${path}`,
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve({ raw: data }); }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function discoverAndSend() {
  console.log("1. Inspecting Meta Token Scopes & Granular WABA IDs...");
  const debug = await graphGet(`/debug_token?input_token=${TOKEN}`);
  console.log("Debug Token Response:", JSON.stringify(debug, null, 2));

  let wabaIds = [];
  let phoneIds = process.argv[2] ? [process.argv[2]] : [];

  const granular = debug?.data?.granular_scopes || [];
  for (const s of granular) {
    if (s.scope === "whatsapp_business_management" || s.scope === "whatsapp_business_messaging") {
      if (Array.isArray(s.target_ids)) {
        wabaIds.push(...s.target_ids);
      }
    }
  }
  wabaIds = [...new Set(wabaIds)];
  console.log("Discovered WABA IDs:", wabaIds);

  for (const wabaId of wabaIds) {
    const phones = await graphGet(`/${wabaId}/phone_numbers`);
    console.log(`Phones for WABA ${wabaId}:`, JSON.stringify(phones, null, 2));
    if (Array.isArray(phones?.data)) {
      for (const p of phones.data) {
        if (p.id) phoneIds.push(p.id);
      }
    }
  }

  if (phoneIds.length === 0) {
    console.log("Querying System User assigned_whatsapp_business_accounts...");
    const endpoints = [
      "/me?fields=id,name,business",
      "/me/businesses",
      "/1132938199519864?fields=id,name,owner_business",
      "/1132938199519864/subscribed_apps"
    ];
    let bizIds = [];
    for (const ep of endpoints) {
      const res = await graphGet(ep);
      console.log(`GET ${ep}:`, JSON.stringify(res, null, 2));
      if (res?.business?.id) bizIds.push(res.business.id);
      if (res?.owner_business?.id) bizIds.push(res.owner_business.id);
      if (Array.isArray(res?.data)) {
        for (const item of res.data) {
          if (item.id) bizIds.push(item.id);
        }
      }
    }
    bizIds = [...new Set(bizIds)];
    console.log("Discovered Business IDs:", bizIds);
    for (const bId of bizIds) {
      const owned = await graphGet(`/${bId}/owned_whatsapp_business_accounts`);
      console.log(`GET /${bId}/owned_whatsapp_business_accounts:`, JSON.stringify(owned, null, 2));
      if (Array.isArray(owned?.data)) {
        owned.data.forEach(w => wabaIds.push(w.id));
      }
      const client = await graphGet(`/${bId}/client_whatsapp_business_accounts`);
      console.log(`GET /${bId}/client_whatsapp_business_accounts:`, JSON.stringify(client, null, 2));
      if (Array.isArray(client?.data)) {
        client.data.forEach(w => wabaIds.push(w.id));
      }
    }
    wabaIds = [...new Set(wabaIds)];
    for (const wabaId of wabaIds) {
      const phones = await graphGet(`/${wabaId}/phone_numbers`);
      console.log(`Phones for WABA ${wabaId}:`, JSON.stringify(phones, null, 2));
      if (Array.isArray(phones?.data)) {
        for (const p of phones.data) {
          if (p.id) phoneIds.push(p.id);
        }
      }
    }
  }

  phoneIds = [...new Set(phoneIds)];
  console.log("Discovered Phone Number IDs:", phoneIds);

  if (phoneIds.length > 0) {
    const phoneId = phoneIds[0];
    console.log(`\n1b. Inspecting Phone Number Object ${phoneId}...`);
    const phoneInfo = await graphGet(`/${phoneId}?fields=id,display_phone_number,verified_name,code_verification_status,quality_rating,platform_type,status`);
    console.log("Phone Info:", JSON.stringify(phoneInfo, null, 2));

    console.log(`\n1c. Registering Phone Number ${phoneId} with Meta Cloud API (/register)...`);
    const regRes = await graphPost(`/${phoneId}/register`, {
      messaging_product: "whatsapp",
      pin: "202600"
    });
    console.log("Register Result:", JSON.stringify(regRes, null, 2));

    console.log(`\n2. Firing Live Meta Official WhatsApp Cloud API Message from Phone ID ${phoneId} to ${TO_PHONE}...`);

    // First send standard hello_world template (guaranteed delivery for new conversation before 24h customer window opens)
    const tplRes = await graphPost(`/${phoneId}/messages`, {
      messaging_product: "whatsapp",
      to: TO_PHONE,
      type: "template",
      template: {
        name: "hello_world",
        language: { code: "en_US" }
      }
    });
    console.log("Template Dispatch Result:", JSON.stringify(tplRes, null, 2));

    // Also send the custom Indian Bison Touch #1 + Live Prototype text message
    const textBody = `Hey Dr. Gopal, I looked up Apex Dental & Implant Studio on Google Maps today and noticed no website link and unconfirmed evening OPD slot timings.\n\nI built a live interactive booking & 5-star rating-shield prototype for your Sector Alpha-1 clinic:\nhttps://indian-bison-crm-2026.web.app/preview.html?rank=21\n\n• Total Setup: ₹18,500\n• Lock Sector Alpha-1 Exclusivity Today: Just ₹2,999/- Slot-Lock Deposit via Razorpay UPI/Card on the preview page.\n• Balance (₹15,501): Only after live delivery in 5 days!\n\n(Reply STOP to opt out)`;

    const txtRes = await graphPost(`/${phoneId}/messages`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: TO_PHONE,
      type: "text",
      text: { preview_url: true, body: textBody }
    });
    console.log("Custom Text Dispatch Result:", JSON.stringify(txtRes, null, 2));
  }
}

discoverAndSend().catch(console.error);
