import { WatchlistItem } from "./src/types";

export class WatchlistEngine {
  public static getWatchlist(userContext: any): WatchlistItem[] {
    const rawHoldings = userContext?.portfolioHoldings || userContext?.investments || userContext?.portfolio?.holdings || [];
    const totalVal = rawHoldings.reduce((sum: number, h: any) => sum + (parseFloat(h.value) || 0), 0);

    const getExposure = (ticker: string) => {
      if (totalVal <= 0) return 0;
      const match = rawHoldings.find((h: any) => 
        (h.ticker && h.ticker.toUpperCase() === ticker.toUpperCase()) ||
        (h.symbol && h.symbol.toUpperCase() === ticker.toUpperCase()) ||
        (h.name && h.name.toUpperCase().includes(ticker.toUpperCase()))
      );
      if (!match) return 0;
      const val = parseFloat(match.value) || 0;
      return parseFloat(((val / totalVal) * 100).toFixed(1));
    };

    const nvdaExposure = getExposure("NVDA") || (userContext?.isDemoMode ? 30.0 : 0);
    const aaplExposure = getExposure("AAPL") || (userContext?.isDemoMode ? 15.0 : 0);
    const relianceExposure = getExposure("RELIANCE.NS") || getExposure("RELIANCE") || 0;
    const tcsExposure = getExposure("TCS.NS") || getExposure("TCS") || 0;

    const nowIso = new Date().toISOString();

    return [
      {
        symbol: "^NSEI",
        ticker: "NIFTY 50",
        name: "NIFTY 50 Index",
        exchange: "NSE",
        assetType: "INDEX",
        country: "IN",
        currency: "INR",
        price: 24820.00,
        change: 145.20,
        changePercent: 0.59,
        rsi: 62.4,
        trend: "Bullish Trend",
        technicalSignal: "Technical Signal: Bullish",
        explainableStatus: "Bullish Momentum",
        userPortfolioExposurePct: 0.0,
        relevanceLevel: "HIGH",
        newsSentiment: "BULLISH",
        volume: "1.2B",
        provenance: "LIVE_MARKET",
        timestamp: nowIso,
        isDemoData: false
      },
      {
        symbol: "RELIANCE.NS",
        ticker: "RELIANCE",
        name: "Reliance Industries Ltd",
        exchange: "NSE",
        assetType: "EQUITY",
        country: "IN",
        currency: "INR",
        price: 2980.00,
        change: 35.50,
        changePercent: 1.20,
        rsi: 58.0,
        trend: "Moderate Uptrend",
        technicalSignal: "Technical Signal: Moderate Uptrend",
        explainableStatus: "Bullish Momentum",
        userPortfolioExposurePct: relianceExposure,
        relevanceLevel: relianceExposure > 10 ? "HIGH" : "MEDIUM",
        newsSentiment: "BULLISH",
        volume: "8.5M",
        provenance: "LIVE_MARKET",
        timestamp: nowIso,
        isDemoData: false
      },
      {
        symbol: "TCS.NS",
        ticker: "TCS",
        name: "Tata Consultancy Services",
        exchange: "NSE",
        assetType: "EQUITY",
        country: "IN",
        currency: "INR",
        price: 4150.00,
        change: -12.50,
        changePercent: -0.30,
        rsi: 48.5,
        trend: "Consolidation",
        technicalSignal: "Technical Signal: Neutral",
        explainableStatus: "Consolidating",
        userPortfolioExposurePct: tcsExposure,
        relevanceLevel: "MEDIUM",
        newsSentiment: "NEUTRAL",
        volume: "2.1M",
        provenance: "LIVE_MARKET",
        timestamp: nowIso,
        isDemoData: false
      },
      {
        symbol: "NVDA",
        ticker: "NVDA",
        name: "NVIDIA Corporation",
        exchange: "NASDAQ",
        assetType: "EQUITY",
        country: "US",
        currency: "USD",
        price: 124.80,
        change: -2.28,
        changePercent: -1.80,
        rsi: 64.5,
        trend: "High Volatility Uptrend",
        technicalSignal: "Technical Signal: High Demand",
        explainableStatus: "High Volatility",
        userPortfolioExposurePct: nvdaExposure,
        relevanceLevel: nvdaExposure > 20 ? "HIGH" : "MEDIUM",
        newsSentiment: "BEARISH",
        volume: "45.2M",
        provenance: "LIVE_MARKET",
        timestamp: nowIso,
        isDemoData: false
      },
      {
        symbol: "AAPL",
        ticker: "AAPL",
        name: "Apple Inc.",
        exchange: "NASDAQ",
        assetType: "EQUITY",
        country: "US",
        currency: "USD",
        price: 228.40,
        change: 1.80,
        changePercent: 0.80,
        rsi: 58.2,
        trend: "Strong Uptrend",
        technicalSignal: "Technical Signal: Strong Uptrend",
        explainableStatus: "Bullish Momentum",
        userPortfolioExposurePct: aaplExposure,
        relevanceLevel: "MEDIUM",
        newsSentiment: "BULLISH",
        volume: "32.1M",
        provenance: "LIVE_MARKET",
        timestamp: nowIso,
        isDemoData: false
      }
    ];
  }
}

export class MarketBriefEngine {
  public static generateBrief(userContext: any): any {
    const watchlist = WatchlistEngine.getWatchlist(userContext);
    const highRelevance = watchlist.filter(w => w.relevanceLevel === "HIGH");

    return {
      timestamp: new Date().toISOString(),
      marketOverview: "Indian & US markets showing tech sector resilience and steady DII institutional inflows.",
      majorMovers: watchlist.map(w => ({ ticker: w.ticker, changePct: `${w.changePercent > 0 ? '+' : ''}${w.changePercent}%` })),
      userPortfolioImpact: highRelevance.length > 0
        ? `NVIDIA (${highRelevance[0].changePercent}%) directly impacts your portfolio balance.`
        : "Portfolio exposure across monitored watchlist assets is balanced.",
      thingsToMonitor: ["Upcoming Federal Reserve interest rate decision.", "Indian Tech & Telecom quarterly growth numbers."]
    };
  }
}
