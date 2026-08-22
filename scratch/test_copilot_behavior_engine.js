import { processCopilotQuery } from '../copilot_engine.js';

async function runBehaviorTests() {
  console.log("==================================================");
  console.log("TESTING COPILOT BEHAVIOR ENGINE & MULTI-TURN MEMORY");
  console.log("==================================================\n");

  const context = {
    income: 6500,
    expenses: 3800,
    currentLiquidReserve: 8000,
    savings: 2700,
    age: 28,
    riskPreference: "High",
    goals: [
      { name: "House Downpayment Goal", targetAmount: 500000, currentSavings: 100000, monthsLeft: 36, requiredMonthly: 1000 }
    ],
    debts: [
      { name: "Personal Loan", balance: 12000, interestRate: 11.5, tenureMonths: 24, monthlyEmi: 560 }
    ]
  };

  // Test 4-Step Multi-Turn Dialogue Scenario
  console.log("--- TEST: 4-STEP MULTI-TURN DIALOGUE ---");

  // Step 1: Laptop
  const turn1 = await processCopilotQuery("Can I afford a $2,000 laptop?", context, [], null);
  console.log(`[Turn 1] Q: "Can I afford a $2,000 laptop?"`);
  console.log(`  -> Intent: ${turn1.intent}`);
  console.log(`  -> Item: ${turn1.calculations.item} ($${turn1.calculations.purchaseAmount})`);
  console.log(`  -> Status: ${turn1.calculations.status}`);

  // Step 2: Wait 3 months
  const history1 = [
    { sender: "user", text: "Can I afford a $2,000 laptop?" },
    { sender: "bot", text: turn1.answer, intent: turn1.intent, calculations: turn1.calculations }
  ];
  const turn2 = await processCopilotQuery("What if I wait 3 months?", context, history1, null);
  console.log(`\n[Turn 2] Q: "What if I wait 3 months?"`);
  console.log(`  -> Intent: ${turn2.intent}`);
  console.log(`  -> Wait Months: ${turn2.calculations.waitMonthsScenario}`);

  // Step 3: Save $500 more
  const history2 = [
    ...history1,
    { sender: "user", text: "What if I wait 3 months?" },
    { sender: "bot", text: turn2.answer, intent: turn2.intent, calculations: turn2.calculations }
  ];
  const turn3 = await processCopilotQuery("What if I save another $500?", context, history2, null);
  console.log(`\n[Turn 3] Q: "What if I save another $500?"`);
  console.log(`  -> Intent: ${turn3.intent}`);
  console.log(`  -> Extra Savings: $${turn3.calculations.extraSavingsScenario}`);

  // Step 4: House goal impact
  const history3 = [
    ...history2,
    { sender: "user", text: "What if I save another $500?" },
    { sender: "bot", text: turn3.answer, intent: turn3.intent, calculations: turn3.calculations }
  ];
  const turn4 = await processCopilotQuery("Would that affect my house goal?", context, history3, null);
  console.log(`\n[Turn 4] Q: "Would that affect my house goal?"`);
  console.log(`  -> Intent: ${turn4.intent} (${turn4.intentLabel})`);
  console.log(`  -> Impact Warning: ${turn4.warnings[0] || 'None'}`);
  console.log(`  -> Laptop Amount Carried: $${turn4.calculations.laptopPurchaseAmount}`);

  // Anti-Generic Opening Phrase Check
  console.log("\n==================================================");
  console.log("CHECKING ANTI-GENERIC PERSONALITY COMPLIANCE");
  console.log("==================================================");
  const genericStarters = [
    "based on your financial position",
    "that's a great question",
    "your financial position is stable",
    "absolutely!"
  ];

  let genericFound = false;
  [turn1, turn2, turn3, turn4].forEach((t, i) => {
    const textLower = t.answer.toLowerCase();
    genericStarters.forEach(starter => {
      if (textLower.includes(starter)) {
        console.warn(`⚠️ Warning: Turn ${i+1} answer contains generic starter: "${starter}"`);
        genericFound = true;
      }
    });
  });

  if (!genericFound) {
    console.log("No generic opening phrases found! Personality is direct & professional. PASS ✅");
  }

  console.log("\n==================================================");
  console.log("ALL BEHAVIOR ENGINE TESTS COMPLETED");
  console.log("==================================================");
}

runBehaviorTests().catch(err => console.error("Behavior test error:", err));
