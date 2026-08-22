export interface CompanyEntity {
  symbol: string;
  name: string;
  exchange: "NASDAQ" | "NYSE" | "NSE" | "BSE" | "CRYPTO" | "INDEX";
  currency: "USD" | "INR";
  logoUrl?: string;
  domain: string;
  sector: string;
  industry?: string;
}

export const COMPANY_REGISTRY: Record<string, CompanyEntity> = {
  // US Equities
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NASDAQ",
    currency: "USD",
    domain: "nvidia.com",
    sector: "Technology",
    industry: "Semiconductors"
  },
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    currency: "USD",
    domain: "apple.com",
    sector: "Technology",
    industry: "Consumer Electronics"
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    exchange: "NASDAQ",
    currency: "USD",
    domain: "microsoft.com",
    sector: "Technology",
    industry: "Software & Cloud"
  },
  GOOGL: {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    exchange: "NASDAQ",
    currency: "USD",
    domain: "google.com",
    sector: "Communication Services",
    industry: "Internet Content"
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    exchange: "NASDAQ",
    currency: "USD",
    domain: "tesla.com",
    sector: "Consumer Cyclical",
    industry: "Automobiles"
  },

  // Indian Equities
  "RELIANCE.NS": {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries Ltd",
    exchange: "NSE",
    currency: "INR",
    domain: "ril.com",
    sector: "Energy",
    industry: "Oil & Gas / Retail / Telecom"
  },
  "TCS.NS": {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services",
    exchange: "NSE",
    currency: "INR",
    domain: "tcs.com",
    sector: "Technology",
    industry: "IT Services"
  },
  "INFY.NS": {
    symbol: "INFY.NS",
    name: "Infosys Ltd",
    exchange: "NSE",
    currency: "INR",
    domain: "infosys.com",
    sector: "Technology",
    industry: "IT Services"
  },
  "HDFCBANK.NS": {
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank Ltd",
    exchange: "NSE",
    currency: "INR",
    domain: "hdfcbank.com",
    sector: "Financial Services",
    industry: "Banking"
  },
  "ICICIBANK.NS": {
    symbol: "ICICIBANK.NS",
    name: "ICICI Bank Ltd",
    exchange: "NSE",
    currency: "INR",
    domain: "icicibank.com",
    sector: "Financial Services",
    industry: "Banking"
  },

  // Major Market Indices
  "^NSEI": {
    symbol: "^NSEI",
    name: "NIFTY 50 Index",
    exchange: "NSE",
    currency: "INR",
    domain: "niftyindices.com",
    sector: "Market Index",
    industry: "Benchmark Index"
  },
  "NIFTY 50": {
    symbol: "^NSEI",
    name: "NIFTY 50 Index",
    exchange: "NSE",
    currency: "INR",
    domain: "niftyindices.com",
    sector: "Market Index",
    industry: "Benchmark Index"
  },
  "NIFTY.NS": {
    symbol: "^NSEI",
    name: "NIFTY 50 Index",
    exchange: "NSE",
    currency: "INR",
    domain: "niftyindices.com",
    sector: "Market Index",
    industry: "Benchmark Index"
  },
  "^BSESN": {
    symbol: "^BSESN",
    name: "BSE SENSEX Index",
    exchange: "BSE",
    currency: "INR",
    domain: "bseindia.com",
    sector: "Market Index",
    industry: "Benchmark Index"
  },
  "SENSEX": {
    symbol: "^BSESN",
    name: "BSE SENSEX Index",
    exchange: "BSE",
    currency: "INR",
    domain: "bseindia.com",
    sector: "Market Index",
    industry: "Benchmark Index"
  }
};

export function lookupCompanyEntity(query: string): CompanyEntity | null {
  if (!query) return null;
  const clean = query.trim().toUpperCase();

  // Direct symbol lookup
  if (COMPANY_REGISTRY[clean]) return COMPANY_REGISTRY[clean];

  // Try stripping .NS
  const baseSymbol = clean.replace(/\.NS$/, '');
  if (COMPANY_REGISTRY[baseSymbol]) return COMPANY_REGISTRY[baseSymbol];

  // Search by name match
  for (const entity of Object.values(COMPANY_REGISTRY)) {
    if (entity.name.toUpperCase().includes(clean) || entity.symbol.toUpperCase().includes(clean)) {
      return entity;
    }
  }

  return null;
}
