/**
 * Indian Bison — One-Click Live Webhook Server & Cloudflare Tunnel Runner
 * Location: scripts/start-live-webhook.js
 *
 * Runs the Express webhook receiver on port 3000 and exposes a secure public HTTPS
 * tunnel via Cloudflare (trycloudflare.com).
 * Prints the exact Meta Developer Portal webhook URL and verification token.
 */

require("dotenv").config();
const { startServer } = require("./webhook-receiver");
const { startTunnel } = require("untun");
const { appendFunnelEvent } = require("./lib/store");

const PORT = Number(process.env.PORT || 3000);
const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN || "indian_bison_secret_2026";

async function main() {
  console.clear();
  console.log("===============================================================================");
  console.log(" 🦬 INDIAN BISON — LIVE WHATSAPP WEBHOOK RECEIVER & CLOUDFLARE TUNNEL");
  console.log("===============================================================================\n");

  // 1. Start Express Server
  await startServer(PORT);
  console.log(`[✓] Local Webhook Server listening on http://localhost:${PORT}`);

  // 2. Start Cloudflare Tunnel
  console.log(`[⏳] Exposing secure public HTTPS tunnel via Cloudflare...`);
  try {
    const tunnel = await startTunnel({
      port: PORT,
      acceptCloudflareNotice: true
    });

    const publicUrl = await tunnel.getURL();
    const webhookCallbackUrl = `${publicUrl}/webhook`;

    const info = {
      publicUrl,
      webhookCallbackUrl,
      streamUrl: `${publicUrl}/api/funnel-stream`,
      verifyToken: VERIFY_TOKEN,
      startedAt: new Date().toISOString()
    };
    require("fs").writeFileSync(require("path").join(__dirname, "live-tunnel-info.json"), JSON.stringify(info, null, 2));

    console.log("\n===============================================================================");
    console.log(" 🚀 LIVE META WHATSAPP WEBHOOK TUNNEL ONLINE!");
    console.log("===============================================================================");
    console.log(` Public Tunnel URL:      ${publicUrl}`);
    console.log(` Webhook Callback URL:    ${webhookCallbackUrl}`);
    console.log(` Verify Token:            ${VERIFY_TOKEN}`);
    console.log(` Local Dashboard Stream:  http://localhost:${PORT}/api/funnel-stream`);
    console.log("===============================================================================");
    console.log("\n📋 META DEVELOPER PORTAL INSTRUCTIONS:");
    console.log(" 1. Go to: Meta App Dashboard -> WhatsApp -> Configuration -> Webhook -> Edit");
    console.log(` 2. Callback URL: ${webhookCallbackUrl}`);
    console.log(` 3. Verify Token: ${VERIFY_TOKEN}`);
    console.log(" 4. Click 'Verify and save'");
    console.log(" 5. In 'Webhook fields', check and subscribe to: 'messages'");
    console.log("===============================================================================\n");
    console.log("[⚡] Listening for inbound doctor WhatsApp messages ('YES', 'STOP') & delivery receipts...\n");

    await appendFunnelEvent({
      event_type: "WEBHOOK_TUNNEL_ONLINE",
      timestamp: new Date().toISOString(),
      lead_rank: 21,
      business_name: "Indian Bison Webhook Gateway",
      status: "ONLINE",
      actor: "CloudflareTunnel",
      payload_summary: `Live Webhook exposed at: ${webhookCallbackUrl} (Token: ${VERIFY_TOKEN})`,
      raw_payload: { publicUrl, webhookCallbackUrl, verifyToken: VERIFY_TOKEN }
    });

    return { tunnel, publicUrl, webhookCallbackUrl };
  } catch (err) {
    console.error("[!] Cloudflare Tunnel error:", err.message);
    console.log("\n[Fallback Guide]");
    console.log("You can also run ngrok manually in another terminal window:");
    console.log(`   ngrok http ${PORT}`);
    console.log(`And use: https://<ngrok-id>.ngrok-free.app/webhook with token: ${VERIFY_TOKEN}\n`);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error("Fatal startup error:", err);
  });
}

module.exports = { main };
