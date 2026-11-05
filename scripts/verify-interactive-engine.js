/**
 * Automated Verification Test for Visual / Interactive Outreach Engine & Webhook Flow
 */
const { 
  sanitizeClinicName, 
  sanitizeDoctorName, 
  buildHighContextColdMessage, 
  buildInteractiveOutreachPayload,
  buildStep2DemoMenuPayload
} = require('../automation/autonomous-funnel-engine');

async function runVerification() {
  console.log("============================================================");
  console.log("RUNNING VERIFICATION: INTERACTIVE ENGINE & DATA SANITIZATION");
  console.log("============================================================");

  // Test 1: Sanitize Internal Tags
  const rawLead = {
    rank: 2,
    recipient: "Dr. Suman Singh (Live Trial)",
    business_name: "Dr. Suman Dental Health Clinic (Live Trial • 6209228845)",
    phone_whatsapp: "+919953044628",
    locality: "Alpha-1, Greater Noida",
    address: "Alpha-1 Commercial Belt, Greater Noida"
  };

  const cleanClinic = sanitizeClinicName(rawLead.business_name);
  const cleanDoc = sanitizeDoctorName(rawLead.recipient);

  console.log("\n[Test 1: Sanitization]");
  console.log("Raw Clinic Name:     ", rawLead.business_name);
  console.log("Sanitized Clinic Name:", cleanClinic);
  console.log("Raw Doctor Name:     ", rawLead.recipient);
  console.log("Sanitized Doctor Name:", cleanDoc);

  if (cleanClinic.includes("Live Trial") || cleanDoc.includes("Live Trial")) {
    throw new Error("Sanitization failed: internal tags still present!");
  }
  console.log("✅ Sanitization Passed: Zero dev tags in presentation copy.");

  // Test 2: High Context Cold Message Word Count & Structure
  const coldMsg = buildHighContextColdMessage(rawLead);
  const wordCount = coldMsg.split(/\s+/).filter(Boolean).length;
  console.log("\n[Test 2: High-Context Message (<60 words)]");
  console.log("Message Content:\n" + coldMsg);
  console.log("Word Count:", wordCount);

  if (wordCount >= 60) {
    throw new Error(`Word count (${wordCount}) exceeds strict 60-word limit!`);
  }
  if (!coldMsg.includes("STOP") || !coldMsg.includes("24/7 WhatsApp")) {
    throw new Error("Message missing required opt-out or value hook!");
  }
  console.log("✅ Cold Message Passed: High-context & exactly " + wordCount + " words (<60).");

  // Test 3: Meta Cloud API Interactive Template Payload
  const interactivePayload = buildInteractiveOutreachPayload(rawLead);
  console.log("\n[Test 3: Meta Cloud API Interactive Payload Structure]");
  console.log(JSON.stringify(interactivePayload, null, 2));

  if (interactivePayload.type !== "interactive") {
    throw new Error("Payload type must be 'interactive'");
  }
  if (interactivePayload.interactive.type !== "button") {
    throw new Error("Interactive type must be 'button'");
  }
  if (interactivePayload.interactive.header.type !== "image") {
    throw new Error("Header must be type 'image'");
  }
  const buttons = interactivePayload.interactive.action.buttons;
  if (buttons.length !== 2) {
    throw new Error(`Expected 2 interactive buttons, found ${buttons.length}`);
  }
  if (buttons[0].reply.id !== "BTN_VIEW_PROTOTYPE") {
    throw new Error(`Button 1 ID must be BTN_VIEW_PROTOTYPE, got ${buttons[0].reply.id}`);
  }
  if (buttons[1].reply.id !== "BTN_OPT_OUT") {
    throw new Error(`Button 2 ID must be BTN_OPT_OUT, got ${buttons[1].reply.id}`);
  }
  console.log("✅ Step 1 Interactive Template Payload Structure Passed.");

  // Test 4: Step 2 Interactive Demo Menu Structure (3 Buttons)
  const step2Payload = buildStep2DemoMenuPayload("916209228845");
  console.log("\n[Test 4: Step 2 Interactive Demo Menu (3 Buttons)]");
  console.log(JSON.stringify(step2Payload, null, 2));

  const step2Buttons = step2Payload.interactive.action.buttons;
  if (step2Buttons.length !== 3) {
    throw new Error(`Expected 3 demo menu buttons, got ${step2Buttons.length}`);
  }
  if (step2Buttons[0].reply.id !== "BTN_BOOK_OPD" || step2Buttons[1].reply.id !== "BTN_REVIEW_SHIELD" || step2Buttons[2].reply.id !== "BTN_LOCK_OFFER") {
    throw new Error("Step 2 demo buttons mismatched!");
  }
  console.log("✅ Step 2 Interactive Demo Menu Structure Passed.");

  console.log("\n============================================================");
  console.log("ALL VERIFICATION SUITES PASSED SUCCESSFULLY!");
  console.log("============================================================");
}

runVerification().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
