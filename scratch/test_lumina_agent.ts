import "dotenv/config";
import { LuminaAIAgent } from "../lumina_agent";
import { processCopilotQuery } from "../copilot_engine";
import { resolveTicker } from "../tool_registry";

async function runLuminaCopilotValidation() {
  console.log("==========================================================================");
  console.log("RUNNING LUMINA COPILOT PHASE 24 COMPREHENSIVE & MULTI-TURN AGENT TEST");
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
    monthlyIncome: 65000,
    monthlyExpenses: 38000,
    savings: 180000,
    monthlyDebtPayments: 5000,
    goals: [
      { id: "g1", name: "House Downpayment Goal", targetAmount: 1000000, currentSavings: 150000, monthsLeft: 36, requiredMonthly: 23600 }
    ],
    investments: [
      { ticker: "NVDA", name: "NVIDIA Corp", value: 300000 },
      { ticker: "AAPL", name: "Apple Inc", value: 150000 }
    ]
  };

  const agent = new LuminaAIAgent(null);

  // ---------------------------------------------------------------------------
  // 1. TICKER RESOLUTION VERIFICATION (NVIDIA -> NVDA, NEVER AAPL)
  // ---------------------------------------------------------------------------
  const nvdaResolved = resolveTicker("Why is NVIDIA falling today?");
  assert(
    nvdaResolved.ticker === "NVDA" && nvdaResolved.companyName === "NVIDIA Corp",
    "NVIDIA Ticker Entity Resolution",
    `Resolved: ${nvdaResolved.ticker} (${nvdaResolved.companyName})`
  );

  const aaplResolved = resolveTicker("What is Apple doing today?");
  assert(
    aaplResolved.ticker === "AAPL" && aaplResolved.companyName === "Apple Inc.",
    "Apple Ticker Entity Resolution",
    `Resolved: ${aaplResolved.ticker} (${aaplResolved.companyName})`
  );

  const relianceResolved = resolveTicker("What's happening in Reliance today?");
  assert(
    relianceResolved.ticker === "RELIANCE.NS" && relianceResolved.companyName === "Reliance Industries",
    "Reliance Indian Ticker Resolution",
    `Resolved: ${relianceResolved.ticker}`
  );

  // ---------------------------------------------------------------------------
  // 2. INDIVIDUAL 24 PROMPT TESTS
  // ---------------------------------------------------------------------------
  const testCases = [
    { q: "hi", expectedMode: "GENERAL_AI" },
    { q: "hello", expectedMode: "GENERAL_AI" },
    { q: "What is Python?", expectedMode: "GENERAL_AI" },
    { q: "Explain machine learning", expectedMode: "GENERAL_AI" },
    { q: "Write Java code to reverse a string.", expectedMode: "GENERAL_AI" },
    { q: "What is finance?", expectedMode: "GENERAL_AI" },
    { q: "How is the market today?", expectedMode: "MARKET" },
    { q: "How is the Indian stock market today?", expectedMode: "MARKET" },
    { q: "What's happening with NIFTY today?", expectedMode: "MARKET" },
    { q: "Why is NVIDIA falling today?", expectedMode: "MARKET" },
    { q: "What is NVIDIA's current price?", expectedMode: "MARKET" },
    { q: "What is today's financial news?", expectedMode: "CURRENT_INFO" },
    { q: "Can I afford a ₹1 lakh phone?", expectedMode: "FINANCIAL" },
    { q: "Why is my risk score 64?", expectedMode: "FINANCIAL" },
    { q: "How can I reach my house goal faster?", expectedMode: "FINANCIAL" },
    { q: "What if my salary decreases by 20%?", expectedMode: "FINANCIAL" },
    { q: "What is my financial health score?", expectedMode: "FINANCIAL" },
    { q: "What is my EMI?", expectedMode: "FINANCIAL" },
    { q: "Should I repay my loan?", expectedMode: "FINANCIAL" },
    { q: "Explain diversification", expectedMode: "GENERAL_AI" },
    { q: "What is an ETF?", expectedMode: "GENERAL_AI" },
    { q: "What is SIP?", expectedMode: "GENERAL_AI" }
  ];

  for (const tc of testCases) {
    const route = agent.understandRequest(tc.q);
    assert(
      route.mode === tc.expectedMode,
      `Prompt: "${tc.q}"`,
      `Mode: ${route.mode} (Expected: ${tc.expectedMode})`
    );
  }

  // ---------------------------------------------------------------------------
  // 3. CRITICAL MULTI-TURN MEMORY TEST (A -> B -> C -> D)
  // ---------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------");
  console.log("CRITICAL MULTI-TURN MEMORY TEST");
  console.log("--------------------------------------------------------------------------");

  const historyPayload: any[] = [];

  // Question 1: Affordability
  const q1 = "Can I afford a ₹1 lakh phone?";
  const res1 = await processCopilotQuery(q1, userContext, historyPayload, null);
  assert(res1.intent === "AFFORDABILITY" && res1.calculations?.purchaseAmount === 100000, "Turn 1: Affordability Check (₹1 Lakh Phone)", `Amount: ₹${res1.calculations?.purchaseAmount}`);
  historyPayload.push({ sender: "user", text: q1 }, { sender: "bot", text: res1.answer, intent: res1.intent, calculations: res1.calculations });

  // Question 2: Follow-up pronoun "wait 3 months"
  const q2 = "What if I wait 3 months?";
  const res2 = await processCopilotQuery(q2, userContext, historyPayload, null);
  assert(res2.intent === "AFFORDABILITY", "Turn 2: Follow-up ('What if I wait 3 months?')", `Intent: ${res2.intent}`);
  historyPayload.push({ sender: "user", text: q2 }, { sender: "bot", text: res2.answer, intent: res2.intent, calculations: res2.calculations });

  // Question 3: Follow-up pronoun "affect my house goal"
  const q3 = "Would that affect my house goal?";
  const res3 = await processCopilotQuery(q3, userContext, historyPayload, null);
  assert(res3.intent === "GOAL_OPTIMIZATION" && res3.calculations?.goalName?.includes("House"), "Turn 3: Follow-up ('Would that affect my house goal?')", `Goal: ${res3.calculations?.goalName}`);
  historyPayload.push({ sender: "user", text: q3 }, { sender: "bot", text: res3.answer, intent: res3.intent, calculations: res3.calculations });

  // ---------------------------------------------------------------------------
  // 4. VERIFY NVIDIA QUERY RETURNS NVDA (NEVER APPLE)
  // ---------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------");
  console.log("NVIDIA MARKET QUERY VERIFICATION");
  console.log("--------------------------------------------------------------------------");

  const qNvda = "Why is NVIDIA falling today?";
  const resNvda = await processCopilotQuery(qNvda, userContext, [], null);
  assert(
    resNvda.calculations?.ticker === "NVDA" && resNvda.calculations?.name?.includes("NVIDIA"),
    "NVIDIA Query returns NVDA (No Apple Inc substitution)",
    `Ticker: ${resNvda.calculations?.ticker}, Name: ${resNvda.calculations?.name}`
  );

  console.log("==========================================================================");
  console.log(`FINAL RESULTS: ${passed}/${passed + failed} PASSED, ${failed} FAILED`);
  console.log("==========================================================================");
}

runLuminaCopilotValidation();
