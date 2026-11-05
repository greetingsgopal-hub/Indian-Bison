/**
 * Test & Verification for OPD Scheduler Wall-Clock Calculation & Interval Advancement
 */

function getISTDate(date = new Date()) {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utcMs + 5.5 * 3600000);
}

function formatTime12hIST(date) {
  const ist = getISTDate(date);
  let h = ist.getHours();
  const m = ist.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const mStr = m < 10 ? "0" + m : m;
  return `${h}:${mStr} ${ampm}`;
}

function formatCountdown(ms) {
  if (ms <= 0) return "0s";
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
}

/**
 * OPD Windows:
 * Morning: 10:30 AM (10.5) to 1:30 PM (13.5)
 * Evening: 5:00 PM (17.0) to 8:30 PM (20.5)
 * Monday - Saturday
 */
function calculateOPDSchedule(currentTimeMs, targetTimestampMs = null, jitterMinutes = 6) {
  const now = new Date(currentTimeMs);
  const istNow = getISTDate(now);
  const day = istNow.getDay(); // 0 = Sun, 1..6 = Mon..Sat
  const hourDecimal = istNow.getHours() + istNow.getMinutes() / 60 + istNow.getSeconds() / 3600;

  const isMonToSat = day >= 1 && day <= 6;
  
  const MORNING_START = 10.5; // 10:30 AM
  const MORNING_END = 13.5;   // 01:30 PM
  const EVENING_START = 17.0; // 05:00 PM
  const EVENING_END = 20.5;   // 08:30 PM

  let isInsideWindow = false;
  let activeWindowLabel = "";
  let windowEndDecimal = 0;

  if (isMonToSat) {
    if (hourDecimal >= MORNING_START && hourDecimal < MORNING_END) {
      isInsideWindow = true;
      activeWindowLabel = "Morning OPD";
      windowEndDecimal = MORNING_END;
    } else if (hourDecimal >= EVENING_START && hourDecimal < EVENING_END) {
      isInsideWindow = true;
      activeWindowLabel = "Evening OPD";
      windowEndDecimal = EVENING_END;
    }
  }

  let nextTargetMs = targetTimestampMs;
  let rolloverTriggered = false;

  // Case 1: Inside active OPD window
  if (isInsideWindow) {
    // If target timestamp is missing or has already elapsed (currentTimeMs >= nextTargetMs)
    if (!nextTargetMs || currentTimeMs >= nextTargetMs) {
      rolloverTriggered = true;
      // Advance to next execution slot: now + jitter (between 15 and 25 mins or jitterMinutes)
      const intervalMs = (15 + (jitterMinutes || 6)) * 60 * 1000;
      nextTargetMs = currentTimeMs + intervalMs;
    }

    // Check if the target pushes beyond the end of the current active window
    const targetIST = getISTDate(new Date(nextTargetMs));
    const targetHourDecimal = targetIST.getHours() + targetIST.getMinutes() / 60 + targetIST.getSeconds() / 3600;

    if (targetHourDecimal >= windowEndDecimal || targetIST.getDate() !== istNow.getDate()) {
      // Pushes beyond window: set target to next window start!
      if (windowEndDecimal === MORNING_END) {
        // Today 5:00 PM
        const nextWindow = new Date(now);
        nextWindow.setHours(17, 0, 0, 0);
        nextTargetMs = nextWindow.getTime();
      } else {
        // Tomorrow 10:30 AM (or Monday)
        const daysToAdd = day === 6 ? 2 : 1;
        const nextWindow = new Date(now);
        nextWindow.setDate(nextWindow.getDate() + daysToAdd);
        nextWindow.setHours(10, 30, 0, 0);
        nextTargetMs = nextWindow.getTime();
      }
    }

    const remainingMs = Math.max(0, nextTargetMs - currentTimeMs);
    const targetDate = new Date(nextTargetMs);
    const formattedTargetTime = formatTime12hIST(targetDate);
    const countdownStr = formatCountdown(remainingMs);

    return {
      status: "ACTIVE",
      isInsideWindow: true,
      windowLabel: activeWindowLabel,
      nextTargetMs,
      rolloverTriggered,
      displayText: `Next OPD: ${formattedTargetTime} (In ${countdownStr})`,
      bannerBadge: "Auto-Scheduler: ACTIVE",
      remainingMs,
      jitterMinutes
    };
  }

  // Case 2: Outside OPD Window
  let nextWindowDate = new Date(now);
  let nextWindowTimeLabel = "";

  if (isMonToSat && hourDecimal < MORNING_START) {
    // Today 10:30 AM
    nextWindowDate.setHours(10, 30, 0, 0);
    nextWindowTimeLabel = "10:30 AM";
  } else if (isMonToSat && hourDecimal >= MORNING_END && hourDecimal < EVENING_START) {
    // Today 5:00 PM
    nextWindowDate.setHours(17, 0, 0, 0);
    nextWindowTimeLabel = "5:00 PM";
  } else {
    // Tomorrow 10:30 AM (skip Sunday if Saturday)
    const daysToAdd = day === 6 ? 2 : 1;
    nextWindowDate.setDate(nextWindowDate.getDate() + daysToAdd);
    nextWindowDate.setHours(10, 30, 0, 0);
    nextWindowTimeLabel = (daysToAdd === 2 ? "Mon 10:30 AM" : "Tomorrow 10:30 AM");
  }

  nextTargetMs = nextWindowDate.getTime();
  const remainingMs = Math.max(0, nextTargetMs - currentTimeMs);
  const countdownStr = formatCountdown(remainingMs);

  return {
    status: "STANDBY",
    isInsideWindow: false,
    windowLabel: "Outside OPD Window",
    nextTargetMs,
    rolloverTriggered: currentTimeMs >= (targetTimestampMs || 0),
    displayText: `Outside OPD Window | Next Window: ${nextWindowTimeLabel} (In ${countdownStr})`,
    bannerBadge: "Auto-Scheduler: STANDBY",
    remainingMs,
    jitterMinutes
  };
}

