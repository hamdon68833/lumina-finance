import "dotenv/config";
import { LuminaAIAgent } from "../lumina_agent";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

async function testPython() {
  const agent = new LuminaAIAgent(ai);
  const res = await agent.runAgent("What is Python?", { income: 5000, expenses: 3000 });
  console.log("==========================================");
  console.log("QUERY: What is Python?");
  console.log("MODE:", res.mode);
  console.log("INTENT:", res.intent);
  console.log("ANSWER:\n", res.answer);
  console.log("CALCULATIONS:", res.calculations);
  console.log("==========================================");
}

testPython();
