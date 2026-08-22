import { GoogleGenAI } from "@google/genai";
import { LuminaAIAgent, AgentResponse } from "./lumina_agent";
import { CopilotRequestMessage } from "./copilot_engine";

export type CopilotMode = "GENERAL_AI" | "FINANCIAL" | "MARKET" | "CURRENT_INFO" | "DOCUMENT";

export type CapabilityType =
  | "GENERAL_AI"
  | "FINANCIAL_ANALYSIS"
  | "MARKET_DATA"
  | "CURRENT_WEB_INFORMATION"
  | "CALCULATOR"
  | "CODING"
  | "EDUCATION"
  | "WRITING"
  | "ANALYSIS"
  | "CONVERSATION";

export interface OrchestrationResult {
  mode: CopilotMode;
  intent: string;
  intentLabel: string;
  capabilities: CapabilityType[];
  requiredTools: string[];
  calculations: Record<string, any>;
  recommendations: string[];
  warnings: string[];
  missingData: string[];
  sources: string[];
  dataFreshness: string;
  confidence: "HIGH" | "MEDIUM" | "NEEDS_INPUT";
  answer: string;
  summary: string;
}

export class LuminaAIOrchestrator {
  private agent: LuminaAIAgent;

  constructor(aiClient: GoogleGenAI | null = null) {
    this.agent = new LuminaAIAgent(aiClient);
  }

  async processQuery(
    question: string,
    userContext: any,
    history: CopilotRequestMessage[] = []
  ): Promise<OrchestrationResult> {
    const res: AgentResponse = await this.agent.runAgent(question, userContext, history);

    return {
      mode: res.mode,
      intent: res.intent,
      intentLabel: res.intentLabel,
      capabilities: [res.mode as any],
      requiredTools: res.toolCalls.map(t => t.tool),
      calculations: res.calculations,
      recommendations: res.recommendations,
      warnings: res.warnings,
      missingData: res.missingData,
      sources: res.sources,
      dataFreshness: res.dataFreshness,
      confidence: res.confidence,
      answer: res.answer,
      summary: res.recommendations[0] || "Analysis complete."
    };
  }
}
