import { processCopilotQuery } from "../copilot_engine";

async function debugCashFlowQuery() {
  console.log("=== DEBUGGING COPILOT CASH FLOW QUERY ===");
  
  const testUserContext = {
    userId: "test-user-123",
    income: 6500,
    expenses: 3800,
    currentLiquidReserve: 180000,
    age: 28,
    riskPreference: "High",
    isDemoMode: false
  };

  try {
    const res = await processCopilotQuery(
      "How can I optimize my monthly cash flow?",
      testUserContext,
      [],
      null,
      "money"
    );

    console.log("SUCCESS RESULT:", JSON.stringify(res, null, 2));
  } catch (err: any) {
    console.error("EXPLICIT ERROR CAUGHT:", err);
  }
}

debugCashFlowQuery();
