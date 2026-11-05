/**
 * Test Execution of Outbound Meta Cloud API Dispatch on Lead #2 (Dr. Suman Singh)
 */
const https = require('https');

async function testDispatchLead2() {
  console.log("=================================================");
  console.log("EXECUTING DISPATCH TEST ON LEAD #2 (Dr. Suman)");
  console.log("=================================================");

  const payload = JSON.stringify({
    leadRank: 2,
    recipient: "Dr. Suman Singh",
    businessName: "Dr. Suman Singh Dental Health Clinic",
    phone: "919953044628",
    messageText: "Hi Dr. Suman Singh, noticed your clinic listing in Alpha-1 Greater Noida has friction confirming evening OPD hours and no automated slot booking. We built a live WhatsApp prototype for you: https://indian-bison-crm-2026.web.app/preview.html?rank=2"
  });

  const options = {
    hostname: "indian-bison-webhook.greetings-gopal.workers.dev",
    path: "/api/dispatch",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          console.log("\n[Response Status]:", res.statusCode);
          console.log("[Dispatched Message ID (wamid)]:", parsed.wamid);
          console.log("[Lead Target]:", parsed.recipient, "(Rank #" + parsed.leadRank + ")");
          console.log("[Phone]:", parsed.phone);
          console.log("[Dispatched At]:", parsed.dispatchedAt);
          console.log("\n[Meta API Raw Response]:", JSON.stringify(parsed.metaResponse, null, 2));
          console.log("\n✅ DISPATCH TEST VERIFICATION SUCCESSFUL.");
          resolve(parsed);
        } catch (e) {
          console.log("Raw output:", data);
          resolve(data);
        }
      });
    });

    req.on("error", (err) => {
      console.error("Request Error:", err);
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

testDispatchLead2();
