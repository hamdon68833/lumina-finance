import { AlertSeverity, AlertType } from "./alert_rules";

export interface DetectedEvent {
  eventType: AlertType;
  eventSubtype: string;
  ticker?: string;
  title: string;
  summary: string;
  reason: string;
  rawSeverity: AlertSeverity;
  calculations: Record<string, any>;
  recommendations: string[];
  warnings: string[];
  dedupKey: string;
  source: string;
  isLiveData: boolean;
  isDemoData?: boolean;
}

export class MarketEventDetector {
  public static detect(marketDataList: any[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];

    for (const m of marketDataList) {
      if (!m || !m.ticker) continue;

      const priceChangePct = m.changePercent !== undefined ? m.changePercent : 0;
      const absChange = Math.abs(priceChangePct);

      // 1. Large Price Movement (> 5%)
      if (absChange >= 5.0) {
        const severity: AlertSeverity = absChange >= 10.0 ? "CRITICAL" : absChange >= 7.0 ? "HIGH" : "MEDIUM";
        const direction = priceChangePct < 0 ? "dropped" : "surged";

        events.push({
          eventType: "MARKET",
          eventSubtype: "LARGE_PRICE_MOVEMENT",
          ticker: m.ticker,
          title: `${m.name || m.ticker} ${direction} ${absChange.toFixed(1)}% today`,
          summary: `${m.name || m.ticker} (${m.ticker}) experienced a significant price movement of ${priceChangePct > 0 ? "+" : ""}${priceChangePct.toFixed(1)}% today.`,
          reason: `Market price moved by ${priceChangePct.toFixed(1)}%, exceeding the 5.0% threshold for market volatility alerts.`,
          rawSeverity: severity,
          calculations: {
            ticker: m.ticker,
            currentPrice: m.currentPrice || m.price || 0,
            changePercent: priceChangePct,
            rsi: m.rsi || 50,
            sma20: m.sma20 || 0,
            sma50: m.sma50 || 0
          },
          recommendations: [
            `Review your exposure to ${m.ticker} before taking additional positions.`,
            "Evaluate whether your portfolio risk parameters match current market volatility."
          ],
          warnings: [
            `Significant short-term price volatility detected for ${m.ticker}.`
          ],
          dedupKey: `MARKET:${m.ticker}:PRICE_DROP`,
          source: m.isDemoData ? "Lumina Demo Market Provider" : "Live Market Feed",
          isLiveData: !m.isDemoData,
          isDemoData: Boolean(m.isDemoData)
        });
      }

      // 2. RSI Extreme (< 30 Oversold or > 70 Overbought)
      if (m.rsi && (m.rsi <= 30 || m.rsi >= 70)) {
        const status = m.rsi <= 30 ? "Oversold" : "Overbought";
        events.push({
          eventType: "MARKET",
          eventSubtype: "RSI_EXTREME",
          ticker: m.ticker,
          title: `${m.ticker} Technical RSI Extreme (${status}: ${m.rsi.toFixed(1)})`,
          summary: `${m.name || m.ticker} RSI index reached ${m.rsi.toFixed(1)}, indicating technical ${status.toLowerCase()} conditions.`,
          reason: `Technical analysis indicator RSI (${m.rsi.toFixed(1)}) breached extreme boundary (30/70).`,
          rawSeverity: "LOW",
          calculations: {
            ticker: m.ticker,
            rsi: m.rsi,
            currentPrice: m.currentPrice || m.price || 0
          },
          recommendations: [
            `Monitor technical indicators for potential trend reversal.`
          ],
          warnings: [],
          dedupKey: `MARKET:${m.ticker}:RSI_EXTREME`,
          source: m.isDemoData ? "Lumina Demo Market Provider" : "Live Market Feed",
          isLiveData: !m.isDemoData,
          isDemoData: Boolean(m.isDemoData)
        });
      }
    }

    return events;
  }
}

export class PortfolioRiskDetector {
  public static detect(userContext: any): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    const investments = userContext.investments || userContext.stocks || [];
    const totalAssets = userContext.totalNetWorth || userContext.totalInvestments || 1;

