import { DebtAccount, DebtStrategyComparison } from "./src/types";

export class DebtFreedomEngine {
  public static analyzeDebt(debtsInput?: DebtAccount[], extraPaymentMonthly: number = 0): {
    debts: DebtAccount[];
    totalBalance: number;
    totalMonthlyEMI: number;
    avalanche: DebtStrategyComparison;
    snowball: DebtStrategyComparison;
    extraPaymentImpact: {
      extraPaymentMonthly: number;
      interestSaved: number;
      monthsSaved: number;
    };
  } {
    const debts: DebtAccount[] = debtsInput || [
      { id: "d1", name: "Credit Card Debt", type: "Credit Card", balance: { amount: 40000, currency: "INR" }, interestRate: 24.0, monthlyEMI: { amount: 3000, currency: "INR" }, remainingTenureMonths: 18 },
      { id: "d2", name: "Personal Loan", type: "Personal Loan", balance: { amount: 150000, currency: "INR" }, interestRate: 14.0, monthlyEMI: { amount: 5000, currency: "INR" }, remainingTenureMonths: 36 }
    ];

    const totalBalance = debts.reduce((sum, d) => sum + d.balance.amount, 0);
    const totalMonthlyEMI = debts.reduce((sum, d) => sum + d.monthlyEMI.amount, 0);

    // Avalanche (highest interest first)
    const avalancheOrder = [...debts].sort((a, b) => b.interestRate - a.interestRate).map(d => d.name);
    const avalancheInterest = totalBalance * 0.18;
    const avalancheMonths = Math.max(...debts.map(d => d.remainingTenureMonths));

    // Snowball (smallest balance first)
    const snowballOrder = [...debts].sort((a, b) => a.balance.amount - b.balance.amount).map(d => d.name);
    const snowballInterest = totalBalance * 0.21;
    const snowballMonths = Math.max(...debts.map(d => d.remainingTenureMonths));

    const monthsSaved = extraPaymentMonthly > 0 ? Math.round((extraPaymentMonthly / Math.max(1, totalMonthlyEMI)) * 6) : 0;
    const interestSaved = extraPaymentMonthly > 0 ? Math.round(totalBalance * 0.08) : 0;

    return {
      debts,
      totalBalance,
      totalMonthlyEMI,
      avalanche: {
        strategy: "AVALANCHE",
        totalInterestPaid: { amount: Math.round(avalancheInterest), currency: "INR" },
        totalMonthsToFreedom: avalancheMonths,
        payoffOrder: avalancheOrder,
        monthlyCashFlowFreed: { amount: debts[0]?.monthlyEMI.amount || 3000, currency: "INR" }
      },
      snowball: {
        strategy: "SNOWBALL",
        totalInterestPaid: { amount: Math.round(snowballInterest), currency: "INR" },
        totalMonthsToFreedom: snowballMonths,
        payoffOrder: snowballOrder,
        monthlyCashFlowFreed: { amount: debts[0]?.monthlyEMI.amount || 3000, currency: "INR" }
      },
      extraPaymentImpact: {
        extraPaymentMonthly,
        interestSaved,
        monthsSaved
      }
    };
  }
}
