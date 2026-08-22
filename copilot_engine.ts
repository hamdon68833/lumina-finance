import { GoogleGenAI } from "@google/genai";
import { LuminaAIOrchestrator } from "./copilot_orchestrator";
import { formatINR, formatINRMonthly } from "./src/utils/formatters";
import { LuminaAIAgent, AgentAction } from "./lumina_agent";

export type CopilotIntent =
  | "AFFORDABILITY"
  | "GOAL_OPTIMIZATION"
  | "RISK_EXPLANATION"
  | "BUDGET_ANALYSIS"
  | "EMERGENCY_FUND"
  | "INVESTMENT"
  | "PORTFOLIO"
  | "EXPENSE_ANALYSIS"
  | "DEBT"
  | "MARKET"
  | "GENERAL_FINANCE"
  | "GENERAL_CONVERSATION"
  | "CODING"
  | "EDUCATION"
  | "DOCUMENT_EXPLANATION";

export interface CopilotRequestMessage {
  sender: "user" | "bot";
  text: string;
  intent?: CopilotIntent;
  calculations?: any;
  missingData?: string[];
}

export interface CopilotResponse {
  intent: CopilotIntent;
  intentLabel: string;
  answer: string;
  summary: string;
  calculations: Record<string, any>;
  recommendations: string[];
  warnings: string[];
  missingData: string[];
  sources: string[];
  dataFreshness: string;
  confidence: "HIGH" | "MEDIUM" | "NEEDS_INPUT";
  actions?: AgentAction[];
}

import { VerifiedContextResolver } from "./verified_context_resolver";

export function getFinancialProfile(userContext: any) {
  const verified = VerifiedContextResolver.getVerifiedFinancialContext("user-1", userContext, userContext?.isDemoMode);
  
  const income = verified.income.value || 0;
  const expenses = verified.expenses.value || 0;
  const savings = (verified.income.value !== null && verified.expenses.value !== null) ? Math.max(0, income - expenses) : 0;
  const reserve = verified.emergencyFund.value || 0;
  const monthsCovered = expenses > 0 ? reserve / expenses : 0;

  return {
    income,
    expenses,
    savings,
    savingsRate: income > 0 ? Math.round((savings / income) * 100 * 10) / 10 : 0,
    reserve,
    monthsCovered: Math.round(monthsCovered * 10) / 10,
    age: Math.max(18, parseInt(userContext?.age) || 28),
    riskPreference: userContext?.riskPreference || "High",
    hasVerifiedData: verified.hasVerifiedProfile
  };
}

// ---------------------------------------------------------------------------
// MAIN COPILOT PIPELINE DISPATCHER
// ---------------------------------------------------------------------------
export async function processCopilotQuery(
  question: string,
  userContext: any,
  history: CopilotRequestMessage[] = [],
  aiClient: GoogleGenAI | null = null,
  currentHub?: string
): Promise<CopilotResponse & { success: boolean; status: string; mode?: string }> {
  const agent = new LuminaAIAgent(aiClient);
  const activeHub = currentHub || userContext?.currentHub;
  const result = await agent.runAgent(question, userContext, history, activeHub);

  const status = result.missingData && result.missingData.length > 0 ? "NEEDS_INPUT" : "SUCCESS";

  return {
    success: true,
    status,
    intent: result.intent as any,
    intentLabel: result.intentLabel,
    answer: result.answer,
    summary: result.recommendations[0] || "Analysis complete.",
    calculations: result.calculations || {},
    recommendations: result.recommendations || [],
    warnings: result.warnings || [],
    missingData: result.missingData || [],
    sources: result.sources || [],
    dataFreshness: result.dataFreshness || "Lumina Engine",
    confidence: result.confidence || "HIGH",
    mode: result.mode,
    actions: result.actions || []
  };
}
