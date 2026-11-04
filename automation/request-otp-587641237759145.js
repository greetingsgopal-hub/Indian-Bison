const https = require("https");

const TOKEN = "EAAQGZArrvUngBSZB8bBIJK2Ob5v52FBDJXU99JBscbXHqkdI0Auvj52pvxbD1w54Ov1WfCZAd0Vj87KoYmBNBCw8hZANeZCxU182pHLbQD9eCeWxy9NjlhBOMcgaNhq7SoK9qAgXAynkHbZCApJWRotk2vCJjpkMunpHb1eurEHX9xSCFehaZCpcYp5gtKvQ8MqFwj1TUPgtrFK2bvdhhZCpamVQZCEBRmfQUPLcD";
const PHONE_ID = "587641237759145";

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

async function run() {
  console.log("Triggering POST /587641237759145/request_code (VOICE, en_US)...");
  const voiceRes = await graphPost(`/${PHONE_ID}/request_code`, {
    code_method: "VOICE",
    language: "en_US"
  });
  console.log("request_code (VOICE) result:", JSON.stringify(voiceRes, null, 2));
}

run().catch(console.error);
