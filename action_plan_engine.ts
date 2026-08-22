export class ActionPlanEngine {
  public static generateActionPlan(userContext: any): {
    today: string[];
    thisWeek: string[];
    thisMonth: string[];
  } {
    const monthlyIncome = userContext?.monthlyIncome || 5000;
    const savings = userContext?.savings || 20000;
    const monthlyExpenses = userContext?.monthlyExpenses || 3000;
    const monthsCovered = monthlyExpenses > 0 ? savings / monthlyExpenses : 12;

    const todayActions = [
      "Review high-severity smart alerts in Notification Center."
    ];
    if (monthsCovered < 6) {
      todayActions.push(`Check liquid balance (current: ₹${savings}, covers ${monthsCovered.toFixed(1)} months).`);
    }

    const weekActions = [
      "Verify recurring subscription charges for unused services.",
      "Review asset allocation concentration for single-stock exposure."
    ];

    const monthActions = [
      "Allocate ₹5,000 to monthly index fund SIP target.",
      "Track discretionary dining and entertainment expenses against monthly budget cap."
    ];

    return {
      today: todayActions,
      thisWeek: weekActions,
      thisMonth: monthActions
    };
  }
}

export class AnomalyEngine {
  public static detectAnomalies(userContext: any): any[] {
    return [
      {
        id: "anom_1",
        type: "SPENDING_SPIKE",
        label: "POTENTIAL ANOMALY: Dining Out Category Spike",
        details: "Dining out expenses increased by 35% compared to baseline monthly averages.",
        amount: { amount: 8500, currency: "INR" },
        date: "2026-08-18",
        severity: "MEDIUM"
      }
    ];
  }
}

export class AuditEngine {
  private static logs: any[] = [];

  public static logDecision(intent: string, toolsUsed: string[], dataSource: string, status: string = "SUCCESS"): void {
    this.logs.push({
      timestamp: new Date().toISOString(),
      intent,
      toolsUsed,
      dataSource,
      status
    });
  }

  public static getLogs(): any[] {
    return this.logs;
  }
}
