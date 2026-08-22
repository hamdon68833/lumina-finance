import { GoogleGenAI } from "@google/genai";
import { SmartAlert, UserAlertPreferences, DEFAULT_USER_PREFERENCES } from "./alert_rules";
import { AlertIntelligenceEngine } from "./alert_engine";

export class NotificationService {
  private static instance: NotificationService;
  private alertStore: Map<string, SmartAlert[]> = new Map(); // userId -> SmartAlert[]
  private preferencesStore: Map<string, UserAlertPreferences> = new Map(); // userId -> UserAlertPreferences
  private engine: AlertIntelligenceEngine;

  private constructor(aiClient: GoogleGenAI | null = null) {
    this.engine = new AlertIntelligenceEngine(aiClient);
  }

  public static getInstance(aiClient: GoogleGenAI | null = null): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(aiClient);
    }
    return NotificationService.instance;
  }

  public getAlerts(userId: string, options: { unreadOnly?: boolean; type?: string; minSeverity?: string } = {}): SmartAlert[] {
    const userAlerts = this.alertStore.get(userId) || [];
    let filtered = userAlerts.filter(a => a.state !== "DISMISSED");

    if (options.unreadOnly) {
      filtered = filtered.filter(a => !a.isRead);
    }

    if (options.type) {
      filtered = filtered.filter(a => a.type === options.type);
    }

    // Sort by timestamp descending
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getUnreadCount(userId: string): number {
    const userAlerts = this.alertStore.get(userId) || [];
    return userAlerts.filter(a => !a.isRead && a.state !== "DISMISSED").length;
  }

  public markAsRead(userId: string, alertId: string): boolean {
    const userAlerts = this.alertStore.get(userId) || [];
    const alert = userAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      if (alert.state === "NEW") alert.state = "READ";
      return true;
    }
    return false;
  }

  public markAllAsRead(userId: string): number {
    const userAlerts = this.alertStore.get(userId) || [];
    let count = 0;
    for (const a of userAlerts) {
      if (!a.isRead && a.state !== "DISMISSED") {
        a.isRead = true;
        if (a.state === "NEW") a.state = "READ";
        count++;
      }
    }
    return count;
  }

  public dismissAlert(userId: string, alertId: string): boolean {
    const userAlerts = this.alertStore.get(userId) || [];
    const alert = userAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.state = "DISMISSED";
      alert.isRead = true;
      return true;
    }
    return false;
  }

  public getPreferences(userId: string): UserAlertPreferences {
    return this.preferencesStore.get(userId) || { ...DEFAULT_USER_PREFERENCES };
  }

  public updatePreferences(userId: string, prefs: Partial<UserAlertPreferences>): UserAlertPreferences {
    const current = this.getPreferences(userId);
    const updated = { ...current, ...prefs };
    this.preferencesStore.set(userId, updated);
    return updated;
  }

  public async evaluateAndStoreAlerts(
    userId: string,
    userContext: any,
    marketDataList: any[] = []
  ): Promise<SmartAlert[]> {
    const existing = this.alertStore.get(userId) || [];
    const prefs = this.getPreferences(userId);

    const evaluatedAlerts = await this.engine.evaluateSmartAlerts(
      userId,
      userContext,
      marketDataList,
      existing,
      prefs
    );

    this.alertStore.set(userId, evaluatedAlerts);
    return this.getAlerts(userId);
  }

  public createDemoAlert(userId: string, demoType: "NVIDIA_DROP" | "EMERGENCY_LOW" | "EQUITY_DRIFT"): SmartAlert {
    const nowIso = new Date().toISOString();
    let alertObj: SmartAlert;

    if (demoType === "NVIDIA_DROP") {
      alertObj = {
        id: `demo_nvda_${Date.now()}`,
        userId,
        type: "MARKET",
        severity: "HIGH",
        state: "NEW",
        title: "NVIDIA Market Alert (-7.2%)",
        summary: "NVIDIA declined 7.2% today. Your portfolio currently has 30% exposure to NVIDIA.",
        reason: "Market price drop of 7.2% exceeds 5.0% volatility threshold on high portfolio exposure asset (30%).",
        calculations: {
          ticker: "NVDA",
          changePercent: -7.2,
          currentPrice: 118.5,
          userExposurePercent: 30.0,
          portfolioValueAtRisk: 300000
        },
        recommendations: [
          "Review your NVIDIA concentration before making additional purchases.",
          "Evaluate whether single-stock exposure (30%) matches your target risk profile."
        ],
        warnings: [
          "High single-stock concentration increases portfolio drawdowns during tech sector pullbacks."
        ],
        source: "Lumina Demo Market Event Detector",
        timestamp: nowIso,
        isLiveData: false,
        isDemoData: true,
        isRead: false,
        relevanceScore: 95,
        userExposure: 30.0,
        geminiExplanation: "NVIDIA declined 7.2% today. Because your portfolio maintains a 30% allocation to NVDA, this movement creates high single-stock volatility impact. Consider reviewing whether rebalancing aligns with your risk tolerance.",
        actions: [
          { label: "Analyze Impact", action: "ANALYZE" },
          { label: "Simulate Allocation", action: "SIMULATE" },
          { label: "Ask Lumina", action: "ASK_COPILOT" }
        ],
        dedupKey: `DEMO:NVDA_DROP:${userId}`
      };
    } else if (demoType === "EMERGENCY_LOW") {
      alertObj = {
        id: `demo_emerg_${Date.now()}`,
        userId,
        type: "EMERGENCY_FUND",
        severity: "CRITICAL",
        state: "NEW",
        title: "CRITICAL — Emergency Fund Coverage (2.1 Months)",
        summary: "Your liquid emergency coverage is 2.1 months, below the recommended 6.0-month safety target.",
        reason: "Liquid reserves cover only 2.1 months of expenses ($3,000/mo expense baseline).",
        calculations: {
          monthlyExpenses: 3000,
          liquidSavings: 6300,
          monthsCovered: 2.1,
          targetMonths: 6.0,
          shortfall: 11700
        },
        recommendations: [
          "Prioritize emergency reserves before increasing high-risk investments.",
          "Allocate monthly surplus cash flow to build a 6-month buffer."
        ],
        warnings: [
          "Insufficient liquid reserves expose long-term assets to forced liquidation."
        ],
        source: "Lumina Safety Guardrail Engine",
        timestamp: nowIso,
        isLiveData: false,
        isDemoData: true,
        isRead: false,
        relevanceScore: 100,
        userExposure: 0,
        geminiExplanation: "Your liquid reserves stand at 2.1 months of expenses. Lumina recommends building cash reserves before pursuing speculative investments.",
        actions: [
          { label: "Build Emergency Plan", action: "BUILD_EMERGENCY_PLAN" },
          { label: "Simulate 6-Month Target", action: "SIMULATE" },
          { label: "Ask Lumina", action: "ASK_COPILOT" }
        ],
        dedupKey: `DEMO:EMERGENCY_LOW:${userId}`
      };
    } else {
      alertObj = {
        id: `demo_drift_${Date.now()}`,
        userId,
        type: "PORTFOLIO",
        severity: "MEDIUM",
        state: "NEW",
        title: "Portfolio Allocation Drift (72% Equity vs 60% Target)",
        summary: "Your equity allocation is 12 percentage points above your configured target of 60%.",
        reason: "Portfolio allocation drift exceeds the 10.0% rebalancing threshold.",
        calculations: {
          targetEquityPct: 60.0,
          currentEquityPct: 72.0,
          driftPercentagePoints: 12.0
        },
        recommendations: [
          "Consider evaluating a portfolio rebalancing strategy to realign equity to 60%.",
          "Review whether profit rebalancing is appropriate."
        ],
        warnings: [
          "Over-allocation to equities increases portfolio volatility."
        ],
        source: "Lumina Portfolio Optimizer",
        timestamp: nowIso,
        isLiveData: false,
        isDemoData: true,
        isRead: false,
        relevanceScore: 85,
        userExposure: 72.0,
        geminiExplanation: "Your equity allocation stands at 72%, 12 points above target. Rebalancing can help lock in profits and manage downside risk.",
        actions: [
          { label: "Analyze Portfolio", action: "VIEW_PORTFOLIO" },
          { label: "Simulate Rebalancing", action: "SIMULATE" },
          { label: "Ask Lumina", action: "ASK_COPILOT" }
        ],
        dedupKey: `DEMO:EQUITY_DRIFT:${userId}`
      };
    }

    const existing = this.alertStore.get(userId) || [];
    this.alertStore.set(userId, [alertObj, ...existing.filter(a => a.dedupKey !== alertObj.dedupKey)]);
    return alertObj;
  }
}
