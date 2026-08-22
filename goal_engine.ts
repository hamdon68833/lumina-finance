import { FinancialGoal, GoalStatus } from "./src/types";

export class GoalEngine {
  public static evaluateGoal(goal: Partial<FinancialGoal>, userContext: any): FinancialGoal {
    const targetAmt = goal.targetAmount?.amount || (typeof goal.targetAmount === "number" ? goal.targetAmount : 100000);
    const currentAmt = goal.currentAmount?.amount || (typeof goal.currentAmount === "number" ? goal.currentAmount : 20000);
    const targetMonths = goal.targetMonths || 24;
    const returnRate = goal.expectedReturnRate || 8.0;

    const remainingAmt = Math.max(0, targetAmt - currentAmt);
    const monthlyRate = returnRate / 100 / 12;

    // Compound growth formula: FV = PV*(1+r)^n + PMT*(((1+r)^n - 1)/r)
    let requiredMonthly = remainingAmt / targetMonths;
    if (monthlyRate > 0) {
      const pvGrowth = currentAmt * Math.pow(1 + monthlyRate, targetMonths);
      const neededFromPmt = Math.max(0, targetAmt - pvGrowth);
      const factor = (Math.pow(1 + monthlyRate, targetMonths) - 1) / monthlyRate;
      requiredMonthly = neededFromPmt / factor;
    }

    const currentMonthlyContrib = goal.monthlyContribution?.amount || (typeof goal.monthlyContribution === "number" ? goal.monthlyContribution : 1000);

    let projectedMonths = targetMonths;
    if (currentMonthlyContrib > 0) {
      projectedMonths = Math.ceil(remainingAmt / currentMonthlyContrib);
    }

    let status: GoalStatus = "ON_TRACK";
    if (currentAmt >= targetAmt) {
      status = "COMPLETED";
    } else if (projectedMonths <= targetMonths) {
      status = "ON_TRACK";
    } else if (projectedMonths <= targetMonths * 1.3) {
      status = "NEEDS_ADJUSTMENT";
    } else {
      status = "AT_RISK";
    }

    const shortfall = Math.max(0, remainingAmt - (currentMonthlyContrib * targetMonths));

    return {
      id: goal.id || `goal_${Date.now()}`,
      name: goal.name || "House Downpayment",
      category: goal.category || "House",
      targetAmount: { amount: targetAmt, currency: "INR" },
      currentAmount: { amount: currentAmt, currency: "INR" },
      targetMonths,
      monthlyContribution: { amount: currentMonthlyContrib, currency: "INR" },
      expectedReturnRate: returnRate,
      priority: goal.priority || "HIGH",
      status,
      projectedCompletionMonths: projectedMonths,
      shortfall: { amount: shortfall, currency: "INR" },
      surplus: { amount: shortfall === 0 ? (currentMonthlyContrib * targetMonths) - remainingAmt : 0, currency: "INR" }
    };
  }
}
