export class PortfolioIntelligenceEngine {
  public static analyzePortfolio(userContext: any): any {
    const investments = userContext?.investments || [
      { ticker: "NVDA", name: "NVIDIA Corp", value: 30000 },
      { ticker: "AAPL", name: "Apple Inc", value: 40000 },
      { ticker: "BOND", name: "Fixed Income Fund", value: 30000 }
    ];

    const totalValue = investments.reduce((sum: number, item: any) => sum + (item.value || 0), 0);

    const holdingAnalysis = investments.map((item: any) => {
      const weightPct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
      return {
        ticker: item.ticker,
        name: item.name,
        value: item.value,
        weightPct: Number(weightPct.toFixed(1)),
        isConcentrated: weightPct > 25.0
      };
    });

    const highestConcentration = Math.max(...holdingAnalysis.map((h: any) => h.weightPct), 0);
    const healthScore = Math.max(30, Math.min(100, Math.round(100 - Math.max(0, highestConcentration - 25) * 1.5)));

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (holdingAnalysis.length >= 3) strengths.push("Holdings are distributed across multiple assets.");
    else weaknesses.push("Low asset count increase portfolio concentration risk.");

    if (highestConcentration > 25) {
      const concentratedAsset = holdingAnalysis.find((h: any) => h.weightPct === highestConcentration);
      weaknesses.push(`High single-asset exposure: ${concentratedAsset?.name || concentratedAsset?.ticker} is ${highestConcentration.toFixed(1)}% of portfolio.`);
    } else {
      strengths.push("No single asset exceeds the 25% concentration threshold.");
    }

    return {
      totalPortfolioValue: totalValue,
      portfolioHealthScore: healthScore,
      highestSingleExposurePct: highestConcentration,
      holdings: holdingAnalysis,
      strengths,
      weaknesses,
      recommendation: highestConcentration > 25
        ? "Consider rebalancing long-term allocation to keep individual position sizes under 20-25%."
        : "Portfolio allocation remains well-aligned with risk diversification guidelines."
    };
  }
}

export class PortfolioStressEngine {
  public static runStressTest(crashPercent: number = -20, userContext: any): any {
    const portfolio = PortfolioIntelligenceEngine.analyzePortfolio(userContext);
    const totalValue = portfolio.totalPortfolioValue;

    const drawdownAmount = Math.abs(totalValue * (crashPercent / 100));
    const postCrashValue = Math.max(0, totalValue - drawdownAmount);

    return {
      simulationLabel: "PORTFOLIO STRESS TEST (SIMULATION ONLY - NOT A PREDICTION)",
      crashScenario: `${crashPercent}% Market Decline`,
      baselinePortfolioValue: totalValue,
      postCrashPortfolioValue: postCrashValue,
      drawdownAmount,
      estimatedRecoveryMonths: Math.abs(crashPercent) * 0.8,
      impactSeverity: Math.abs(crashPercent) >= 30 ? "CRITICAL" : (Math.abs(crashPercent) >= 20 ? "HIGH" : "MEDIUM"),
      guidance: "Market stress tests evaluate downside tolerance. Maintain long-term perspective and avoid panic selling during short-term volatility."
    };
  }
}
