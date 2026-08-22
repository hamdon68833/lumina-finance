import { FinancialTwinScore } from "./src/types";

export class FinancialTwinEngine {
  public static calculateTwin(userContext: any): FinancialTwinScore {
    const monthlyIncome = Math.max(1, userContext?.monthlyIncome || 5000);
    const monthlyExpenses = Math.max(0, userContext?.monthlyExpenses || 3000);
    const savings = Math.max(0, userContext?.savings || 20000);
    const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);

    // 1. Stability Score (0-100)
    const savingsRatio = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    const stabilityScore = Math.min(100, Math.round(savingsRatio * 3.33));

    // 2. Liquidity Score (0-100) based on months of emergency coverage (target 6 months = 100)
    const monthsCovered = monthlyExpenses > 0 ? savings / monthlyExpenses : 12;
    const liquidityScore = Math.min(100, Math.round((monthsCovered / 6) * 100));

    // 3. Debt Pressure Score (0-100, 100 = 0% DTI, 0 = >=50% DTI)
    const monthlyDebtPayments = userContext?.monthlyDebtPayments || 0;
    const dti = monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;
    const debtPressureScore = Math.max(0, Math.min(100, Math.round(100 - (dti * 2))));

    // 4. Investment Readiness Score (0-100)
    const hasEmergencyFund = monthsCovered >= 3;
    const investmentReadinessScore = Math.round(
      (hasEmergencyFund ? 50 : 20) + Math.min(50, (savingsRatio / 30) * 50)
    );

    // 5. Goal Readiness Score (0-100)
    const goals = userContext?.goals || [];
    let goalReadinessScore = 75;
    if (goals.length > 0) {
      const avgProgress = goals.reduce((acc: number, g: any) => {
        const tgt = g.targetAmount?.amount || g.targetAmount || 1;
        const cur = g.currentAmount?.amount || g.currentAmount || 0;
        return acc + Math.min(1, cur / tgt);
      }, 0) / goals.length;
      goalReadinessScore = Math.round(avgProgress * 100);
    }

    const overallHealth = Math.round(
      stabilityScore * 0.25 +
      liquidityScore * 0.25 +
      debtPressureScore * 0.20 +
      investmentReadinessScore * 0.15 +
      goalReadinessScore * 0.15
    );

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (stabilityScore >= 70) strengths.push(`Strong monthly savings rate of ${savingsRatio.toFixed(1)}%`);
    else weaknesses.push(`Savings rate of ${savingsRatio.toFixed(1)}% is below the recommended 20% benchmark`);

    if (liquidityScore >= 80) strengths.push(`Emergency fund covers ${monthsCovered.toFixed(1)} months of essential expenses`);
    else weaknesses.push(`Emergency reserve covers only ${monthsCovered.toFixed(1)} months (target: 6 months)`);

    if (debtPressureScore >= 80) strengths.push(`Healthy debt-to-income ratio of ${dti.toFixed(1)}%`);
    else weaknesses.push(`High debt pressure with DTI ratio at ${dti.toFixed(1)}%`);

    return {
      overallHealth,
      stabilityScore,
      liquidityScore,
      debtPressureScore,
      investmentReadinessScore,
      goalReadinessScore,
      strengths,
      weaknesses,
      calculatedAt: new Date().toISOString()
    };
  }
}