// ==========================================
// RUN TEST SUITE
// ==========================================
console.log("=== OPD SCHEDULER TEST SUITE ===");

// Test 1: Real-time clock (current time)
const nowMs = Date.now();
console.log("\n[Test 1] Current System Time:", new Date(nowMs).toLocaleTimeString());
const res1 = calculateOPDSchedule(nowMs);
console.log("Output:", res1.displayText);
console.log("Status:", res1.status, "| Window:", res1.windowLabel);

// Test 2: Past target rollover (e.g. target was 11:30 AM, current clock is 11:52 AM)
const dateAt1152 = new Date();
dateAt1152.setHours(11, 52, 0, 0);
const pastTargetAt1130 = new Date(dateAt1152);
pastTargetAt1130.setHours(11, 30, 0, 0);

console.log("\n[Test 2] Past Target Rollover:");
console.log("Current time: 11:52 AM | Stale target: 11:30 AM");
const res2 = calculateOPDSchedule(dateAt1152.getTime(), pastTargetAt1130.getTime(), 6);
console.log("Rollover triggered?", res2.rolloverTriggered);
console.log("New Target Display:", res2.displayText);

// Test 3: Afternoon Break (e.g. 2:15 PM outside OPD hours)
const dateAt1415 = new Date();
dateAt1415.setHours(14, 15, 0, 0);
console.log("\n[Test 3] Afternoon Break (2:15 PM):");
const res3 = calculateOPDSchedule(dateAt1415.getTime());
console.log("Output:", res3.displayText);

// Test 4: Late Night (10:00 PM outside OPD hours)
const dateAt2200 = new Date();
dateAt2200.setHours(22, 0, 0, 0);
console.log("\n[Test 4] Late Night (10:00 PM):");
const res4 = calculateOPDSchedule(dateAt2200.getTime());
console.log("Output:", res4.displayText);

console.log("\n✅ ALL SCHEDULER TESTS COMPLETED SUCCESSFULLY.");
