import "dotenv/config";
import { LuminaAIAgent } from "../lumina_agent";
import { processCopilotQuery } from "../copilot_engine";

async function testCashflowQuery() {
  const agent = new LuminaAIAgent(null);
  const route = agent.understandRequest("How can I optimize my monthly cash flow and expenses?");
  console.log("ROUTE:", route);

  const userContext = {
    monthlyIncome: 75000,
    monthlyExpenses: 42000,
    savings: 33000,
    monthlyDebtPayments: 8000
  };

  const res = await processCopilotQuery("How can I optimize my monthly cash flow and expenses?", userContext, [], null);
  console.log("MODE:", res.mode);
  console.log("INTENT:", res.intent);
  console.log("ANSWER PREVIEW:\n", res.answer.slice(0, 300));
}

testCashflowQuery();
