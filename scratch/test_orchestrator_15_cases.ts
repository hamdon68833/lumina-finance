import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { LuminaAIOrchestrator } from "../copilot_orchestrator";

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
}) : null;

const orchestrator = new LuminaAIOrchestrator(ai);

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

const testCases = [
  { id: 1, question: "Hello", expectedMode: "GENERAL_AI", expectedCapability: "CONVERSATION" },
  { id: 2, question: "What is Python?", expectedMode: "GENERAL_AI", expectedCapability: "GENERAL_AI" },
  { id: 3, question: "Explain machine learning", expectedMode: "GENERAL_AI", expectedCapability: "EDUCATION" },
  { id: 4, question: "Write a Java program", expectedMode: "GENERAL_AI", expectedCapability: "CODING" },
  { id: 5, question: "What is today's latest news?", expectedMode: "CURRENT_INFO", expectedCapability: "CURRENT_WEB_INFORMATION" },
  { id: 6, question: "What is happening in the stock market today?", expectedMode: "MARKET", expectedCapability: "MARKET_DATA" },
  { id: 7, question: "Can I afford a $2,000 laptop?", expectedMode: "FINANCIAL", expectedCapability: "FINANCIAL_ANALYSIS" },
  { id: 8, question: "Why is my risk score 64?", expectedMode: "FINANCIAL", expectedCapability: "FINANCIAL_ANALYSIS" },
  { id: 9, question: "How can I reach my house goal faster?", expectedMode: "FINANCIAL", expectedCapability: "FINANCIAL_ANALYSIS" },
  { id: 10, question: "What is an emergency fund?", expectedMode: "GENERAL_AI", expectedCapability: "EDUCATION" },
  { id: 11, question: "What if my salary decreases by 20%?", expectedMode: "FINANCIAL", expectedCapability: "FINANCIAL_ANALYSIS" },
  { id: 12, question: "Why is NVIDIA falling today?", expectedMode: "MARKET", expectedCapability: "MARKET_DATA" },
  { id: 13, question: "Explain diversification", expectedMode: "GENERAL_AI", expectedCapability: "EDUCATION" },
  { id: 14, question: "Help me write a project abstract", expectedMode: "GENERAL_AI", expectedCapability: "WRITING" },
  { id: 15, question: "What is my financial health score?", expectedMode: "FINANCIAL", expectedCapability: "FINANCIAL_ANALYSIS" }
];

async function runTests() {
  console.log("==================================================");
  console.log("RUNNING LUMINA AI ORCHESTRATOR 15 TEST CASES");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    console.log(`[TEST ${tc.id}] "${tc.question}"`);
    try {
      const res = await orchestrator.processQuery(tc.question, testUserContext, []);
      
      const modeMatch = res.mode === tc.expectedMode;
      const capabilityMatch = res.capabilities.includes(tc.expectedCapability as any);
      
      console.log(`  -> Mode: ${res.mode} (Expected: ${tc.expectedMode}) [${modeMatch ? 'PASS' : 'FAIL'}]`);
      console.log(`  -> Intent: ${res.intentLabel}`);
      console.log(`  -> Capabilities: ${res.capabilities.join(", ")}`);
      console.log(`  -> Answer Preview: ${res.answer.substring(0, 120).replace(/\n/g, ' ')}...`);

      // Check Critical Acceptance Rule: General questions MUST NOT contain user financial profile dumps
      if (tc.expectedMode === "GENERAL_AI") {
        const containsProfileDump = res.answer.includes("monthly income") || res.answer.includes("emergency reserve is") || res.answer.includes("your monthly cash flow");
        if (containsProfileDump) {
          console.log(`  ❌ CRITICAL FAIL: General question contains unwanted user financial profile dump!`);
          failed++;
          continue;
        }
      }

      if (modeMatch && capabilityMatch) {
        console.log(`  ✅ RESULT: PASSED\n`);
        passed++;
      } else {
        console.log(`  ❌ RESULT: FAILED\n`);
        failed++;
      }
    } catch (err) {
      console.error(`  ❌ EXCEPTION:`, err);
      failed++;
    }
  }

  console.log("==================================================");
  console.log(`FINAL SUMMARY: ${passed}/${testCases.length} PASSED, ${failed} FAILED`);
  console.log("==================================================");
}

runTests();
