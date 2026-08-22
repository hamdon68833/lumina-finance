export class LifeEventEngine {
  public static simulateLifeEvent(eventType: string, customCost: number = 0, userContext: any): any {
    const monthlyIncome = Math.max(1, userContext?.monthlyIncome || 5000);
    const monthlyExpenses = Math.max(0, userContext?.monthlyExpenses || 3000);
    const savings = Math.max(0, userContext?.savings || 20000);

    let durationMonths = 6;
    let expenseMultiplier = 1.0;
    let incomeMultiplier = 1.0;
    let lumpSumCost = customCost;

    switch (eventType.toUpperCase()) {
      case "JOB_LOSS":
        incomeMultiplier = 0.0;
        durationMonths = 6;
        break;
      case "MARRIAGE":
        lumpSumCost = customCost || 500000;
        expenseMultiplier = 1.25;
        break;
      case "HOUSE_PURCHASE":
        lumpSumCost = customCost || 1000000;
        expenseMultiplier = 1.2;
        break;
      case "CAR_PURCHASE":
        lumpSumCost = customCost || 300000;
        expenseMultiplier = 1.1;
        break;
      case "HIGHER_EDUCATION":
        lumpSumCost = customCost || 400000;
        incomeMultiplier = 0.5;
        break;
      case "RELOCATION":
        lumpSumCost = customCost || 100000;
        break;
      default:
        lumpSumCost = customCost || 150000;
    }

    const postEventSavings = Math.max(0, savings - lumpSumCost);
    const postEventIncome = monthlyIncome * incomeMultiplier;
    const postEventExpenses = monthlyExpenses * expenseMultiplier;

    const postEventMonthsCovered = postEventExpenses > 0 ? postEventSavings / postEventExpenses : 12;

    return {
      eventType,
      simulatedDurationMonths: durationMonths,
      lumpSumCost,
      preEvent: { monthlyIncome, monthlyExpenses, savings, monthsCovered: monthlyExpenses > 0 ? savings / monthlyExpenses : 12 },
      postEvent: { monthlyIncome: postEventIncome, monthlyExpenses: postEventExpenses, savings: postEventSavings, monthsCovered: postEventMonthsCovered },
      feasibility: postEventMonthsCovered >= 3 ? "FEASIBLE_WITH_SAFE_RESERVES" : "HIGH_RISK_REDUCES_EMERGENCY_RESERVE",
      recommendations: postEventMonthsCovered < 3
        ? ["Build up additional liquid buffer before proceeding with this major life event.", "Consider phasing expense commitments over a longer timeline."]
        : ["Life event is financially manageable under current reserve levels."]
    };
  }
}
