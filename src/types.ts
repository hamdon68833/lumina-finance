export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
}

export interface Money {
  amount: number;
  currency: "INR" | "USD" | string;
}

export interface ExpenseBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface BudgetData {
  monthlyIncome: number;
  totalExpenses: number;
  monthlySavings: number;
  savingsRatio: number;
  currentReserve: number;
  targetEmergencyFund: number;
  emergencyShortfall: number;
  monthsCovered: number;
  isAdequate: boolean;
  status: string;
  statusColor: string;
  emergencyMonthlyAllocation: number;
  investableMonthlySavings: number;
  advice: string;
  expenseBreakdown: ExpenseBreakdownItem[];
}

export interface AllocationItem {
  assetClass: string;
  percentage: number;
  amount: number;
  color: string;
  role: string;
}

export interface RiskData {
  riskCategory: "Low" | "Medium" | "High";
  riskScore: number;
  strategyTitle: string;
  strategyDescription: string;
  explanations: string[];
  allocations: AllocationItem[];
  totalInvestable: number;
}

export interface StockHistoryItem {
  date: string;
  price: number;
  sma20: number;
}

export interface StockData {
  ticker: string;
  name: string;
  currentPrice: number;
  sma20: number;
  sma50: number;
  rsi: number;
  trend: string;
  newsSentiment: number;
  sentimentLabel: string;
  recommendation: "BUY" | "SELL" | "HOLD";
  recColor: string;
  rationale: string;
  targetPrice: number;
  stopLoss: number;
  history: StockHistoryItem[];
}

// Financial Digital Twin Types
export interface FinancialTwinScore {
  overallHealth: number; // 0-100
  stabilityScore: number; // 0-100
  liquidityScore: number; // 0-100
  debtPressureScore: number; // 0-100 (100 = zero debt stress)
  investmentReadinessScore: number; // 0-100
  goalReadinessScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  calculatedAt: string;
}

// Health Score 2.0 Types
export interface HealthScoreComponent {
  name: string;
  score: number; // 0-100
  weight: number;
  status: "OPTIMAL" | "ADEQUATE" | "NEEDS_ATTENTION" | "CRITICAL";
  explanation: string;
}

export interface HealthScore2Result {
  overallScore: number;
  rating: "EXCELLENT" | "GOOD" | "MODERATE" | "NEEDS_WORK" | "VULNERABLE";
  components: HealthScoreComponent[];
  strongestDriver: string;
  weakestDriver: string;
  recommendations: string[];
  simulationImprovements: Array<{
    action: string;
    scoreDelta: number;
    newOverallScore: number;
  }>;
}

// Goal Types
export type GoalPriority = "HIGH" | "MEDIUM" | "LOW";
export type GoalStatus = "ON_TRACK" | "NEEDS_ADJUSTMENT" | "AT_RISK" | "COMPLETED";

export interface FinancialGoal {
  id: string;
  name: string;
  category: "House" | "Car" | "Education" | "Marriage" | "Retirement" | "Travel" | "Emergency" | "Custom";
  targetAmount: Money;
  currentAmount: Money;
  targetMonths: number;
  monthlyContribution: Money;
  expectedReturnRate: number; // annual %
  priority: GoalPriority;
  status: GoalStatus;
  projectedCompletionMonths: number;
  shortfall: Money;
  surplus: Money;
}

// Debt Types
export interface DebtAccount {
  id: string;
  name: string;
  type: "Home Loan" | "Personal Loan" | "Car Loan" | "Credit Card" | "Education Loan";
  balance: Money;
  interestRate: number; // annual %
  monthlyEMI: Money;
  remainingTenureMonths: number;
}

export interface DebtStrategyComparison {
  strategy: "AVALANCHE" | "SNOWBALL" | "BALANCED";
  totalInterestPaid: Money;
  totalMonthsToFreedom: number;
  payoffOrder: string[];
  monthlyCashFlowFreed: Money;
}

// Decision Journal Entry
export interface JournalEntry {
  id: string;
  date: string;
  decisionTitle: string;
  category: string;
  amount?: Money;
  rationale: string;
  expectedOutcome: string;
  riskLevel: "Low" | "Medium" | "High";
  actualOutcome?: string;
  alignedWithPlan?: boolean;
}

// Financial Calendar Event
export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: "EMI" | "Bill" | "Goal Contribution" | "Investment" | "Insurance Renewal" | "Tax Reminder";
  amount: Money;
  isCompleted: boolean;
}

// Subscription Item
export interface SubscriptionItem {
  id: string;
  serviceName: string;
  monthlyCost: Money;
  annualizedCost: Money;
  frequency: "Monthly font-mono" | "Annual";
  category: "Streaming" | "Software" | "Gym" | "Membership" | "Utility";
  lastDetected: string;
  potentialSavings: Money;
}

// Market Watchlist Asset Model
export interface WatchlistItem {
  symbol: string;
  ticker: string;
  name: string;
  exchange: "NSE" | "BSE" | "NASDAQ" | "NYSE";
  assetType: "INDEX" | "EQUITY" | "MUTUAL_FUND";
  country: "IN" | "US";
  currency: "INR" | "USD";
  price: number | null;
  change: number | null;
  changePercent: number;
  rsi: number;
  trend: string;
  technicalSignal: string;
  explainableStatus: "Bullish Momentum" | "Neutral" | "High Volatility" | "Consolidating" | "Watch" | "Potential Risk" | "Potential Opportunity";
  userPortfolioExposurePct: number;
  relevanceLevel: "HIGH" | "MEDIUM" | "LOW";
  newsSentiment: string;
  volume?: string;
  marketCap?: string;
  dayHigh?: number;
  dayLow?: number;
  provenance: "LIVE_MARKET" | "LIVE_WEB" | "CALCULATED" | "USER_PROVIDED" | "DEMO_DATA" | "UNAVAILABLE";
  timestamp: string;
  isDemoData: boolean;
}

export interface PythonProjectFile {
  name: string;
  path: string;
  description: string;
}