    // Check Single Stock Concentration (> 25% of total portfolio)
    for (const inv of investments) {
      const value = inv.value || (inv.allocationPercent ? (inv.allocationPercent / 100) * totalAssets : 0);
      const pct = (value / totalAssets) * 100;

      if (pct >= 25.0) {
        events.push({
          eventType: "PORTFOLIO",
          eventSubtype: "SINGLE_ASSET_CONCENTRATION",
          ticker: inv.ticker || inv.name,
          title: `High Concentration in ${inv.name || inv.ticker} (${pct.toFixed(1)}%)`,
          summary: `Single asset ${inv.name || inv.ticker} accounts for ${pct.toFixed(1)}% of your total liquid portfolio.`,
          reason: `Asset concentration exceeds recommended 20% single-asset diversification limit.`,
          rawSeverity: pct >= 40.0 ? "HIGH" : "MEDIUM",
          calculations: {
            assetName: inv.name || inv.ticker,
            assetValue: value,
            totalPortfolioValue: totalAssets,
            concentrationPercent: pct
          },
          recommendations: [
            "Consider reviewing asset allocation to reduce single-asset concentration risk.",
            "Evaluate rebalancing profits into broader index funds or under-allocated asset classes."
          ],
          warnings: [
            "High asset concentration increases portfolio volatility during single-stock pullbacks."
          ],
          dedupKey: `PORTFOLIO:CONCENTRATION:${inv.ticker || inv.name}`,
          source: "Lumina Risk Engine",
          isLiveData: true
        });
      }
    }

    return events;
  }
}

export class PortfolioDriftDetector {
  public static detect(userContext: any): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    
    // Target vs Current Equity Allocation
    const targetEquity = userContext.targetEquityPct ?? 60.0;
    const currentEquity = userContext.currentEquityPct ?? 72.0;
    const drift = currentEquity - targetEquity;

    if (Math.abs(drift) >= 10.0) {
      const direction = drift > 0 ? "above" : "below";
      events.push({
        eventType: "PORTFOLIO",
        eventSubtype: "ALLOCATION_DRIFT",
        title: `Portfolio Allocation Drift (${Math.abs(drift).toFixed(1)}% ${direction} target)`,
        summary: `Your current equity allocation is ${currentEquity.toFixed(1)}%, which is ${Math.abs(drift).toFixed(1)} percentage points ${direction} your configured target of ${targetEquity.toFixed(1)}%.`,
        reason: `Portfolio allocation drift exceeds the 10.0% rebalancing threshold.`,
        rawSeverity: Math.abs(drift) >= 15.0 ? "HIGH" : "MEDIUM",
        calculations: {
          targetEquityPct: targetEquity,
          currentEquityPct: currentEquity,
          driftPercentagePoints: drift
        },
        recommendations: [
          `Consider evaluating a portfolio rebalancing strategy to realign equity to ${targetEquity.toFixed(1)}%.`,
          "Review whether your risk tolerance has changed or if profit rebalancing is appropriate."
        ],
        warnings: [
          drift > 0 ? "Over-allocation to equities may expose your portfolio to unexpected market volatility." : "Under-allocation to equities may reduce long-term growth velocity."
        ],
        dedupKey: `PORTFOLIO:EQUITY_DRIFT`,
        source: "Lumina Portfolio Optimizer",
        isLiveData: true
      });
    }

    return events;
  }
}

