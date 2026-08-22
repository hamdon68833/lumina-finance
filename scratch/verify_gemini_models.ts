import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  const ai = new GoogleGenAI({ apiKey });
  
  const models = ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-flash-latest"];

  async function testModels() {
    for (const m of models) {
      try {
        console.log(`Testing model: ${m}...`);
        const res = await ai.models.generateContent({
          model: m,
          contents: "What is Python in 2 sentences?"
        });
        console.log(`✅ Model ${m} SUCCESS:`, res.text);
      } catch (err: any) {
        console.log(`❌ Model ${m} ERROR:`, err.message);
      }
    }
  }

  testModels();
}
