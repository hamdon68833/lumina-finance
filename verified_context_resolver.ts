export type ProvenanceSource =
  | "USER_PROFILE"
  | "DOCUMENT_CONFIRMED"
  | "CALCULATED"
  | "LIVE_MARKET"
  | "LIVE_WEB"
  | "UNAVAILABLE"
  | "DEMO_MODE";

export interface ProvenanceValue<T> {
  value: T | null;
  currency: "INR" | "USD";
  source: ProvenanceSource;
  confidence?: number;
  lastUpdated?: string;
}

export interface VerifiedFinancialContext {
  userId: string;
  isDemoMode: boolean;
  hasStoredProfile: boolean;
  hasVerifiedProfile: boolean;

  // Provenance Tagged Metrics
  income: ProvenanceValue<number>;
  expenses: ProvenanceValue<number>;
  savings: ProvenanceValue<number>;
  monthlyIncome: ProvenanceValue<number>;
  monthlyExpenses: ProvenanceValue<number>;
  monthlySavings: ProvenanceValue<number>;
  liquidCash: ProvenanceValue<number>;
  emergencyFund: ProvenanceValue<number>;
  age: ProvenanceValue<number>;
  riskPreference: ProvenanceValue<string>;
  riskScore: ProvenanceValue<number>;

  // Collections
  goals: Array<any>;
  portfolioHoldings: Array<any>;
  debts: Array<any>;
  transactions: Array<any>;
  documentExtractedFields: Record<string, any>;
}

/**
 * Server-side Verified Financial Context Resolver
 */
