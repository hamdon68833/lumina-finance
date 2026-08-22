import { HealthScoreEngine } from "./health_score_engine";

export interface SimulationParams {
  purchaseAmount?: number;
  salaryChangePercent?: number;
  newMonthlyExpense?: number;
  expenseReductionMonthly?: number;
  newEMI?: number;
  additionalSavingsMonthly?: number;
  marketDeclinePercent?: number;
}

export class DecisionLabEngine {
  public static simulateScenario(userContext: any, params: SimulationParams): any {
    const currentIncome = Math.max(1, userContext?.monthlyIncome || 5000);
    const currentExpenses = Math.max(0, userContext?.monthlyExpenses || 3000);
    const currentSavings = Math.max(0, userContext?.savings || 20000);

    let newIncome = currentIncome;
    let newExpenses = currentExpenses;
    let newSavings = currentSavings;

    if (params.salaryChangePercent) {
      newIncome = currentIncome * (1 + params.salaryChangePercent / 100);
    }
    if (params.newMonthlyExpense) {
      newExpenses += params.newMonthlyExpense;
    }
    if (params.expenseReductionMonthly) {
      newExpenses = Math.max(0, newExpenses - params.expenseReductionMonthly);
    }
    if (params.newEMI) {
      newExpenses += params.newEMI;
    }
    if (params.purchaseAmount) {
      newSavings = Math.max(0, newSavings - params.purchaseAmount);
    }

    const currentMonthsCovered = currentExpenses > 0 ? currentSavings / currentExpenses : 12;
    const newMonthsCovered = newExpenses > 0 ? newSavings / newExpenses : 12;

    const currentMonthlySavings = currentIncome - currentExpenses;
    const newMonthlySavings = newIncome - newExpenses;

    const currentHealth = HealthScoreEngine.calculateHealthScore(userContext);
    const newContext = {
      ...userContext,
      monthlyIncome: newIncome,
      monthlyExpenses: newExpenses,
      savings: newSavings
    };
    const newHealth = HealthScoreEngine.calculateHealthScore(newContext);

    return {
      scenarioType: params.purchaseAmount ? "LARGE_PURCHASE" : (params.salaryChangePercent ? "INCOME_CHANGE" : "SCENARIO_SIMULATION"),
      baseline: {
        monthlyIncome: currentIncome,
        monthlyExpenses: currentExpenses,
        savings: currentSavings,
        monthlySavings: currentMonthlySavings,
        emergencyMonthsCovered: currentMonthsCovered,
        healthScore: currentHealth.overallScore
      },
      simulated: {
        monthlyIncome: newIncome,
        monthlyExpenses: newExpenses,
        savings: newSavings,
        monthlySavings: newMonthlySavings,
        emergencyMonthsCovered: newMonthsCovered,
        healthScore: newHealth.overallScore
      },
      delta: {
        savingsDelta: newSavings - currentSavings,
        monthlySavingsDelta: newMonthlySavings - currentMonthlySavings,
        emergencyMonthsDelta: newMonthsCovered - currentMonthsCovered,
        healthScoreDelta: newHealth.overallScore - currentHealth.overallScore
      },
      affordabilityAssessment: newMonthsCovered >= 3 ? "AFFORDABLE_WITH_SAFE_RESERVES" : "RISKY_REDUCES_EMERGENCY_RESERVE",
      recommendedAdjustments: newMonthsCovered < 3
        ? ["Consider postponing large cash purchases until emergency reserves reach at least 3 months.", "Explore installment options with 0% interest if cash flow permits."]
        : ["Transaction is manageable within current financial capacity."]
    };
  }
}
