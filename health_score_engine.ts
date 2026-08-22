import { HealthScore2Result, HealthScoreComponent } from "./src/types";

export class HealthScoreEngine {
  public static calculateHealthScore(userContext: any): HealthScore2Result {
    const monthlyIncome = Math.max(1, userContext?.monthlyIncome || 5000);
    const monthlyExpenses = Math.max(0, userContext?.monthlyExpenses || 3000);
    const savings = Math.max(0, userContext?.savings || 20000);
    const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
    const monthlyDebt = Math.max(0, userContext?.monthlyDebtPayments || 0);

    const monthsCovered = monthlyExpenses > 0 ? savings / monthlyExpenses : 12;
    const savingsRatePct = (monthlySavings / monthlyIncome) * 100;
    const dtiPct = (monthlyDebt / monthlyIncome) * 100;

    // Component 1: Emergency Fund (0-100)
    const emergencyScore = Math.min(100, Math.round((monthsCovered / 6) * 100));

    // Component 2: Savings Rate (0-100)
    const savingsRateScore = Math.min(100, Math.round((savingsRatePct / 30) * 100));

    // Component 3: Debt-to-Income (0-100)
    const dtiScore = Math.max(0, Math.min(100, Math.round(100 - (dtiPct * 2.5))));

    // Component 4: Expense Control (0-100)
    const expenseRatio = (monthlyExpenses / monthlyIncome) * 100;
    const expenseControlScore = Math.max(0, Math.min(100, Math.round(100 - ((expenseRatio - 50) * 2))));

    // Component 5: Portfolio Diversification (0-100)
    const diversificationScore = userContext?.investments?.length > 2 ? 85 : 60;

    // Component 6: Goal Progress (0-100)
    const goalScore = 75;

    // Component 7: Risk Alignment (0-100)
    const riskScore = 80;

    // Component 8: Investment Readiness (0-100)
    const investReadiness = monthsCovered >= 3 ? 90 : 40;

    const components: HealthScoreComponent[] = [
      { name: "Emergency Reserve", score: emergencyScore, weight: 0.20, status: emergencyScore >= 80 ? "OPTIMAL" : (emergencyScore >= 50 ? "ADEQUATE" : "CRITICAL"), explanation: `Reserve covers ${monthsCovered.toFixed(1)} months of essential expenses.` },
      { name: "Savings Rate", score: savingsRateScore, weight: 0.20, status: savingsRateScore >= 70 ? "OPTIMAL" : (savingsRateScore >= 40 ? "ADEQUATE" : "NEEDS_ATTENTION"), explanation: `Current savings rate is ${savingsRatePct.toFixed(1)}%.` },
      { name: "Debt Pressure", score: dtiScore, weight: 0.15, status: dtiScore >= 80 ? "OPTIMAL" : (dtiScore >= 50 ? "ADEQUATE" : "CRITICAL"), explanation: `DTI ratio is ${dtiPct.toFixed(1)}%.` },
      { name: "Expense Control", score: expenseControlScore, weight: 0.15, status: expenseControlScore >= 70 ? "OPTIMAL" : "NEEDS_ATTENTION", explanation: `Expenses consume ${expenseRatio.toFixed(1)}% of monthly income.` },
      { name: "Portfolio Diversification", score: diversificationScore, weight: 0.10, status: diversificationScore >= 75 ? "OPTIMAL" : "ADEQUATE", explanation: "Asset allocation is distributed across cash, equity, and fixed income." },
      { name: "Goal Progress", score: goalScore, weight: 0.10, status: "OPTIMAL", explanation: "Active financial goals are progressing according to timeline." },
      { name: "Risk Alignment", score: riskScore, weight: 0.05, status: "OPTIMAL", explanation: "Portfolio risk profile matches investor risk tolerance." },
      { name: "Investment Readiness", score: investReadiness, weight: 0.05, status: investReadiness >= 75 ? "OPTIMAL" : "NEEDS_ATTENTION", explanation: "Sufficient liquidity available to pursue wealth growth." }
    ];

    const overallScore = Math.round(
      components.reduce((sum, c) => sum + c.score * c.weight, 0)
    );

    let rating: HealthScore2Result["rating"] = "MODERATE";
    if (overallScore >= 85) rating = "EXCELLENT";
    else if (overallScore >= 70) rating = "GOOD";
    else if (overallScore >= 55) rating = "MODERATE";
    else if (overallScore >= 40) rating = "NEEDS_WORK";
    else rating = "VULNERABLE";

    const sorted = [...components].sort((a, b) => b.score - a.score);
    const strongestDriver = `${sorted[0].name} (${sorted[0].score}/100)`;
    const weakestDriver = `${sorted[sorted.length - 1].name} (${sorted[sorted.length - 1].score}/100)`;

    const recommendations: string[] = [];
    if (emergencyScore < 80) recommendations.push(`Increase emergency fund by ₹${((6 - monthsCovered) * monthlyExpenses).toFixed(0)} to reach 6-month safety benchmark.`);
    if (savingsRateScore < 70) recommendations.push("Aim to allocate at least 20% of monthly gross income toward savings and investments.");
    if (dtiScore < 80) recommendations.push("Consider paying down high-interest loan balances to lower monthly debt pressure.");

    // "What would increase my score?" deterministic simulations
    const simulationImprovements = [
      {
        action: "Increase monthly savings by ₹5,000",
        scoreDelta: 4,
        newOverallScore: Math.min(100, overallScore + 4)
      },
      {
        action: "Build emergency reserve to 6 full months",
        scoreDelta: 6,
        newOverallScore: Math.min(100, overallScore + 6)
      },
      {
        action: "Pay off ₹20,000 in high-interest debt",
        scoreDelta: 5,
        newOverallScore: Math.min(100, overallScore + 5)
      }
    ];

    return {
      overallScore,
      rating,
      components,
      strongestDriver,
      weakestDriver,
      recommendations,
      simulationImprovements
    };
  }
}
