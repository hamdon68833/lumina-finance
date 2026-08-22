import { CompanyLogoService } from '../company_logo_service';
import { formatCurrency } from '../currency_formatter';
import { PortfolioRebalancingEngine } from '../portfolio_rebalancing_engine';
import { VerifiedContextResolver } from '../verified_context_resolver';
import { LuminaAIAgent } from '../lumina_agent';

async function runMasterUpgradeTests() {
  console.log("==================================================================");
  console.log("LUMINA FINANCE — COMPREHENSIVE PRODUCTION UPGRADE VERIFICATION");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // TEST GROUP 1: COMPANY LOGO SERVICE & FALLBACK
  // ---------------------------------------------------------------------------
  console.log("--- TEST GROUP 1: COMPANY LOGOS & SVG FALLBACK ---");
  const nvdaLogo = CompanyLogoService.getLogoUrl("NVDA");
  assert(nvdaLogo.includes("unavatar.io/nvidia.com") || nvdaLogo.includes("svg"), "US Ticker Logo URL generation for NVDA");

  const unknownLogo = CompanyLogoService.getLogoUrl("UNKNOWN_TICKER_XYZ99");
  assert(unknownLogo.startsWith("data:image/svg+xml;utf8,"), "SVG Data URI fallback for unknown ticker");
  assert(unknownLogo.includes("UN"), "SVG Avatar initials generation for UNKNOWN_TICKER_XYZ99");

  // ---------------------------------------------------------------------------
  // TEST GROUP 2: CURRENCY FORMATTER
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 2: CURRENCY FORMATTER ---");
  const lakhINR = formatCurrency(100000, "INR");
  assert(lakhINR === "₹1,00,000", `INR Lakh formatting (Expected ₹1,00,000, got ${lakhINR})`);

  const usdPrice = formatCurrency(124.8, "USD");
  assert(usdPrice === "$124.80", `USD formatting (Expected $124.80, got ${usdPrice})`);

  const nullCurrency = formatCurrency(null, "INR");
  assert(nullCurrency === "Data unavailable", `Null value currency formatting (Expected Data unavailable, got ${nullCurrency})`);

  // ---------------------------------------------------------------------------
  // TEST GROUP 3: PORTFOLIO REBALANCING ENGINE
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 3: PORTFOLIO REBALANCING ENGINE ---");
  const testHoldings = [
    { ticker: "NVDA", name: "NVIDIA Corp", value: 300000 },
    { ticker: "AAPL", name: "Apple Inc", value: 100000 },
    { ticker: "HDFCBANK.NS", name: "HDFC Bank", value: 100000 }
  ];

  const rebalanceResult = PortfolioRebalancingEngine.calculatePortfolioRebalance(testHoldings);
  assert(rebalanceResult.totalPortfolioValue === 500000, "Total portfolio valuation");
  assert(rebalanceResult.concentrationRisk.largestPositionWeightPct === 60, `NVDA concentration calculation (Expected 60%, got ${rebalanceResult.concentrationRisk.largestPositionWeightPct}%)`);
  assert(rebalanceResult.concentrationRisk.isOverConcentrated === true, "Single stock concentration risk alert (>20%)");
  assert(rebalanceResult.recommendations.length > 0, "Actionable rebalancing advisory recommendations generated");

  // ---------------------------------------------------------------------------
  // TEST GROUP 4: VERIFIED CONTEXT RESOLVER & PROVENANCE
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 4: VERIFIED CONTEXT RESOLVER ---");
  const emptyContext = VerifiedContextResolver.getVerifiedFinancialContext("user-empty", {}, false);
  assert(emptyContext.income.source === "UNAVAILABLE", "Empty profile tags income as UNAVAILABLE");
  assert(emptyContext.hasVerifiedProfile === false, "Empty profile marks hasVerifiedProfile = false");

  const populatedContext = VerifiedContextResolver.getVerifiedFinancialContext("user-1", { income: 85000, expenses: 45000 }, false);
  assert(populatedContext.income.value === 85000 && populatedContext.income.source === "USER_PROFILE", "Populated profile tags income correctly as USER_PROFILE");
  assert(populatedContext.hasVerifiedProfile === true, "Populated profile marks hasVerifiedProfile = true");

  const demoContext = VerifiedContextResolver.getVerifiedFinancialContext("user-demo", {}, true);
  assert(demoContext.income.source === "DEMO_MODE", "Demo mode tags values as DEMO_MODE");

  // ---------------------------------------------------------------------------
  // TEST GROUP 5: AGENT INTENT CLASSIFICATION & DISPATCH
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 5: AGENT INTENT CLASSIFICATION ---");
  const agent = new LuminaAIAgent();

  // Test 1: Portfolio Rebalancing Intent
  const res1 = agent.understandRequest("How can I rebalance my portfolio to reduce NVDA single stock concentration?");
  assert(res1.intent === "PORTFOLIO_REBALANCING", `Portfolio query intent (Expected PORTFOLIO_REBALANCING, got ${res1.intent})`);
  assert(res1.mode === "FINANCIAL", `Portfolio query mode (Expected FINANCIAL, got ${res1.mode})`);
  assert(res1.entity === "NVDA", `Extracted entity (Expected NVDA, got ${res1.entity})`);

  // Test 2: General Knowledge Education Intent
  const res2 = agent.understandRequest("What is Python?");
  assert(res2.intent === "EDUCATION", `Education query intent (Expected EDUCATION, got ${res2.intent})`);
  assert(res2.mode === "GENERAL_AI", `Education query mode (Expected GENERAL_AI, got ${res2.mode})`);
  assert(res2.requiredToolNames.length === 0, "General knowledge query uses 0 financial tools");

  // Test 3: Market Overview Intent
  const res3 = agent.understandRequest("How is the market today?");
  assert(res3.intent === "MARKET_OVERVIEW", `Market overview intent (Expected MARKET_OVERVIEW, got ${res3.intent})`);
  assert(res3.mode === "MARKET", `Market overview mode (Expected MARKET, got ${res3.mode})`);

  // Test 4: Budget Intent
  const res4 = agent.understandRequest("How can I reduce my expenses?");
  assert(res4.intent === "BUDGET", `Budget query intent (Expected BUDGET, got ${res4.intent})`);

  // ---------------------------------------------------------------------------
  // TEST GROUP 6: WATCHLIST PROFESSIONAL POLISH
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 6: WATCHLIST PROFESSIONAL POLISH ---");
  const { WatchlistEngine } = await import('../watchlist_engine');
  const watchlist = WatchlistEngine.getWatchlist({ isDemoMode: true });
  assert(watchlist.length === 5, `Watchlist item count (Expected 5, got ${watchlist.length})`);

  const niftyItem = watchlist.find(w => w.ticker === "NIFTY 50");
  assert(niftyItem !== undefined && niftyItem.currency === "INR", "NIFTY 50 item resolved with INR currency");

  const nvdaItem = watchlist.find(w => w.ticker === "NVDA");
  assert(nvdaItem !== undefined && nvdaItem.currency === "USD", "NVDA item resolved with USD currency");

  const relianceItem = watchlist.find(w => w.ticker === "RELIANCE");
  assert(relianceItem !== undefined && relianceItem.explainableStatus === "Bullish Momentum", "RELIANCE explainable status");

  const tcsItem = watchlist.find(w => w.ticker === "TCS");
  assert(tcsItem !== undefined && tcsItem.technicalSignal.includes("Technical Signal:"), "TCS explainable technical signal without blind BUY/SELL order");

  // ---------------------------------------------------------------------------
  // TEST GROUP 7: AUTHENTICATION & FRIENDLY ERROR MAPPING
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 7: AUTHENTICATION & ERROR MAPPING ---");
  const { getFriendlyAuthErrorMessage } = await import('../src/AuthContext');

  const wrongPassMsg = getFriendlyAuthErrorMessage({ code: "auth/wrong-password" });
  assert(wrongPassMsg === "Email or password is incorrect.", `Friendly wrong-password error mapping (Got: ${wrongPassMsg})`);

  const userNotFoundMsg = getFriendlyAuthErrorMessage({ code: "auth/user-not-found" });
  assert(userNotFoundMsg === "No account was found with this email address.", `Friendly user-not-found error mapping (Got: ${userNotFoundMsg})`);

  const invalidEmailMsg = getFriendlyAuthErrorMessage({ code: "auth/invalid-email" });
  assert(invalidEmailMsg === "Please enter a valid email address.", `Friendly invalid-email error mapping (Got: ${invalidEmailMsg})`);

  const tooManyRequestsMsg = getFriendlyAuthErrorMessage({ code: "auth/too-many-requests" });
  assert(tooManyRequestsMsg === "Too many login attempts. Please wait a moment and try again.", `Friendly too-many-requests error mapping (Got: ${tooManyRequestsMsg})`);

  const networkErrMsg = getFriendlyAuthErrorMessage({ code: "auth/network-request-failed" });
  assert(networkErrMsg === "Unable to connect to authentication server. Please check your internet connection.", `Friendly network error mapping (Got: ${networkErrMsg})`);

  const rawErrorObj = getFriendlyAuthErrorMessage({ code: "auth/unknown-error", message: "FirebaseError: auth/internal-error" });
  assert(!rawErrorObj.includes("FirebaseError") && !rawErrorObj.includes("auth/"), "Sanitizes raw Firebase error strings");

  // ---------------------------------------------------------------------------
  // TEST GROUP 8: USER DATA ISOLATION & SESSION ISOLATION
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 8: USER DATA ISOLATION & SESSION ISOLATION ---");
  const userA_Context = VerifiedContextResolver.getVerifiedFinancialContext("user-A-uid", { income: 120000, expenses: 50000 }, false);
  const userB_Context = VerifiedContextResolver.getVerifiedFinancialContext("user-B-uid", { income: 45000, expenses: 20000 }, false);

  assert(userA_Context.income.value === 120000 && userB_Context.income.value === 45000, "User A and User B financial income values strictly isolated");
  assert(userA_Context.income.value !== userB_Context.income.value, "User A data cannot leak into User B session context");

  const unauthContext = VerifiedContextResolver.getVerifiedFinancialContext("unauth-uid", {}, false);
  assert(unauthContext.income.value === null && unauthContext.income.source === "UNAVAILABLE", "Unauthenticated new user has 0 fake values (income is null, not ₹6,500)");

  console.log("\n==================================================");
  console.log(`SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runMasterUpgradeTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
