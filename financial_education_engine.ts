export class FinancialEducationEngine {
  private static concepts: Record<string, { beginner: string; intermediate: string; advanced: string }> = {
    "ETF": {
      beginner: "An Exchange Traded Fund (ETF) is a basket of stocks or bonds that trades on the stock market like a single stock. It lets you invest in hundreds of companies at once.",
      intermediate: "ETFs track market indices (like Nifty 50 or S&P 500) with low expense ratios (typically 0.05%–0.20%). They offer instant diversification and intraday liquidity.",
      advanced: "ETFs utilize creation and redemption mechanisms through Authorized Participants (APs) to maintain tight arbitrage pricing around Net Asset Value (NAV), minimizing tracking error."
    },
    "SIP": {
      beginner: "Systematic Investment Plan (SIP) means investing a fixed amount of money every month automatically into a mutual fund or index fund.",
      intermediate: "SIP enforces rupee-cost averaging by acquiring more fund units when prices drop and fewer units when prices rise, mitigating market timing risks over long horizons.",
      advanced: "Mathematical simulation demonstrates that automated monthly Dollar-Cost Averaging (DCA/SIP) yields lower portfolio volatility variance compared to lump-sum timing strategies."
    },
    "CAGR": {
      beginner: "Compounded Annual Growth Rate (CAGR) measures the average yearly growth rate of an investment over a multi-year period.",
      intermediate: "CAGR formula: [(Ending Value / Beginning Value) ^ (1 / Years)] - 1. It smooths out annual fluctuations to provide a standardized return metric.",
      advanced: "Unlike simple arithmetic returns, CAGR accounts for the geometric compounding of returns over discrete time intervals, providing an accurate measure of capital accumulation."
    },
    "DIVERSIFICATION": {
      beginner: "Diversification means not putting all your money in one basket. Spreading investments across stocks, gold, and fixed deposits reduces overall risk.",
      intermediate: "By combining non-correlated assets (e.g. equities with gold or bonds), overall portfolio variance declines while maintaining expected returns (Markowitz Efficient Frontier).",
      advanced: "Modern Portfolio Theory quantifies diversification benefit through the covariance matrix of asset returns, maximizing Sharpe ratio by minimizing uncompensated idiosyncratic risk."
    },
    "EMERGENCY_FUND": {
      beginner: "An emergency fund is liquid cash saved in a bank account to cover 3 to 6 months of living expenses in case of job loss or sudden medical emergencies.",
      intermediate: "Emergency reserves must prioritize liquidity and capital preservation over return yield. High-yield savings accounts or liquid liquid mutual funds are standard vehicles.",
      advanced: "Asset-liability matching requires segregating operational cash flows from wealth-accumulation buckets to insulate equity drawdown risks during macroeconomic downturns."
    }
  };

  public static explainConcept(term: string, level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" = "BEGINNER"): any {
    const key = Object.keys(this.concepts).find(k => k.toLowerCase() === term.toLowerCase() || term.toLowerCase().includes(k.toLowerCase())) || "ETF";
    const item = this.concepts[key];
    const explanation = item[level.toLowerCase() as "beginner" | "intermediate" | "advanced"] || item.beginner;

    return {
      term: key,
      level,
      explanation,
      disclaimer: "Educational content provided for financial literacy only. This is not personalized investment advice."
    };
  }
}