export class EmergencyFundDetector {
  public static detect(userContext: any): DetectedEvent[] {
    const events: DetectedEvent[] = [];

    const monthlyExpenses = userContext.monthlyExpenses || userContext.expenses || 3000;
    const liquidSavings = userContext.emergencyFund || userContext.savings || userContext.liquidSavings || 0;
    const monthsCovered = monthlyExpenses > 0 ? liquidSavings / monthlyExpenses : 0;

    if (monthsCovered < 3.0) {
      events.push({
        eventType: "EMERGENCY_FUND",
        eventSubtype: "CRITICAL_SAFETY_RESERVE",
        title: `CRITICAL — Emergency Safety Reserve (${monthsCovered.toFixed(1)} months)`,
        summary: `Your liquid emergency fund covers ${monthsCovered.toFixed(1)} months of expenses, which is below the recommended 6.0-month safety threshold.`,
        reason: `Liquid emergency reserve is under the 3.0-month critical safety limit.`,
        rawSeverity: "CRITICAL",
        calculations: {
          monthlyExpenses,
          liquidSavings,
          monthsCovered,
          targetMonths: 6.0,
          shortfall: (6.0 - monthsCovered) * monthlyExpenses
        },
        recommendations: [
          "Prioritize building liquid cash reserves before making high-risk discretionary investments.",
          `Allocate surplus monthly cash flow to build a 6-month buffer of $${((6.0 - monthsCovered) * monthlyExpenses).toLocaleString()}.`
        ],
        warnings: [
          "Low emergency reserves expose your long-term investments to forced liquidation during unexpected events."
        ],
        dedupKey: `EMERGENCY_FUND:CRITICAL_LOW`,
        source: "Lumina Safety Guardrail Engine",
        isLiveData: true
      });
    } else if (monthsCovered < 6.0) {
      events.push({
        eventType: "EMERGENCY_FUND",
        eventSubtype: "MODERATE_SAFETY_RESERVE",
        title: `Emergency Fund Below 6-Month Target (${monthsCovered.toFixed(1)} months)`,
        summary: `Your emergency coverage stands at ${monthsCovered.toFixed(1)} months. You are on track but ${((6.0 - monthsCovered) * monthlyExpenses).toLocaleString()} away from full safety reserves.`,
        reason: `Emergency coverage is between 3.0 and 6.0 months.`,
        rawSeverity: "MEDIUM",
        calculations: {
          monthlyExpenses,
          liquidSavings,
          monthsCovered,
          targetMonths: 6.0
        },
        recommendations: [
          "Continue allocating monthly savings toward the 6-month liquid reserve target."
        ],
        warnings: [],
        dedupKey: `EMERGENCY_FUND:MODERATE_LOW`,
        source: "Lumina Safety Guardrail Engine",
        isLiveData: true
      });
    }

    return events;
  }
}

export class GoalProgressDetector {
  public static detect(userContext: any): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    const goals = userContext.goals || [];

    for (const g of goals) {
      if (!g || !g.targetAmount) continue;

      const currentAmount = g.currentAmount || 0;
      const targetAmount = g.targetAmount;
      const targetMonths = g.targetMonths || 24;
      const monthlyContribution = g.monthlyContribution || userContext.monthlySavings || 500;

      const projectedMonths = monthlyContribution > 0 ? (targetAmount - currentAmount) / monthlyContribution : 999;
      const delayMonths = projectedMonths - targetMonths;

      if (delayMonths >= 3) {
        events.push({
          eventType: "GOAL",
          eventSubtype: "GOAL_PROGRESS_DELAY",
          title: `Goal Delay Alert: ${g.name || 'Financial Goal'} (Behind by ${Math.round(delayMonths)} months)`,
          summary: `Projected completion for ${g.name || 'your goal'} is ${Math.round(projectedMonths)} months away, which is ${Math.round(delayMonths)} months behind your target date.`,
          reason: `Current monthly contribution ($${monthlyContribution}/mo) is insufficient to reach $${targetAmount.toLocaleString()} in ${targetMonths} months.`,
          rawSeverity: delayMonths >= 6 ? "HIGH" : "MEDIUM",
          calculations: {
            goalName: g.name || 'Financial Goal',
            targetAmount,
            currentAmount,
            monthlyContribution,
            targetMonths,
            projectedMonths: Math.round(projectedMonths),
            delayMonths: Math.round(delayMonths),
            additionalMonthlyNeeded: Math.round(((targetAmount - currentAmount) / targetMonths) - monthlyContribution)
          },
          recommendations: [
            `Increase monthly goal contribution by +$${Math.round(((targetAmount - currentAmount) / targetMonths) - monthlyContribution)}/mo to stay on track.`,
            "Review non-essential monthly expenses to boost goal allocation."
          ],
          warnings: [
            "At current savings velocity, target goal date will be missed."
          ],
          dedupKey: `GOAL:DELAY:${g.name || 'DEFAULT'}`,
          source: "Lumina Goal Engine",
          isLiveData: true
        });
      }
    }

    return events;
  }
}

export class BudgetAnomalyDetector {
  public static detect(userContext: any): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    const expenses = userContext.expensesBreakdown || userContext.expenseCategories || {};
    const historicalBaseline = userContext.historicalExpenses || {};

