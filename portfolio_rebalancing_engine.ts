import { formatCurrency } from "./currency_formatter";

export interface RebalanceInputHolding {
  symbol: string;
  name?: string;
  quantity: number;
  currentPrice: number;
  currency?: "INR" | "USD";
  assetType?: string;
}

export interface TargetAllocation {
  equities?: number; // e.g. 60
  fixedIncome?: number; // e.g. 30
  cash?: number; // e.g. 10
  singleStockCeiling?: number; // e.g. 20
}

export interface RebalanceAnalysisResult {
  totalPortfolioValue: number;
  currency: "INR" | "USD";
  holdingsAnalysis: Array<{
    symbol: string;
    name: string;
    currentValue: number;
    currentWeightPct: number;
    targetWeightPct: number;
    driftPct: number;
    targetValue: number;
    requiredReallocationValue: number;
    actionType: "REDUCE" | "MAINTAIN" | "INCREASE";
  }>;
  concentrationRisk: {
    largestPositionSymbol: string;
    largestPositionWeightPct: number;
    singleStockCeilingPct: number;
    isOverConcentrated: boolean;
    excessWeightPct: number;
  };
  recommendations: string[];
  warnings: string[];
  advisoryText: string;
}

export class PortfolioRebalancingEngine {
  public static calculatePortfolioRebalance(
    holdings: RebalanceInputHolding[],
    targetAllocation?: TargetAllocation,
    riskProfile: string = "High"
  ): RebalanceAnalysisResult {
    if (!holdings || holdings.length === 0) {
      return {
        totalPortfolioValue: 0,
        currency: "INR",
        holdingsAnalysis: [],
        concentrationRisk: {
          largestPositionSymbol: "N/A",
          largestPositionWeightPct: 0,
          singleStockCeilingPct: 20,
          isOverConcentrated: false,
          excessWeightPct: 0
        },
        recommendations: ["No holdings available in portfolio. Add investments to calculate rebalancing drift."],
        warnings: ["Portfolio is empty."],
        advisoryText: "Your portfolio is currently empty. Add your investment holdings to analyze concentration risk and rebalancing options."
      };
    }

    // 1. Calculate Total Portfolio Valuation
    let totalPortfolioValue = 0;
    const computedHoldings = holdings.map((h: any) => {
      const val = parseFloat(h.value || h.val) || ((h.quantity || 0) * (h.currentPrice || 0));
      totalPortfolioValue += val;
      const symbol = h.symbol || h.ticker || "ASSET";
      return { ...h, symbol, val };
    });

    const safeTotalVal = Math.max(1, totalPortfolioValue);
    const targetCeiling = targetAllocation?.singleStockCeiling || 20.0;

    let largestSymbol = "";
    let largestWeight = 0;

    // 2. Compute Individual Holding Drift & Target Reallocations
    const defaultTargetWeight = 100 / Math.max(1, computedHoldings.length);

    const holdingsAnalysis = computedHoldings.map(h => {
      const currentWeightPct = (h.val / safeTotalVal) * 100;

      if (currentWeightPct > largestWeight) {
        largestWeight = currentWeightPct;
        largestSymbol = h.symbol;
      }

      const targetWeightPct = defaultTargetWeight;
      const driftPct = currentWeightPct - targetWeightPct;
      const targetValue = (targetWeightPct / 100) * safeTotalVal;
      const requiredReallocationValue = Math.abs(h.val - targetValue);

      let actionType: "REDUCE" | "MAINTAIN" | "INCREASE" = "MAINTAIN";
      if (driftPct > 5) actionType = "REDUCE";
      else if (driftPct < -5) actionType = "INCREASE";

      return {
        symbol: h.symbol,
        name: h.name || h.symbol,
        currentValue: h.val,
        currentWeightPct: parseFloat(currentWeightPct.toFixed(1)),
        targetWeightPct: parseFloat(targetWeightPct.toFixed(1)),
        driftPct: parseFloat(driftPct.toFixed(1)),
        targetValue: Math.round(targetValue),
        requiredReallocationValue: Math.round(requiredReallocationValue),
        actionType
      };
    });

    const isOverConcentrated = largestWeight > targetCeiling;
    const excessWeightPct = parseFloat(Math.max(0, largestWeight - targetCeiling).toFixed(1));

    // 3. Generate Decision-Support Advisory Recommendations
    const recommendations: string[] = [];
    const warnings: string[] = [];

    if (isOverConcentrated) {
      warnings.push(`High single-stock concentration detected in ${largestSymbol} (${largestWeight.toFixed(1)}% of total valuation vs ${targetCeiling}% limit).`);
      recommendations.push(`Consider directing future monthly savings contributions into underweighted asset classes to dilute ${largestSymbol} concentration without incurring capital gains tax.`);
      recommendations.push(`One option is to trim excess ${largestSymbol} position (${formatCurrency(Math.round(safeTotalVal * (excessWeightPct / 100)), "INR")}) gradually over a multi-month period.`);
    } else {
      recommendations.push("Portfolio single-stock concentration remains within acceptable risk limits.");
    }

    const advisoryText = `### PORTFOLIO REBALANCING ASSESSMENT

• **Total Valuation:** ${formatCurrency(totalPortfolioValue, "INR")}
• **Top Holding Concentration:** ${largestSymbol} at **${largestWeight.toFixed(1)}%** of portfolio
• **Target Single-Stock Limit:** ${targetCeiling.toFixed(1)}%
• **Concentration Drift:** ${isOverConcentrated ? `+${excessWeightPct}% excess concentration` : "Within limits"}

### RECOMMENDED OPTIONS TO CONSIDER

1. **New Savings Allocation Strategy:** Direct 100% of upcoming monthly investment contributions toward underweighted holdings.
2. **Systematic Rebalancing Tranches:** Evaluate a gradual trim of ${largestSymbol} to bring position weight toward your target limit.
3. **Asset Class Diversification:** Consider expanding into fixed-income or defensive index funds to buffer single-stock downside volatility.`;

    return {
      totalPortfolioValue,
      currency: "INR",
      holdingsAnalysis,
      concentrationRisk: {
        largestPositionSymbol: largestSymbol,
        largestPositionWeightPct: parseFloat(largestWeight.toFixed(1)),
        singleStockCeilingPct: targetCeiling,
        isOverConcentrated,
        excessWeightPct
      },
      recommendations,
      warnings,
      advisoryText
    };
  }
}
