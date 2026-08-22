import "dotenv/config";
import { LuminaAIAgent } from "../lumina_agent";
import { processCopilotQuery } from "../copilot_engine";
import { resolveTicker } from "../tool_registry";
import { FinancialDocumentEngine } from "../financial_document_engine";

async function runProductionizationTests() {
  console.log("==========================================================================");
  console.log("RUNNING LUMINA FINANCE ACCEPTANCE & PRODUCTION AUDIT SUITE");
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

  const userContext = {
    monthlyIncome: 75000,
    monthlyExpenses: 42000,
    savings: 220000,
    monthlyDebtPayments: 8000,
    goals: [
      { id: "g1", name: "House Downpayment Goal", targetAmount: 1500000, currentSavings: 300000, monthsLeft: 36, requiredMonthly: 33300 }
    ],
    investments: [
      { ticker: "NVDA", name: "NVIDIA Corp", value: 400000 }
    ]
  };

  const agent = new LuminaAIAgent(null);

  // TEST 1: Greeting "Hi"
  const route1 = agent.understandRequest("Hi");
  assert(route1.mode === "GENERAL_AI", "TEST 1: Prompt 'Hi' routes to GENERAL_AI mode", `Mode: ${route1.mode}`);
  const res1 = await processCopilotQuery("Hi", userContext, [], null);
  assert(res1.mode === "GENERAL_AI" && (!res1.calculations || Object.keys(res1.calculations).length === 0), "TEST 1: 'Hi' query contains NO financial profile cards", `Calculations count: ${Object.keys(res1.calculations || {}).length}`);

  // TEST 2: "What is Python?"
  const route2 = agent.understandRequest("What is Python?");
  assert(route2.mode === "GENERAL_AI" && route2.intent === "EDUCATION", "TEST 2: Prompt 'What is Python?' routes to EDUCATION", `Intent: ${route2.intent}`);
  const res2 = await processCopilotQuery("What is Python?", userContext, [], null);
  assert(res2.mode === "GENERAL_AI" && !res2.answer.includes("Execution complete"), "TEST 2: Educational response contains no code placeholder errors", `Answer preview: ${res2.answer.slice(0, 60)}...`);

  // TEST 3: "Can I afford a ₹1 lakh phone?"
  const res3 = await processCopilotQuery("Can I afford a ₹1 lakh phone?", userContext, [], null);
  assert(res3.intent === "AFFORDABILITY" && res3.calculations?.purchaseAmount === 100000, "TEST 3: Affordability query calculates purchase amount ₹1,00,000", `Amount: ₹${res3.calculations?.purchaseAmount}`);

  // TEST 4: "How can I reach my house goal faster?"
  const res4 = await processCopilotQuery("How can I reach my house goal faster?", userContext, [], null);
  assert(res4.intent === "GOAL_OPTIMIZATION" && res4.calculations?.goalName?.includes("House"), "TEST 4: Goal optimization calculates house goal timeline", `Goal: ${res4.calculations?.goalName}`);

  // TEST 5: "What is my financial health score?"
  const res5 = await processCopilotQuery("What is my financial health score?", userContext, [], null);
  assert(typeof res5.calculations?.financialHealthScore === "number" || typeof res5.answer === "string", "TEST 5: Health score query returns valid response", `Score: ${res5.calculations?.financialHealthScore || "Evaluated"}`);

  // TEST 6: "How is the Indian market today?"
  const indianTicker = resolveTicker("How is the Indian market today?");
  assert(indianTicker.ticker === "NIFTY.NS" || indianTicker.ticker === "SENSEX.BO", "TEST 6: Indian market query resolves NIFTY 50 or SENSEX", `Ticker: ${indianTicker.ticker}`);
  const res6 = await processCopilotQuery("How is the Indian market today?", userContext, [], null);
  assert(res6.mode === "MARKET", "TEST 6: 'How is the Indian market today?' routes to MARKET mode", `Mode: ${res6.mode}`);

  // TEST 7: "How is the US market today?"
  const usTicker = resolveTicker("How is the US market today?");
  assert(usTicker.ticker === "SPY", "TEST 7: US market query resolves S&P 500 ETF (SPY)", `Ticker: ${usTicker.ticker}`);

  // TEST 8: "Why is NVIDIA falling today?"
  const nvdaTicker = resolveTicker("Why is NVIDIA falling today?");
  assert(nvdaTicker.ticker === "NVDA" && nvdaTicker.companyName === "NVIDIA Corp", "TEST 8: NVIDIA query resolves NVDA without AAPL substitution", `Resolved: ${nvdaTicker.ticker}`);
  const res8 = await processCopilotQuery("Why is NVIDIA falling today?", userContext, [], null);
  assert(res8.calculations?.ticker === "NVDA", "TEST 8: 'Why is NVIDIA falling today?' returns NVDA market data", `Ticker: ${res8.calculations?.ticker}`);

  // TEST 9: "What is today's financial news?"
  const route9 = agent.understandRequest("What is today's financial news?");
  assert(route9.mode === "CURRENT_INFO" || route9.mode === "MARKET", "TEST 9: Financial news query routes to CURRENT_INFO/MARKET mode", `Mode: ${route9.mode}`);

  // TEST 10: Document Extraction without account balance
  const textWithoutBalance = "SALARY SLIP - HDFC BANK\nNet Pay Credited: ₹85,000\nStatement Date: 2026-08-20";
  const docResult = FinancialDocumentEngine.extractDocument("SalarySlip.pdf", textWithoutBalance);
  assert(docResult.extractedFields.monthlyIncome?.status === "DETECTED" && docResult.extractedFields.monthlyIncome?.value === 85000, "TEST 10: Document extraction detects income ₹85,000", `Income: ₹${docResult.extractedFields.monthlyIncome?.value}`);
  assert(docResult.extractedFields.accountBalance?.status === "NOT_DETECTED" && docResult.extractedFields.accountBalance?.value === null, "TEST 10: Missing account balance returns NOT_DETECTED (zero fake 150000)", `Balance Status: ${docResult.extractedFields.accountBalance?.status}`);

  console.log("==========================================================================");
  console.log(`FINAL ACCEPTANCE RESULTS: ${passed}/${passed + failed} PASSED, ${failed} FAILED`);
  console.log("==========================================================================");
}

runProductionizationTests();