    for (const category of Object.keys(expenses)) {
      const current = expenses[category];
      const baseline = historicalBaseline[category];

      if (baseline && baseline > 0) {
        const increasePct = ((current - baseline) / baseline) * 100;
        if (increasePct >= 25.0) {
          events.push({
            eventType: "BUDGET",
            eventSubtype: "EXPENSE_CATEGORY_SPIKE",
            title: `Budget Spike Alert: ${category} Spending +${increasePct.toFixed(0)}%`,
            summary: `Spending on ${category} reached $${current.toLocaleString()} this month, representing a ${increasePct.toFixed(0)}% increase compared with your previous baseline ($${baseline.toLocaleString()}).`,
            reason: `Category expense increase exceeded the 25% anomaly threshold.`,
            rawSeverity: increasePct >= 50.0 ? "HIGH" : "MEDIUM",
            calculations: {
              category,
              currentSpending: current,
              baselineSpending: baseline,
              increasePct: Math.round(increasePct)
            },
            recommendations: [
              `Review detailed ${category} transactions to identify non-recurring items.`,
              "Adjust upcoming monthly discretionary budget limits."
            ],
            warnings: [
              "Category spending spikes directly diminish monthly net savings capacity."
            ],
            dedupKey: `BUDGET:SPIKE:${category}`,
            source: "Lumina Expense Intelligence",
            isLiveData: true
          });
        }
      }
    }

    return events;
  }
}

export class DebtAlertDetector {
  public static detect(userContext: any): DetectedEvent[] {
    const events: DetectedEvent[] = [];

    const monthlyIncome = userContext.monthlyIncome || userContext.income || 5000;
    const totalDebt = userContext.totalDebt || userContext.debt || 0;
    const monthlyEMI = userContext.monthlyEMI || userContext.emi || 0;

    const dtiRatio = monthlyIncome > 0 ? (monthlyEMI / monthlyIncome) * 100 : 0;

    if (dtiRatio >= 40.0) {
      events.push({
        eventType: "DEBT",
        eventSubtype: "HIGH_DTI_BURDEN",
        title: `High Debt-To-Income (DTI) Ratio Alert (${dtiRatio.toFixed(1)}%)`,
        summary: `Your monthly EMI debt obligations consume ${dtiRatio.toFixed(1)}% of your gross monthly income, exceeding the safe 40.0% benchmark.`,
        reason: `DTI ratio is above the 40% financial health safety limit.`,
        rawSeverity: dtiRatio >= 50.0 ? "HIGH" : "MEDIUM",
        calculations: {
          monthlyIncome,
          totalDebt,
          monthlyEMI,
          dtiRatio: dtiRatio.toFixed(1)
        },
        recommendations: [
          "Prioritize paying down high-interest debt aggressively using the debt avalanche method.",
          "Avoid taking on new loan commitments until DTI falls below 35%."
        ],
        warnings: [
          "High EMI obligations constrain cash flow flexibility."
        ],
        dedupKey: `DEBT:HIGH_DTI`,
        source: "Lumina Debt Analyzer",
        isLiveData: true
      });
    }

    return events;
  }
}

export class InvestmentOpportunityDetector {
  public static detect(userContext: any): DetectedEvent[] {
    const events: DetectedEvent[] = [];

    const currentGoldPct = userContext.currentGoldPct ?? 3.0;
    const targetGoldPct = userContext.targetGoldPct ?? 8.0;

    if (targetGoldPct - currentGoldPct >= 4.0) {
      events.push({
        eventType: "OPPORTUNITY",
        eventSubtype: "ASSET_UNDER_ALLOCATION",
        title: `Potential Portfolio Allocation Opportunity (Gold Target Gap)`,
        summary: `Your gold allocation is currently ${currentGoldPct.toFixed(1)}%, which is below your configured target of ${targetGoldPct.toFixed(1)}%. Review whether rebalancing is appropriate.`,
        reason: `Asset class allocation is more than 4% below designated target.`,
        rawSeverity: "LOW",
        calculations: {
          assetClass: "Gold / Precious Metals",
          currentPct: currentGoldPct,
          targetPct: targetGoldPct,
          gapPct: targetGoldPct - currentGoldPct
        },
        recommendations: [
          "Review whether rebalancing cash reserves into inflation-hedging assets aligns with your risk tolerance.",
          "Evaluate gradual dollar-cost averaging into under-allocated asset classes."
        ],
        warnings: [],
        dedupKey: `OPPORTUNITY:UNDER_ALLOCATION:GOLD`,
        source: "Lumina Opportunity Scanner",
        isLiveData: true
      });
    }

    return events;
  }
}
