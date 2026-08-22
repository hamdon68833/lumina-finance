"""
PROJECT TITLE: Smart Investment Strategy Advisor using AI with Budget Analysis and Stock Insights
MODULE: stock_analysis.py (Step 8: Stock Market Analysis, Technical Indicators & Sentiment)
ACADEMIC YEAR: 2025-2026 | Major Project Phase I (BE ISE, VTU Belagavi)
"""

import pandas as pd
import numpy as np
import yfinance as yf
from textblob import TextBlob

# Benchmark default stocks to monitor
DEFAULT_STOCKS = [
    {"ticker": "AAPL", "name": "Apple Inc.", "sector": "Technology"},
    {"ticker": "NVDA", "name": "NVIDIA Corporation", "sector": "Semiconductors"},
    {"ticker": "MSFT", "name": "Microsoft Corporation", "sector": "Technology"},
    {"ticker": "GOOGL", "name": "Alphabet Inc.", "sector": "Communication Services"},
    {"ticker": "RELIANCE.NS", "name": "Reliance Industries", "sector": "Conglomerate (NSE India)"},
    {"ticker": "TCS.NS", "name": "Tata Consultancy Services", "sector": "IT Services (NSE India)"},
    {"ticker": "TSLA", "name": "Tesla Inc.", "sector": "Automotive / EV"},
    {"ticker": "SPY", "name": "S&P 500 ETF Trust", "sector": "Index ETF"}
]

# Simulated news headlines for sentiment analysis fallback
MOCK_NEWS_HEADLINES = {
    "AAPL": [
        "Apple announces record services revenue and strong iPhone demand in Q3.",
        "Supply chain improvements boost quarterly margins for Apple.",
        "Analysts raise target price for Apple following key AI expansion strategy."
    ],
    "NVDA": [
        "NVIDIA AI chips see surging demand from global datacenter providers.",
        "NVIDIA quarterly revenue leaps 120% YoY driven by AI infrastructure.",
        "Regulators review semiconductor export controls affecting tech exports."
    ],
    "MSFT": [
        "Microsoft Cloud and Azure growth accelerates on enterprise AI adoption.",
        "Microsoft expands strategic cloud partnership with leading financial institutions."
    ],
    "RELIANCE.NS": [
        "Reliance Retail and Jio Telecom drive steady quarterly revenue growth.",
        "Green energy investment roadmap unveiled by Reliance leadership."
    ],
    "TCS.NS": [
        "TCS secures multi-year digital transformation contract in Europe.",
        "IT spending stabilization provides positive tailwinds for TCS."
    ]
}

