import { SubscriptionItem } from "./src/types";

export class ExpenseIntelligenceEngine {
  public static analyzeExpenses(userContext: any): any {
    const expenses = userContext?.expenseBreakdown || [
      { category: "Housing & Rent", amount: 12000, percentage: 40 },
      { category: "Dining out & Food", amount: 6000, percentage: 20 },
      { category: "Utilities & Bills", amount: 4000, percentage: 13.3 },
      { category: "Shopping & Entertainment", amount: 5000, percentage: 16.7 },
      { category: "Transportation", amount: 3000, percentage: 10 }
    ];

    const totalExpenses = expenses.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

    const spikes = expenses
      .filter((item: any) => (item.amount / Math.max(1, totalExpenses)) > 0.18 && !/housing|rent/i.test(item.category))
      .map((item: any) => ({
        category: item.category,
        amount: item.amount,
        percentage: Number(((item.amount / totalExpenses) * 100).toFixed(1)),
        potentialMonthlyReduction: Math.round(item.amount * 0.25),
        potentialAnnualSavings: Math.round(item.amount * 0.25 * 12)
      }));

    return {
      totalMonthlyExpenses: totalExpenses,
      categoriesCount: expenses.length,
      spendingSpikes: spikes,
      potentialTotalAnnualSavings: spikes.reduce((sum: number, s: any) => sum + s.potentialAnnualSavings, 0),
      advice: spikes.length > 0
        ? `Found ${spikes.length} discretionary spending spikes. Reducing dining out or shopping by 25% could unlock ₹${spikes.reduce((sum: number, s: any) => sum + s.potentialAnnualSavings, 0)} per year.`
        : "Expense distribution across categories appears well-controlled."
    };
  }
}

export class SubscriptionIntelligenceEngine {
  public static scanSubscriptions(userContext: any): SubscriptionItem[] {
    return [
      {
        id: "sub_1",
        serviceName: "Netflix Premium",
        monthlyCost: { amount: 649, currency: "INR" },
        annualizedCost: { amount: 7788, currency: "INR" },
        frequency: "Monthly font-mono",
        category: "Streaming",
        lastDetected: "2026-08-01",
        potentialSavings: { amount: 7788, currency: "INR" }
      },
      {
        id: "sub_2",
        serviceName: "Gym Membership",
        monthlyCost: { amount: 2000, currency: "INR" },
        annualizedCost: { amount: 24000, currency: "INR" },
        frequency: "Monthly font-mono",
        category: "Gym",
        lastDetected: "2026-08-05",
        potentialSavings: { amount: 24000, currency: "INR" }
      },
      {
        id: "sub_3",
        serviceName: "Cloud Storage Pro",
        monthlyCost: { amount: 219, currency: "INR" },
        annualizedCost: { amount: 2628, currency: "INR" },
        frequency: "Monthly font-mono",
        category: "Software",
        lastDetected: "2026-08-10",
        potentialSavings: { amount: 2628, currency: "INR" }
      }
    ];
  }
}