export class VerifiedContextResolver {
  public static getVerifiedFinancialContext(
    userId: string = "default_user",
    rawUserData?: any,
    isDemoMode: boolean = false
  ): VerifiedFinancialContext {
    const hasData = Boolean(
      rawUserData &&
        (rawUserData.income > 0 ||
          rawUserData.expenses > 0 ||
          (rawUserData.investments && rawUserData.investments.length > 0) ||
          (rawUserData.goals && rawUserData.goals.length > 0))
    );

    // DEMO MODE EXPLICIT TOGGLE
    if (isDemoMode) {
      const inc = rawUserData?.income || 65000;
      const exp = rawUserData?.expenses || 38000;
      const savings = inc - exp;
      const incObj = { value: inc, currency: "INR" as const, source: "DEMO_MODE" as const };
      const expObj = { value: exp, currency: "INR" as const, source: "DEMO_MODE" as const };
      const savObj = { value: savings, currency: "INR" as const, source: "DEMO_MODE" as const };

      return {
        userId,
        isDemoMode: true,
        hasStoredProfile: true,
        hasVerifiedProfile: true,
        income: incObj,
        expenses: expObj,
        savings: savObj,
        monthlyIncome: incObj,
        monthlyExpenses: expObj,
        monthlySavings: savObj,
        liquidCash: { value: rawUserData?.savings || 180000, currency: "INR", source: "DEMO_MODE" },
        emergencyFund: { value: rawUserData?.currentLiquidReserve || 180000, currency: "INR", source: "DEMO_MODE" },
        age: { value: rawUserData?.age || 28, currency: "INR", source: "DEMO_MODE" },
        riskPreference: { value: rawUserData?.riskPreference || "High", currency: "INR", source: "DEMO_MODE" },
        riskScore: { value: rawUserData?.riskScore || 72, currency: "INR", source: "DEMO_MODE" },
        goals: rawUserData?.goals || [
          { id: "g1", name: "House Downpayment Goal", targetAmount: 1500000, currentSavings: 300000, monthsLeft: 36 }
        ],
        portfolioHoldings: rawUserData?.investments || [
          { ticker: "NVDA", name: "NVIDIA Corp", value: 300000, quantity: 10, currentPrice: 124.8, buyPrice: 110, currency: "USD", exchange: "NASDAQ", sector: "Technology" },
          { ticker: "AAPL", name: "Apple Inc", value: 150000, quantity: 5, currentPrice: 228.4, buyPrice: 200, currency: "USD", exchange: "NASDAQ", sector: "Technology" }
        ],
        debts: rawUserData?.debts || [],
        transactions: rawUserData?.transactions || [],
        documentExtractedFields: {}
      };
    }

    // REAL USER DATA SOURCE
    if (hasData) {
      const inc = rawUserData.income ? parseFloat(rawUserData.income) : null;
      const exp = rawUserData.expenses ? parseFloat(rawUserData.expenses) : null;
      const savings = inc !== null && exp !== null ? Math.max(0, inc - exp) : null;

      const incObj = {
        value: inc,
        currency: "INR" as const,
        source: rawUserData.incomeFromDoc ? ("DOCUMENT_CONFIRMED" as const) : ("USER_PROFILE" as const)
      };
      const expObj = {
        value: exp,
        currency: "INR" as const,
        source: rawUserData.expensesFromDoc ? ("DOCUMENT_CONFIRMED" as const) : ("USER_PROFILE" as const)
      };
      const savObj = {
        value: savings,
        currency: "INR" as const,
        source: "CALCULATED" as const
      };

      return {
        userId,
        isDemoMode: false,
        hasStoredProfile: true,
        hasVerifiedProfile: true,
        income: incObj,
        expenses: expObj,
        savings: savObj,
        monthlyIncome: incObj,
        monthlyExpenses: expObj,
        monthlySavings: savObj,
        liquidCash: {
          value: rawUserData.savings ? parseFloat(rawUserData.savings) : null,
          currency: "INR",
          source: "USER_PROFILE"
        },
        emergencyFund: {
          value: rawUserData.currentLiquidReserve ? parseFloat(rawUserData.currentLiquidReserve) : null,
          currency: "INR",
          source: "USER_PROFILE"
        },
        age: {
          value: rawUserData.age ? parseInt(rawUserData.age, 10) : null,
          currency: "INR",
          source: "USER_PROFILE"
        },
        riskPreference: {
          value: rawUserData.riskPreference || null,
          currency: "INR",
          source: "USER_PROFILE"
        },
        riskScore: {
          value: rawUserData.riskScore ? parseFloat(rawUserData.riskScore) : null,
          currency: "INR",
          source: "CALCULATED"
        },
        goals: rawUserData.goals || [],
        portfolioHoldings: rawUserData.investments || [],
        debts: rawUserData.debts || [],
        transactions: rawUserData.transactions || [],
        documentExtractedFields: rawUserData.documentExtractedFields || {}
      };
    }

    // UNAVAILABLE / EMPTY PROFILE STATE
    const unavailInc = { value: null, currency: "INR" as const, source: "UNAVAILABLE" as const };
    const unavailExp = { value: null, currency: "INR" as const, source: "UNAVAILABLE" as const };
    const unavailSav = { value: null, currency: "INR" as const, source: "UNAVAILABLE" as const };

    return {
      userId,
      isDemoMode: false,
      hasStoredProfile: false,
      hasVerifiedProfile: false,
      income: unavailInc,
      expenses: unavailExp,
      savings: unavailSav,
      monthlyIncome: unavailInc,
      monthlyExpenses: unavailExp,
      monthlySavings: unavailSav,
      liquidCash: { value: null, currency: "INR", source: "UNAVAILABLE" },
      emergencyFund: { value: null, currency: "INR", source: "UNAVAILABLE" },
      age: { value: null, currency: "INR", source: "UNAVAILABLE" },
      riskPreference: { value: null, currency: "INR", source: "UNAVAILABLE" },
      riskScore: { value: null, currency: "INR", source: "UNAVAILABLE" },
      goals: [],
      portfolioHoldings: [],
      debts: [],
      transactions: [],
      documentExtractedFields: {}
    };
  }
}
