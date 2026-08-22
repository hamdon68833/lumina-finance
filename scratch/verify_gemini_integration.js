import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function verifyGeminiIntegration() {
  console.log("==================================================");
  console.log("VERIFYING GEMINI API INTEGRATION & COPILOT PIPELINE");
  console.log("==================================================\n");

  // Step 1: Check environment variable presence (DO NOT PRINT KEY)
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");
  console.log(`[STEP 1] process.env.GEMINI_API_KEY loaded: ${hasKey ? 'YES' : 'NO'}`);

  let geminiConnected = false;
  let simpleResponseText = "";

  // Step 2: Initialize @google/genai safely
  if (hasKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      // Step 3: Test simple Gemini request
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: 'Respond with exactly: Lumina Gemini connection successful.'
      });

      simpleResponseText = response?.text?.trim() || "";
      if (simpleResponseText.includes("Lumina Gemini connection successful")) {
        geminiConnected = true;
      } else if (simpleResponseText.length > 0) {
        geminiConnected = true; // Response received from model
      }
    } catch (err) {
      console.error("[GEMINI CONNECTIVITY ERROR]:", err.message || err);
      geminiConnected = false;
    }
  }

  console.log(`\nGEMINI_CONNECTED = ${geminiConnected}`);
  console.log(`Simple Test Response: "${simpleResponseText}"\n`);

  // Step 4: Test HTTP POST /api/advisor/copilot against running server (http://localhost:3001)
  console.log("==================================================");
  console.log("TESTING /api/advisor/copilot ENDPOINT (3 CRITICAL QUESTIONS)");
  console.log("==================================================\n");

  const testPayloads = [
    {
      name: "Question 1: Risk Explanation",
      question: "Why is my risk score 64?",
      userContext: { income: 6500, expenses: 3800, savings: 2700, monthsCovered: 2.1, riskScore: 64, riskCategory: "MEDIUM" }
    },
    {
      name: "Question 2: Affordability",
      question: "Can I afford a $2,000 laptop?",
      userContext: { income: 6500, expenses: 3800, savings: 2700, monthsCovered: 2.1 }
    },
    {
      name: "Question 3: Goal Optimization",
      question: "How can I reach my house goal faster?",
      userContext: {
        income: 6500,
        expenses: 3800,
        savings: 2700,
        goals: [{ name: "House Downpayment Goal", targetAmount: 500000, currentSavings: 100000, monthsLeft: 36, requiredMonthly: 1000 }]
      }
    },
    {
      name: "Question 4: Market & Web/News Grounding",
      question: "Is AAPL a good investment?",
      userContext: {
        selectedStock: { ticker: "AAPL", name: "Apple Inc.", currentPrice: 228.40, sma20: 222.10, rsi: 58.2, trend: "Strong Uptrend (Bullish)", recommendation: "BUY" }
      }
    }
  ];

  const results = [];

  for (let i = 0; i < testPayloads.length; i++) {
    const item = testPayloads[i];
    console.log(`--- Testing ${item.name} ---`);
    console.log(`Question: "${item.question}"`);

    try {
      const res = await fetch("http://localhost:3001/api/advisor/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: item.question,
          userContext: item.userContext,
          history: []
        })
      });

      const data = await res.json();
      console.log(`  -> Intent: ${data.intent} (${data.intentLabel})`);
      console.log(`  -> Has Calculations: ${Boolean(data.calculations && Object.keys(data.calculations).length > 0)}`);
      console.log(`  -> Answer Snippet: ${data.answer ? data.answer.substring(0, 150).replace(/\n/g, " ") : "NO ANSWER"}...`);
      results.push(data);
    } catch (err) {
      console.error(`  -> ERROR testing ${item.name}:`, err.message);
    }
    console.log("");
  }

  // Verification of Distinct Intents & Answers
  if (results.length >= 3) {
    const i1 = results[0].intent;
    const i2 = results[1].intent;
    const i3 = results[2].intent;

    const a1 = results[0].answer;
    const a2 = results[1].answer;
    const a3 = results[2].answer;

    const distinctIntents = i1 !== i2 && i2 !== i3 && i1 !== i3;
    const distinctAnswers = a1 !== a2 && a2 !== a3 && a1 !== a3;
    const noGenericTemplate = !a1.includes("Based on your monthly income of $6,500 and savings of $3,500");

    console.log("==================================================");
    console.log("COPILOT EVALUATION SUMMARY");
    console.log("==================================================");
    console.log(`Distinct Intents (Q1 vs Q2 vs Q3): ${distinctIntents ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`Distinct Answers (Q1 vs Q2 vs Q3): ${distinctAnswers ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`No Generic Fallback Template: ${noGenericTemplate ? 'PASS ✅' : 'FAIL ❌'}`);
  }
}

verifyGeminiIntegration().catch(err => console.error("Script execution failed:", err));
