import { GoogleGenAI } from "@google/genai";
import {
  AlertSeverity,
  SmartAlert,
  UserAlertPreferences,
  DEFAULT_USER_PREFERENCES,
  isSeverityAboveThreshold,
  DEFAULT_COOLDOWN_HOURS,
  AlertAction
} from "./alert_rules";
import {
  DetectedEvent,
  MarketEventDetector,
  PortfolioRiskDetector,
  PortfolioDriftDetector,
  EmergencyFundDetector,
  GoalProgressDetector,
  BudgetAnomalyDetector,
  DebtAlertDetector,
  InvestmentOpportunityDetector
} from "./event_detector";

export class AlertIntelligenceEngine {
  private aiClient: GoogleGenAI | null;

  constructor(aiClient: GoogleGenAI | null = null) {
    this.aiClient = aiClient;
  }

  public async evaluateSmartAlerts(
    userId: string,
    userContext: any,
    marketDataList: any[] = [],
    existingAlerts: SmartAlert[] = [],
    preferences: UserAlertPreferences = DEFAULT_USER_PREFERENCES
  ): Promise<SmartAlert[]> {
    console.log(`[ALERT INTELLIGENCE ENGINE] Evaluating alerts for user: ${userId}`);

    // 1. Gather events from all 8 detectors
    const rawEvents: DetectedEvent[] = [
      ...MarketEventDetector.detect(marketDataList),
      ...PortfolioRiskDetector.detect(userContext),
      ...PortfolioDriftDetector.detect(userContext),
      ...EmergencyFundDetector.detect(userContext),
      ...GoalProgressDetector.detect(userContext),
      ...BudgetAnomalyDetector.detect(userContext),
      ...DebtAlertDetector.detect(userContext),
      ...InvestmentOpportunityDetector.detect(userContext)
    ];

    const newAlerts: SmartAlert[] = [];
    const nowIso = new Date().toISOString();

    for (const ev of rawEvents) {
      // 2. Preference category checks
      if (ev.eventType === "MARKET" && !preferences.marketAlerts) continue;
      if (ev.eventType === "PORTFOLIO" && !preferences.portfolioAlerts) continue;
      if (ev.eventType === "EMERGENCY_FUND" && !preferences.emergencyAlerts) continue;
      if (ev.eventType === "GOAL" && !preferences.goalAlerts) continue;
      if (ev.eventType === "BUDGET" && !preferences.budgetAlerts) continue;
      if (ev.eventType === "DEBT" && !preferences.debtAlerts) continue;
      if (ev.eventType === "OPPORTUNITY" && !preferences.opportunityAlerts) continue;

      // 3. Calculate Personalized Relevance & Adjust Severity based on User Exposure
      let userExposure = 0;
      let calculatedSeverity = ev.rawSeverity;
      let relevanceScore = 50;

      if (ev.eventType === "MARKET" && ev.ticker) {
        // Calculate user portfolio exposure to this stock/ticker
        const investments = userContext.investments || userContext.stocks || [];
        const totalWorth = userContext.totalNetWorth || userContext.totalInvestments || 1;
        const matchingAsset = investments.find((inv: any) => 
          (inv.ticker && inv.ticker.toLowerCase() === ev.ticker?.toLowerCase()) ||
          (inv.name && inv.name.toLowerCase().includes(ev.ticker?.toLowerCase() || ''))
        );

        if (matchingAsset) {
          const val = matchingAsset.value || (matchingAsset.allocationPercent ? (matchingAsset.allocationPercent / 100) * totalWorth : 0);
          userExposure = totalWorth > 0 ? (val / totalWorth) * 100 : 0;
        }

        // Personalized Relevance Rule:
        // 0% exposure -> LOW/INFO relevance score (15), severity LOW
        // > 20% exposure -> HIGH relevance score (90), severity HIGH/CRITICAL
        if (userExposure === 0) {
          relevanceScore = 15;
          calculatedSeverity = "LOW";
        } else if (userExposure >= 25) {
          relevanceScore = 95;
          calculatedSeverity = "HIGH";
        } else if (userExposure >= 10) {
          relevanceScore = 75;
          calculatedSeverity = "MEDIUM";
        } else {
          relevanceScore = 40;
          calculatedSeverity = "LOW";
        }
      } else if (ev.eventType === "EMERGENCY_FUND") {
        relevanceScore = 100;
      } else if (ev.eventType === "PORTFOLIO" || ev.eventType === "GOAL") {
        relevanceScore = 85;
      } else {
        relevanceScore = 60;
      }

      // Filter by minimum severity preference
      if (!isSeverityAboveThreshold(calculatedSeverity, preferences.minimumSeverity)) {
        continue;
      }

      // 4. Deduplication & Cooldown Check
      const cooldownHours = DEFAULT_COOLDOWN_HOURS[ev.eventType] || 24;
      const cooldownMs = cooldownHours * 60 * 60 * 1000;

      const existingMatch = existingAlerts.find(a => a.dedupKey === ev.dedupKey && a.state !== "DISMISSED");

      if (existingMatch) {
        const timeDiff = new Date(nowIso).getTime() - new Date(existingMatch.timestamp).getTime();
        if (timeDiff < cooldownMs) {
          // Event is inside cooldown window -> UPDATE existing alert if numbers changed, do NOT duplicate!
          existingMatch.updatedAt = nowIso;
          existingMatch.calculations = { ...existingMatch.calculations, ...ev.calculations };
          existingMatch.state = "UPDATED";
          console.log(`[ALERT ENGINE] Deduplication hit for key ${ev.dedupKey} -> Updated existing alert ${existingMatch.id}`);
          continue;
        }
      }

      // 5. Generate Safe Decision-Support Actions (No automatic trading!)
      const actions: AlertAction[] = [];

      if (ev.eventType === "MARKET") {
        actions.push({ label: "Analyze Impact", action: "ANALYZE" });
        actions.push({ label: "Simulate Allocation", action: "SIMULATE" });
        actions.push({ label: "Ask Lumina", action: "ASK_COPILOT" });
      } else if (ev.eventType === "EMERGENCY_FUND") {
        actions.push({ label: "Build Emergency Plan", action: "BUILD_EMERGENCY_PLAN" });
        actions.push({ label: "Simulate 6-Month Target", action: "SIMULATE" });
        actions.push({ label: "Ask Lumina", action: "ASK_COPILOT" });
      } else if (ev.eventType === "PORTFOLIO") {
        actions.push({ label: "Analyze Portfolio", action: "VIEW_PORTFOLIO" });
        actions.push({ label: "Simulate Rebalancing", action: "SIMULATE" });
        actions.push({ label: "Ask Lumina", action: "ASK_COPILOT" });
      } else if (ev.eventType === "GOAL") {
        actions.push({ label: "View Goal Progress", action: "VIEW_GOAL" });
        actions.push({ label: "Simulate Contribution", action: "SIMULATE" });
        actions.push({ label: "Ask Lumina", action: "ASK_COPILOT" });
      } else {
        actions.push({ label: "Analyze Impact", action: "ANALYZE" });
        actions.push({ label: "Ask Lumina", action: "ASK_COPILOT" });
      }

      // 6. Optional Gemini Explanation Synthesis
      let geminiExplanation = "";
      if (this.aiClient) {
        try {
          geminiExplanation = await this.generateGeminiExplanation(ev, userExposure, calculatedSeverity);
        } catch {
          geminiExplanation = ev.summary;
        }
      }

      // 7. Construct Final SmartAlert Object
      const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const alertObj: SmartAlert = {
        id: alertId,
        userId,
        type: ev.eventType,
        severity: calculatedSeverity,
        state: "NEW",
        title: ev.title,
        summary: ev.summary,
        reason: ev.reason,
        calculations: ev.calculations,
        recommendations: ev.recommendations,
        warnings: ev.warnings,
        source: ev.source,
        timestamp: nowIso,
        isLiveData: ev.isLiveData,
        isDemoData: Boolean(ev.isDemoData),
        isRead: false,
        actions,
        relevanceScore,
        userExposure,
        geminiExplanation: geminiExplanation || ev.summary,
        dedupKey: ev.dedupKey
      };

      newAlerts.push(alertObj);
    }

    // Merge existing non-dismissed alerts with new alerts
    const updatedExisting = existingAlerts.filter(a => a.state !== "DISMISSED");
    return [...newAlerts, ...updatedExisting];
  }

  private async generateGeminiExplanation(
    ev: DetectedEvent,
    userExposure: number,
    severity: AlertSeverity
  ): Promise<string> {
    if (!this.aiClient) return ev.summary;

    const factContext = {
      title: ev.title,
      eventType: ev.eventType,
      severity,
      userExposurePct: userExposure,
      calculations: ev.calculations
    };

    const prompt = `
YOU ARE LUMINA AI EXPLANATION SYSTEM.
EXPLAIN THIS FINANCIAL ALERT TO THE USER.

VERIFIED FACTUAL CONTEXT (AUTHORITATIVE - DO NOT CHANGE ANY NUMBERS):
${JSON.stringify(factContext, null, 2)}

INSTRUCTIONS:
1. Explain clearly why this alert matters for the user's financial strategy.
2. DO NOT change priceChange, userExposure, portfolio values, or severity.
3. Keep explanation concise (2-3 sentences max).
4. Use decision-support language ("Consider evaluating...", "Review exposure...").
`;

    try {
      const res = await this.aiClient.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt
      });
      return res?.text ? res.text.trim() : ev.summary;
    } catch {
      return ev.summary;
    }
  }
}
