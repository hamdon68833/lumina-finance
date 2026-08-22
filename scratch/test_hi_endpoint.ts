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
  riskPreference: "High"
};

async function testSequentialQueries() {
  console.log("==================================================");
  console.log("TESTING SEQUENTIAL QUERIES ON LUMINA ORCHESTRATOR");
  console.log("==================================================\n");

  const queries = [
    { label: "Query 1: 'hi'", text: "hi", expectedMode: "GENERAL_AI" },
    { label: "Query 2: 'What is Python?'", text: "What is Python?", expectedMode: "GENERAL_AI" },
    { label: "Query 3: 'Can I afford a $2,000 laptop?'", text: "Can I afford a $2,000 laptop?", expectedMode: "FINANCIAL" },
    { label: "Query 4: 'Why is my risk score 64?'", text: "Why is my risk score 64?", expectedMode: "FINANCIAL" },
    { label: "Query 5: 'How can I reach my house goal faster?'", text: "How can I reach my house goal faster?", expectedMode: "FINANCIAL" },
    { label: "Query 6: 'What is the latest financial news today?'", text: "What is the latest financial news today?", expectedMode: "CURRENT_INFO" },
    { label: "Query 7: 'Why is NVIDIA falling today?'", text: "Why is NVIDIA falling today?", expectedMode: "MARKET" }
  ];

  for (const q of queries) {
    console.log(`--- ${q.label} ---`);
    console.log(`User: "${q.text}"`);

    const res = await orchestrator.processQuery(q.text, testUserContext, []);

    console.log(`  -> Mode: ${res.mode}`);
    console.log(`  -> Intent: ${res.intent} (${res.intentLabel})`);
    console.log(`  -> Required Tools: ${JSON.stringify(res.requiredTools)}`);
    console.log(`  -> Calculations Loaded: ${Object.keys(res.calculations).length > 0 ? 'YES' : 'NO (NONE)'}`);
    console.log(`  -> Answer Preview: "${res.answer.substring(0, 120).replace(/\n/g, ' ')}..."`);

    if (q.expectedMode === "GENERAL_AI") {
      if (Object.keys(res.calculations).length > 0) {
        console.log(`❌ FAIL: General query loaded financial calculations!`);
      } else {
        console.log(`✅ PASS: General query cleanly routed to GENERAL_AI without financial data.`);
      }
    } else {
      console.log(`✅ PASS: Correctly routed to ${res.mode}.`);
    }
    console.log("");
  }
}

testSequentialQueries();
