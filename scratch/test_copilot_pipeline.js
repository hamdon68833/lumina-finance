import { classifyIntent, processCopilotQuery } from '../copilot_engine.js';

async function runTests() {
  console.log("==================================================");
  console.log("RUNNING LUMINA AI COPILOT INTENT PIPELINE TESTS");
  console.log("==================================================\n");

  const testUserContext = {
    income: 6500,
    expenses: 3800,
    currentLiquidReserve: 8000,
    savings: 2700,
    savingsRatio: 41.5,
    monthsCovered: 2.1,
    age: 28,
    riskPreference: "High",
    goals: [
      { name: "House Downpayment Goal", targetAmount: 500000, currentSavings: 100000, monthsLeft: 36, requiredMonthly: 1000 }
    ],
    debts: [
      { name: "Personal Loan", balance: 12000, interestRate: 11.5, tenureMonths: 24, monthlyEmi: 560 }
    ],
    riskData: {
      riskScore: 64,
      riskCategory: "MEDIUM",
      mlModelType: "Scikit-Learn Random Forest Classifier"
    },
    selectedStock: {
      ticker: "AAPL",
      name: "Apple Inc.",
      currentPrice: 228.40,
      sma20: 222.10,
      sma50: 215.30,
      rsi: 58.2,
      trend: "Strong Uptrend (Bullish)",
      newsSentiment: 0.32,
      recommendation: "BUY",
      rationale: "Trading above 20-SMA with positive news sentiment."
    }
  };

  const testQuestions = [
    { q: "Can I afford a $2,000 laptop?", expectedIntent: "AFFORDABILITY" },
    { q: "How to reach house goal faster?", expectedIntent: "GOAL_OPTIMIZATION" },
    { q: "Why is my risk score 64?", expectedIntent: "RISK_EXPLANATION" },
    { q: "Am I saving enough?", expectedIntent: "BUDGET_ANALYSIS" },
    { q: "Is my emergency fund enough?", expectedIntent: "EMERGENCY_FUND" },
    { q: "How much should I invest?", expectedIntent: "INVESTMENT" },
    { q: "Why are my expenses so high?", expectedIntent: "EXPENSE_ANALYSIS" },
    { q: "Should I repay my loan?", expectedIntent: "DEBT" },
    { q: "What is my EMI?", expectedIntent: "DEBT" },
    { q: "Is AAPL a good investment?", expectedIntent: "MARKET" }
  ];

  let passedCount = 0;

  for (let i = 0; i < testQuestions.length; i++) {
    const { q, expectedIntent } = testQuestions[i];
    const res = await processCopilotQuery(q, testUserContext, [], null);
    
    const isPass = res.intent === expectedIntent;
    if (isPass) passedCount++;

    console.log(`[TEST ${i+1}] Query: "${q}"`);
    console.log(`  -> Intent: ${res.intent} (Expected: ${expectedIntent}) [${isPass ? 'PASS ✅' : 'FAIL ❌'}]`);
    console.log(`  -> Calculations Keys: ${Object.keys(res.calculations).join(", ")}`);
    console.log(`  -> Recommendations Count: ${res.recommendations.length}`);
    console.log(`  -> Warnings Count: ${res.warnings.length}`);
    console.log(`  -> Answer Preview: ${res.answer.substring(0, 100).replace(/\n/g, ' ')}...`);
    console.log("--------------------------------------------------");
  }

  console.log(`\nINTENT CLASSIFICATION PASSED: ${passedCount}/${testQuestions.length}\n`);

  // Critical Acceptance Test: Verify 3 consecutive queries return distinct intents, calculations, and recommendations
  console.log("==================================================");
  console.log("CRITICAL ACCEPTANCE TEST (3 CONSECUTIVE QUERIES)");
  console.log("==================================================");

  const q1 = await processCopilotQuery("Can I afford a $2,000 laptop?", testUserContext, [], null);
  const q2 = await processCopilotQuery("How to reach house goal faster?", testUserContext, [], null);
  const q3 = await processCopilotQuery("Why is my risk score 64?", testUserContext, [], null);

  const distinctIntents = q1.intent !== q2.intent && q2.intent !== q3.intent && q1.intent !== q3.intent;
  const distinctAnswers = q1.answer !== q2.answer && q2.answer !== q3.answer && q1.answer !== q3.answer;

  console.log(`Distinct Intents (Q1 vs Q2 vs Q3): ${distinctIntents ? 'YES ✅' : 'NO ❌'}`);
  console.log(`  Q1 Intent: ${q1.intent}`);
  console.log(`  Q2 Intent: ${q2.intent}`);
  console.log(`  Q3 Intent: ${q3.intent}`);

  console.log(`Distinct Answers (No repeated template): ${distinctAnswers ? 'YES ✅' : 'NO ❌'}`);

  // Test Conversational Memory
  console.log("\n==================================================");
  console.log("CONVERSATIONAL MEMORY & FOLLOW-UP TEST");
  console.log("==================================================");

  const history = [
    { sender: "user", text: "Can I afford a $2,000 laptop?" },
    { sender: "bot", text: q1.answer, intent: q1.intent, calculations: q1.calculations }
  ];

  const followUp1 = await processCopilotQuery("What if I wait 3 months?", testUserContext, history, null);
  console.log(`Follow-up 1 ("What if I wait 3 months?"):`);
  console.log(`  -> Intent Retained: ${followUp1.intent} [${followUp1.intent === 'AFFORDABILITY' ? 'PASS ✅' : 'FAIL ❌'}]`);
  console.log(`  -> Item Retained: ${followUp1.calculations.item} ($${followUp1.calculations.purchaseAmount})`);
  console.log(`  -> Wait Scenario: ${followUp1.calculations.waitMonthsScenario} months`);

  const history2 = [
    ...history,
    { sender: "user", text: "What if I wait 3 months?" },
    { sender: "bot", text: followUp1.answer, intent: followUp1.intent, calculations: followUp1.calculations }
  ];

  const followUp2 = await processCopilotQuery("What if I save another $500?", testUserContext, history2, null);
  console.log(`Follow-up 2 ("What if I save another $500?"):`);
  console.log(`  -> Intent Retained: ${followUp2.intent} [${followUp2.intent === 'AFFORDABILITY' ? 'PASS ✅' : 'FAIL ❌'}]`);
  console.log(`  -> Extra Savings Scenario: $${followUp2.calculations.extraSavingsScenario}`);

  console.log("\n==================================================");
  console.log("ALL TESTS FINISHED");
  console.log("==================================================");
}

runTests().catch(err => console.error("Test runner error:", err));