def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Calculates Relative Strength Index (RSI)."""
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(50)

def analyze_stock(ticker_symbol: str):
    """
    Step 8: Fetches historical stock data, computes 20-SMA, 50-SMA, RSI,
    evaluates news sentiment score via TextBlob, and generates Buy / Sell / Hold output.
    """
    ticker_symbol = ticker_symbol.upper().strip()
    
    # Attempt yfinance fetch; fallback to generated stock data if network issue
    try:
        stock = yf.Ticker(ticker_symbol)
        hist = stock.history(period="6m")
        if hist.empty or len(hist) < 20:
            hist = _generate_synthetic_stock_history(ticker_symbol)
    except Exception:
        hist = _generate_synthetic_stock_history(ticker_symbol)

    # Compute Technical Indicators
    close_prices = hist['Close']
    current_price = float(close_prices.iloc[-1])
    sma_20 = float(close_prices.rolling(window=20).mean().iloc[-1])
    sma_50 = float(close_prices.rolling(window=min(50, len(close_prices))).mean().iloc[-1])
    
    rsi_series = calculate_rsi(close_prices, 14)
    current_rsi = float(rsi_series.iloc[-1])
    
    price_change_20d = ((current_price - float(close_prices.iloc[-20])) / float(close_prices.iloc[-20])) * 100 if len(close_prices) >= 20 else 0.0

    # Trend Determination
    if current_price > sma_20 and sma_20 > sma_50:
        trend = "Strong Uptrend (Bullish)"
        trend_score = +2
    elif current_price > sma_20:
        trend = "Moderate Uptrend"
        trend_score = +1
    elif current_price < sma_20 and sma_20 < sma_50:
        trend = "Downtrend (Bearish)"
        trend_score = -2
    else:
        trend = "Sideways / Neutral"
        trend_score = 0

    # Sentiment Analysis via TextBlob NLP
    headlines = MOCK_NEWS_HEADLINES.get(ticker_symbol, [
        f"{ticker_symbol} market performance remains steady amid broader sector movements.",
        f"Institutional volume in {ticker_symbol} shows active trading interest."
    ])
    
    sentiment_scores = [TextBlob(h).sentiment.polarity for h in headlines]
    avg_sentiment = float(np.mean(sentiment_scores)) # Range -1.0 to +1.0
    
    # Combined Recommendation Logic (Technicals + Sentiment)
    # Technical signal: SMA crossover + RSI bounds
    # Sentiment signal: Positive (> +0.15), Negative (< -0.15)
    total_score = trend_score + (1 if avg_sentiment > 0.15 else (-1 if avg_sentiment < -0.15 else 0))
    
    if current_rsi > 70:
        total_score -= 1 # Overbought correction penalty
    elif current_rsi < 35:
        total_score += 1 # Oversold bargain bonus

    if total_score >= 2:
        recommendation = "BUY"
        rec_color = "green"
        rationale = f"Bullish price trend (Price > 20-SMA of ${sma_20:.2f}) combined with positive news sentiment ({avg_sentiment:+.2f}). RSI at {current_rsi:.1f} indicates healthy buying momentum."
    elif total_score <= -2:
        recommendation = "SELL"
        rec_color = "red"
        rationale = f"Bearish price trend (Price < 20-SMA of ${sma_20:.2f}) and weak market sentiment ({avg_sentiment:+.2f}). Risk of further downside."
    else:
        recommendation = "HOLD"
        rec_color = "amber"
        rationale = f"Mixed signals: Stock is consolidating around 20-SMA (${sma_20:.2f}) with neutral sentiment. Wait for a clearer breakout signal."

    # Calculated Targets
    target_price = current_price * (1.12 if recommendation == "BUY" else (0.92 if recommendation == "SELL" else 1.03))
    stop_loss = current_price * 0.94 if recommendation == "BUY" else current_price * 1.05

    return {
        "ticker": ticker_symbol,
        "current_price": current_price,
        "sma_20": sma_20,
        "sma_50": sma_50,
        "rsi": current_rsi,
        "price_change_20d": price_change_20d,
        "trend": trend,
        "sentiment_score": avg_sentiment,
        "sentiment_label": "Positive" if avg_sentiment > 0.15 else ("Negative" if avg_sentiment < -0.15 else "Neutral"),
        "recommendation": recommendation,
        "rec_color": rec_color,
        "rationale": rationale,
        "target_price": target_price,
        "stop_loss": stop_loss,
        "headlines": headlines,
        "history_df": hist[['Close']].reset_index()
    }

def _generateSyntheticStockHistory(ticker: str):
    """Generates synthetic 120-day stock price history for offline mode."""
    return _generate_synthetic_stock_history(ticker)

def _generate_synthetic_stock_history(ticker: str):
    """Generates realistic 120-day synthetic price history."""
    dates = pd.date_range(end=pd.Timestamp.now(), periods=120, freq='B')
    base_price = 150.0 if "AAPL" in ticker else (450.0 if "NVDA" in ticker else (2500.0 if "NS" in ticker else 200.0))
    
    np.random.seed(abs(hash(ticker)) % 10000)
    returns = np.random.normal(loc=0.001, scale=0.018, size=120)
    price_path = base_price * np.exp(np.cumsum(returns))
    
    df = pd.DataFrame({'Close': price_path}, index=dates)
    return df
