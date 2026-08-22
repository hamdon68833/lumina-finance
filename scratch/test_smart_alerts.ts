import "dotenv/config";
import { NotificationService } from "../notification_service";
import { AlertIntelligenceEngine } from "../alert_engine";
import { startAlertScheduler, isAlertSchedulerRunning, stopAlertScheduler } from "../alert_scheduler";
import { DEFAULT_USER_PREFERENCES } from "../alert_rules";

async function runSmartAlertTestSuite() {
  console.log("==========================================================================");
  console.log("RUNNING LUMINA PROACTIVE SMART ALERTS & ACTION CENTER TEST SUITE");
  console.log("==========================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string = "") {
    if (condition) {
      console.log(`  ✅ PASSED: ${testName} ${detail ? `(${detail})` : ""}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  const service = NotificationService.getInstance();
  const userId = "test_user_viva_1";

  // --- 1. SCHEDULER SINGLETON & START TEST ---
  const firstStart = startAlertScheduler({ intervalMinutes: 60 });
  const secondStart = startAlertScheduler({ intervalMinutes: 60 });
  assert(firstStart && !secondStart && isAlertSchedulerRunning(), "Scheduler Singleton Protection", "Duplicate instantiation blocked");
  stopAlertScheduler();

  // --- 2. PERSONALIZED RELEVANCE TEST (NVDA -7.2% with 30% EXPOSURE) ---
  const userContext30Pct = {
    totalNetWorth: 1000000,
    monthlyIncome: 5000,
    monthlyExpenses: 3000,
    savings: 20000,
    targetEquityPct: 60,
    currentEquityPct: 60,
    investments: [{ ticker: "NVDA", name: "NVIDIA Corp", value: 300000 }] // 30% exposure
  };

  const marketDataNvdaDrop = [
    { ticker: "NVDA", name: "NVIDIA Corp", currentPrice: 118.5, changePercent: -7.2, rsi: 45.0, isDemoData: false }
  ];

  const alerts1 = await service.evaluateAndStoreAlerts(userId, userContext30Pct, marketDataNvdaDrop);
  const nvdaAlert1 = alerts1.find(a => a.dedupKey === "MARKET:NVDA:PRICE_DROP");

  assert(
    Boolean(nvdaAlert1 && (nvdaAlert1.severity === "HIGH" || nvdaAlert1.severity === "CRITICAL") && nvdaAlert1.userExposure === 30.0),
    "Personalized High Relevance Alert for 30% NVDA Exposure",
    `Severity: ${nvdaAlert1?.severity}, Exposure: ${nvdaAlert1?.userExposure}%`
  );

  // --- 3. DEDUPLICATION & COOLDOWN TEST (IMMEDIATE RE-EVALUATION) ---
  const alerts2 = await service.evaluateAndStoreAlerts(userId, userContext30Pct, marketDataNvdaDrop);
  const nvdaMatches = alerts2.filter(a => a.dedupKey === "MARKET:NVDA:PRICE_DROP");

  assert(
    nvdaMatches.length === 1,
    "Deduplication & Cooldown Prevention",
    `Found ${nvdaMatches.length} alert instance(s) after re-evaluation`
  );

  // --- 4. UNREAD COUNT & MARK AS READ TEST ---
  const unreadBefore = service.getUnreadCount(userId);
  const markSuccess = service.markAsRead(userId, nvdaAlert1!.id);
  const unreadAfter = service.getUnreadCount(userId);

  assert(
    markSuccess && unreadAfter === Math.max(0, unreadBefore - 1),
    "Unread Count & Mark As Read State Transition",
    `Unread before: ${unreadBefore}, after: ${unreadAfter}`
  );

  // --- 5. DISMISS ALERT TEST ---
  const dismissSuccess = service.dismissAlert(userId, nvdaAlert1!.id);
  const alertsPostDismiss = service.getAlerts(userId);
  const dismissedMatch = alertsPostDismiss.find(a => a.id === nvdaAlert1!.id);

  assert(
    dismissSuccess && !dismissedMatch,
    "Alert Dismissal State Transition",
    "Dismissed alert hidden from active notifications"
  );

  // --- 6. PERSONALIZED RELEVANCE TEST (0% EXPOSURE -> NO HIGH PORTFOLIO ALERT) ---
  const userId0Pct = "test_user_0pct";
  const userContext0Pct = {
    totalNetWorth: 1000000,
    monthlyIncome: 5000,
    monthlyExpenses: 3000,
    savings: 20000,
    targetEquityPct: 60,
    currentEquityPct: 60,
    investments: [{ ticker: "AAPL", name: "Apple Inc", value: 100000 }] // 0% NVDA exposure
  };

  const alerts0Pct = await service.evaluateAndStoreAlerts(userId0Pct, userContext0Pct, marketDataNvdaDrop);
  const nvdaAlert0 = alerts0Pct.find(a => a.dedupKey === "MARKET:NVDA:PRICE_DROP");

  assert(
    !nvdaAlert0 || nvdaAlert0.severity === "LOW",
    "Personalized Low Relevance Filtering for 0% Exposure",
    `Alert severity for 0% exposure: ${nvdaAlert0?.severity || "None (Filtered Out)"}`
  );

  // --- 7. USER PREFERENCES FILTER TEST (DISABLE MARKET ALERTS) ---
  const userPrefId = "test_user_disabled_market";
  service.updatePreferences(userPrefId, { marketAlerts: false });
  const alertsDisabled = await service.evaluateAndStoreAlerts(userPrefId, userContext30Pct, marketDataNvdaDrop);
  const marketMatch = alertsDisabled.find(a => a.type === "MARKET");

  assert(
    !marketMatch,
    "User Alert Category Preference Filter",
    "Market alerts blocked when preference is disabled"
  );

  // --- 8. EMERGENCY FUND CRITICAL ALERT TEST (< 3 MONTHS) ---
  const userEmergencyLow = {
    monthlyExpenses: 3000,
    savings: 6300, // 2.1 months
    monthlyIncome: 5000
  };

  const emergencyAlerts = await service.evaluateAndStoreAlerts("user_emerg_1", userEmergencyLow, []);
  const criticalEmerg = emergencyAlerts.find(a => a.type === "EMERGENCY_FUND" && a.severity === "CRITICAL");

  assert(
    Boolean(criticalEmerg && criticalEmerg.calculations.monthsCovered === 2.1),
    "Critical Emergency Reserve Guardrail Alert (< 3 Months)",
    `Months covered: ${criticalEmerg?.calculations.monthsCovered}`
  );

  // --- 9. PORTFOLIO DRIFT ALERT TEST (72% EQUITY VS 60% TARGET) ---
  const userDrift = {
    targetEquityPct: 60.0,
    currentEquityPct: 72.0,
    monthlyIncome: 5000,
    monthlyExpenses: 3000
  };

  const driftAlerts = await service.evaluateAndStoreAlerts("user_drift_1", userDrift, []);
  const driftAlert = driftAlerts.find(a => a.type === "PORTFOLIO");

  assert(
    Boolean(driftAlert && driftAlert.calculations.driftPercentagePoints === 12.0),
    "Portfolio Asset Allocation Drift Alert (12% Gap)",
    `Drift percentage points: ${driftAlert?.calculations.driftPercentagePoints}%`
  );

  // --- 10. CONTROLLED DEMO ALERT & LABEL TEST ---
  const demoAlert = service.createDemoAlert("viva_demo_user", "NVIDIA_DROP");
  assert(
    Boolean(demoAlert && demoAlert.isDemoData && demoAlert.source?.includes("Demo")),
    "Controlled Demo Alert Generation & Viva Labeling",
    `Label: ${demoAlert?.isDemoData ? "DEMO DATA" : "LIVE DATA"}`
  );

  // --- 11. FINANCIAL SAFETY GUARANTEE TEST (NO BUY/SELL ACTIONS) ---
  const allAlertActions = [
    ...(nvdaAlert1?.actions || []),
    ...(criticalEmerg?.actions || []),
    ...(demoAlert?.actions || [])
  ];

  const hasIllegalAction = allAlertActions.some(act => 
    ["BUY", "SELL", "TRADE", "TRANSFER", "WITHDRAW", "DEPOSIT"].includes(act.action as string) ||
    /buy|sell|trade|transfer/i.test(act.label)
  );

  assert(
    !hasIllegalAction,
    "Financial Safety Guarantee (No Automatic Trading Actions)",
    "All alert actions are strictly decision-support (ANALYZE, SIMULATE, ASK_COPILOT)"
  );

  console.log("==========================================================================");
  console.log(`FINAL RESULTS: ${passed}/${passed + failed} PASSED, ${failed} FAILED`);
  console.log("==========================================================================");

  process.exit(failed > 0 ? 1 : 0);
}

runSmartAlertTestSuite();
