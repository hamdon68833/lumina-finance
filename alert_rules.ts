export type AlertType = 
  | "MARKET"
  | "PORTFOLIO"
  | "EMERGENCY_FUND"
  | "GOAL"
  | "BUDGET"
  | "DEBT"
  | "OPPORTUNITY"
  | "NEWS";

export type AlertSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AlertState = "NEW" | "READ" | "DISMISSED" | "EXPIRED" | "UPDATED";

export type AlertActionType = 
  | "ANALYZE"
  | "SIMULATE"
  | "ASK_COPILOT"
  | "VIEW_MARKET"
  | "VIEW_GOAL"
  | "VIEW_PORTFOLIO"
  | "BUILD_EMERGENCY_PLAN";

export interface AlertAction {
  label: string;
  action: AlertActionType;
  payload?: Record<string, any>;
}

export interface SmartAlert {
  id: string;
  userId: string;
  type: AlertType;
  severity: AlertSeverity;
  state: AlertState;
  title: string;
  summary: string;
  reason: string;
  calculations: Record<string, any>;
  recommendations: string[];
  warnings: string[];
  source?: string;
  timestamp: string;
  updatedAt?: string;
  isLiveData?: boolean;
  isDemoData?: boolean;
  isRead: boolean;
  actions: AlertAction[];
  relevanceScore?: number; // 0 to 100
  userExposure?: number;   // Percentage of portfolio
  geminiExplanation?: string;
  dedupKey: string;
}

export interface UserAlertPreferences {
  marketAlerts: boolean;
  portfolioAlerts: boolean;
  emergencyAlerts: boolean;
  goalAlerts: boolean;
  budgetAlerts: boolean;
  debtAlerts: boolean;
  opportunityAlerts: boolean;
  minimumSeverity: AlertSeverity;
}

export const DEFAULT_USER_PREFERENCES: UserAlertPreferences = {
  marketAlerts: true,
  portfolioAlerts: true,
  emergencyAlerts: true,
  goalAlerts: true,
  budgetAlerts: true,
  debtAlerts: true,
  opportunityAlerts: true,
  minimumSeverity: "LOW"
};

export const SEVERITY_WEIGHTS: Record<AlertSeverity, number> = {
  INFO: 1,
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  CRITICAL: 5
};

// Cooldown intervals in milliseconds
export const DEFAULT_COOLDOWN_HOURS: Record<AlertType, number> = {
  MARKET: 6,
  PORTFOLIO: 24,
  EMERGENCY_FUND: 24,
  GOAL: 24,
  BUDGET: 24,
  DEBT: 24,
  OPPORTUNITY: 24,
  NEWS: 12
};

export function isSeverityAboveThreshold(
  severity: AlertSeverity,
  minimumSeverity: AlertSeverity
): boolean {
  return SEVERITY_WEIGHTS[severity] >= SEVERITY_WEIGHTS[minimumSeverity];
}
