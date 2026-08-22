import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { LuminaAIAgent } from "../lumina_agent";

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
}) : null;

const agent = new LuminaAIAgent(ai);

const testUserContext = {
  income: 6500,
  expenses: 3800,
  savings: 2700,
  currentLiquidReserve: 8000,
  age: 28,
  riskPreference: "High",
  goals: [
    { name: "House Downpayment Goal", targetAmount: 500000, currentSavings: 100000, monthsLeft: 36, requiredMonthly: 1000 }
  ],
  riskData: { riskScore: 64, riskCategory: "MEDIUM", mlModelType: "SHAP" }
};

async function runComprehensiveTests() {
  console.log("==========================================================================");
  console.log("RUNNING LUMINA AI AGENT COMPREHENSIVE SUITE (27 TEST CASES)");
  console.log("==========================================================================\n");

  let passed = 0;
  let failed = 0;

  const coreTests = [
    { id: 1, question: "hi", expectedMode: "GENERAL_AI" },
    { id: 2, question: "What is Python?", expectedMode: "GENERAL_AI", expectedIntent: "EDUCATION" },
    { id: 3, question: "Explain machine learning.", expectedMode: "GENERAL_AI" },
    { id: 4, question: "Write a Java program.", expectedMode: "GENERAL_AI" },
    { id: 5, question: "What is today's latest news?", expectedMode: "CURRENT_INFO" },
    { id: 6, question: "What is happening in the stock market today?", expectedMode: "MARKET" },
    { id: 7, question: "Can I afford a ₹1 lakh phone?", expectedMode: "FINANCIAL" },
    { id: 8, question: "Why is my risk score 64?", expectedMode: "FINANCIAL" },
    { id: 9, question: "How can I reach my house goal faster?", expectedMode: "FINANCIAL" },
    { id: 10, question: "What if my salary decreases by 20%?", expectedMode: "FINANCIAL" },
    { id: 11, question: "Why is NVIDIA falling today?", expectedMode: "MARKET" },
    { id: 12, question: "What is my financial health score?", expectedMode: "FINANCIAL" }
  ];

  console.log("--- 1. CORE SPECIFICATION TEST CASES ---");
  for (const tc of coreTests) {
    const res = await agent.runAgent(tc.question, testUserContext, []);
    const modeOk = res.mode === tc.expectedMode;

    let profileCheckOk = true;
    if (tc.expectedMode === "GENERAL_AI") {
      if (Object.keys(res.calculations).length > 0) {
        profileCheckOk = false;
        console.log(`  ❌ FAIL: "${tc.question}" loaded financial calculations in GENERAL_AI mode!`);
      }
    }

    if (modeOk && profileCheckOk) {
      console.log(`  ✅ TEST ${tc.id} PASSED: "${tc.question}" -> Mode: ${res.mode}, Intent: ${res.intentLabel}`);
      passed++;
    } else {
      console.log(`  ❌ TEST ${tc.id} FAILED: "${tc.question}" -> Expected ${tc.expectedMode}, got ${res.mode}`);
      failed++;
    }
  }

  console.log("\n--- 2. MULTI-TURN CONVERSATIONAL MEMORY TEST ---");
  const history: any[] = [];

  const turn1 = await agent.runAgent("Can I afford a ₹1 lakh phone?", testUserContext, history);
  history.push({ sender: "user", text: "Can I afford a ₹1 lakh phone?" });
  history.push({ sender: "bot", text: turn1.answer, intent: turn1.intent, calculations: turn1.calculations });

  const turn2 = await agent.runAgent("What if I wait three months?", testUserContext, history);
  history.push({ sender: "user", text: "What if I wait three months?" });
  history.push({ sender: "bot", text: turn2.answer, intent: turn2.intent, calculations: turn2.calculations });

  const turn3 = await agent.runAgent("Would that affect my house goal?", testUserContext, history);

  const turn1Ok = turn1.mode === "FINANCIAL" && turn1.intent === "AFFORDABILITY";
  const turn2Ok = turn2.mode === "FINANCIAL" && turn2.calculations?.waitMonthsScenario === 3;
  const turn3Ok = turn3.mode === "FINANCIAL" && turn3.intent === "GOAL_OPTIMIZATION";

  if (turn1Ok && turn2Ok && turn3Ok) {
    console.log(`  ✅ MULTI-TURN MEMORY PASSED: Correctly tracked phone purchase scenario -> wait 3 months -> house goal impact.`);
    passed += 3;
  } else {
    console.log(`  ❌ MULTI-TURN MEMORY FAILED: Turn1 (${turn1Ok}), Turn2 (${turn2Ok}), Turn3 (${turn3Ok})`);
    failed += 3;
  }

  console.log("\n--- 3. UNSEEN TEST CASES ---");
  const unseenTests = [
    { id: 16, question: "Can I buy a ₹75,000 phone next month?", expectedMode: "FINANCIAL" },
    { id: 17, question: "What happens if I lose my job for six months?", expectedMode: "FINANCIAL" },
    { id: 18, question: "Should I pay my loan early?", expectedMode: "FINANCIAL" },
    { id: 19, question: "I don't understand my portfolio.", expectedMode: "FINANCIAL" },
    { id: 20, question: "What is a linked list?", expectedMode: "GENERAL_AI" },
    { id: 21, question: "Write a Python API.", expectedMode: "GENERAL_AI" },
    { id: 22, question: "Explain Kubernetes.", expectedMode: "GENERAL_AI" },
    { id: 23, question: "What's happening with gold today?", expectedMode: "MARKET" },
    { id: 24, question: "Help me prepare for my VTU viva.", expectedMode: "GENERAL_AI" },
    { id: 25, question: "How can I reduce my spending?", expectedMode: "FINANCIAL" },
    { id: 26, question: "What happens if I invest ₹5,000 more every month?", expectedMode: "FINANCIAL" },
    { id: 27, question: "Can you summarize this?", expectedMode: "GENERAL_AI" }
  ];

  for (const tc of unseenTests) {
    const res = await agent.runAgent(tc.question, testUserContext, []);
    const modeOk = res.mode === tc.expectedMode;
    if (modeOk) {
      console.log(`  ✅ UNSEEN TEST ${tc.id} PASSED: "${tc.question}" -> Mode: ${res.mode}, Intent: ${res.intentLabel}`);
      passed++;
    } else {
      console.log(`  ❌ UNSEEN TEST ${tc.id} FAILED: "${tc.question}" -> Expected ${tc.expectedMode}, got ${res.mode}`);
      failed++;
    }
  }

  console.log("\n==========================================================================");
  console.log(`FINAL RESULTS: ${passed}/${coreTests.length + 3 + unseenTests.length} PASSED, ${failed} FAILED`);
  console.log("==========================================================================");
}

runComprehensiveTests();
