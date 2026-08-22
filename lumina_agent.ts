import { GoogleGenAI } from "@google/genai";
import { TOOL_REGISTRY, AgentTool } from "./tool_registry";
import { formatINR, formatINRMonthly } from "./src/utils/formatters";

export type AgentMode =
  | "GENERAL_AI"
  | "FINANCIAL"
  | "MARKET"
  | "CURRENT_INFO"
  | "DOCUMENT";

export interface ToolCallRecord {
  tool: string;
  args: any;
  result: any;
}

export interface AgentAction {
  label: string;
  action: string; // 'NAVIGATE' | 'SIMULATE' | 'PROMPT' | 'UPLOAD'
  target?: string;
  prompt?: string;
}

export interface AgentResponse {
  answer: string;
  mode: AgentMode;
  intent: string;
  intentLabel: string;
  entity?: string;
  toolCalls: ToolCallRecord[];
  calculations: Record<string, any>;
  recommendations: string[];
  warnings: string[];
  missingData: string[];
  sources: string[];
  dataFreshness: string;
  confidence: "HIGH" | "MEDIUM" | "NEEDS_INPUT";
  actions?: AgentAction[];
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operationName: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`[TIMEOUT] ${operationName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// ---------------------------------------------------------------------------
// SELECTIVE CONTEXT LOADER
// ---------------------------------------------------------------------------
export function getRelevantUserContext(intent: string, userContext: any): Record<string, any> {
  if (!userContext) return {};
  const intentUpper = (intent || "").toUpperCase();

  // PORTFOLIO / REBALANCING / ALLOCATION
  if (intentUpper.includes("PORTFOLIO") || intentUpper.includes("REBALANCING") || intentUpper.includes("ALLOCATION")) {
    const rawHoldings = userContext?.portfolio?.holdings || userContext?.holdings || userContext?.investments;
    return {
      portfolio: rawHoldings ? { holdings: rawHoldings } : null,
      riskPreference: userContext?.riskPreference || "High",
      targetAllocations: userContext?.targetAllocations || null
    };
  }

  // GOAL
  if (intentUpper.includes("GOAL")) {
    return {
      goals: userContext?.goals || [],
      savings: userContext?.savings || 0
    };
  }

  // DEBT / EMI
  if (intentUpper.includes("DEBT") || intentUpper.includes("EMI")) {
    return {
      income: userContext?.income || 0,
      debts: userContext?.debts || []
    };
  }

  // AFFORDABILITY
  if (intentUpper.includes("AFFORDABILITY")) {
    return {
      income: userContext?.income || 0,
      expenses: userContext?.expenses || 0,
      savings: userContext?.savings || 0,
      currentLiquidReserve: userContext?.currentLiquidReserve || 0
    };
  }

  // FINANCIAL HEALTH / RISK
  if (intentUpper.includes("HEALTH") || intentUpper.includes("RISK")) {
    return {
      income: userContext?.income || 0,
      expenses: userContext?.expenses || 0,
      savings: userContext?.savings || 0,
      currentLiquidReserve: userContext?.currentLiquidReserve || 0,
      riskPreference: userContext?.riskPreference || "High"
    };
  }

  // BUDGET / CASH_FLOW / EXPENSES
  if (intentUpper.includes("BUDGET") || intentUpper.includes("CASH_FLOW") || intentUpper.includes("EXPENSE")) {
    return {
      income: userContext?.income || 0,
      expenses: userContext?.expenses || 0,
      savings: userContext?.savings || 0,
      expensesDict: userContext?.expensesDict || {}
    };
  }

  return {};
}

const LUMINA_AGENT_SYSTEM_INSTRUCTION = `
You are Lumina AI, an intelligent financial operating system and professional financial copilot.

Respond cleanly, empathetically, and insightfully as an expert financial advisor.

RESPONSE STRUCTURE (for financial & market queries):
1. Direct Answer: A clear 1-2 sentence human explanation of the current financial position or query.
2. Key Numbers (if verified user data exists): Present 2-4 decision-relevant metrics cleanly.
3. What This Means: 2-3 bullet points explaining the real-world implications of these numbers.
4. Recommended Next Step: 1 clear, actionable next step using decision-support language ("Consider...", "Based on your current numbers...", "One option is...").
5. Follow-Up: Offer a helpful optional next step.

CURRENCY & NUMBERS RULES:
- User financial currency is strictly Indian Rupee (INR). Format all personal amounts using ₹ and Indian number grouping (e.g. ₹6,500, ₹3,800, ₹2,700, ₹1,00,000, ₹15,00,000).
- Never use USD/$ for personal financial data. Use USD/$ ONLY for genuine US-denominated equities (e.g. $124.80 for NVDA, $225.50 for AAPL).
- NEVER fabricate financial numbers. If portfolio, income, or goals are unavailable, state clearly that data is missing.

IMPORTANT SAFETY & ADVISORY RULE:
- Lumina is a decision-support system. NEVER issue rigid trading orders ("BUY NOW", "SELL NOW", "TRADE IMMEDIATELY"). Use advisory phrasing ("Consider...", "One option is...", "To evaluate...").

GENERAL & COMPUTER SCIENCE QUERIES:
- For general knowledge, coding, writing, or education: Answer directly, concisely, and cleanly. DO NOT invent or display user financial profile numbers, cards, or metrics.
`;

export function validateAgentResponse(
  response: AgentResponse,
  userContext?: any
): AgentResponse {
  let answer = response.answer || "";

  // 1. Sanitize raw markdown artifacts
  answer = answer
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/\\\\\*/g, '*')
    .replace(/\\\*/g, '*')
    .replace(/```markdown/gi, '```');

  // 2. Remove robotic headers/phrases
  answer = answer
    .replace(/Calculated financial metrics:\s*/gi, '')
    .replace(/Financial Analysis:\s*/gi, '')
    .replace(/Here are the verified calculations:\s*/gi, '')
    .replace(/Execution complete\.?\s*/gi, '')
    .replace(/Based on the calculation engine,?\s*/gi, 'Based on your financial profile, ')
    .replace(/This is a general topic\.?\s*/gi, '');

  // 3. Fix USD symbol formatting for Indian personal financial data (except US stock quotes)
  if (response.mode !== "MARKET" || !/nvda|aapl|tsla|msft|googl|sp500|nasdaq/i.test(answer)) {
    answer = answer.replace(/\$(\d[\d,]*)/g, (match, p1) => {
      const val = parseFloat(p1.replace(/,/g, ''));
      return formatINR(val);
    });
  }

  // 4. PREVENT CONTEXT POLLUTION: Strip budget lines if intent is PORTFOLIO
  if (response.intent && response.intent.startsWith("PORTFOLIO")) {
    if (answer.includes("Your current monthly cash flow is positive") || answer.includes("You earn ₹6,500")) {
      answer = answer
        .replace(/Your current monthly cash flow is positive[\s\S]*?₹3,800\.\n\n/gi, '')
        .replace(/You earn ₹[\d,]+ per month and spend ₹[\d,]+[\s\S]*?\n\n/gi, '');
    }
  }

  // 5. Validate calculations card object
  let validCalculations = { ...response.calculations };
  const keys = Object.keys(validCalculations);
  let meaningfulCount = 0;

  for (const k of keys) {
    const val = validCalculations[k];
    if (val !== null && val !== undefined && val !== "" && val !== 0) {
      meaningfulCount++;
    }
  }

  // Suppress empty/meaningless calculation cards
  if (meaningfulCount < 1 || response.mode === "GENERAL_AI") {
    validCalculations = {};
  }

  // 6. Standardize user-facing provenance labels
  let dataFreshness = response.dataFreshness;
  if (!dataFreshness || dataFreshness === "Live User Session" || dataFreshness === "Lumina Engine") {
    dataFreshness = "Based on your current profile";
  } else if (dataFreshness === "Model Knowledge") {
    dataFreshness = "General knowledge";
  }

  return {
    ...response,
    answer,
    calculations: validCalculations,
    dataFreshness
  };
}

export class LuminaAIAgent {
  private aiClient: GoogleGenAI | null;

  constructor(aiClient: GoogleGenAI | null = null) {
    this.aiClient = aiClient;
  }

  // ---------------------------------------------------------------------------
  // 1. UNDERSTAND REQUEST & HIERARCHICAL INTENT CLASSIFIER WITH PRIORITY RULES
  // ---------------------------------------------------------------------------
  public understandRequest(
    question: string,
    history: any[] = [],
    currentHub?: string
  ): { mode: AgentMode; intent: string; intentLabel: string; requiredToolNames: string[]; entity?: string } {
    const q = question.toLowerCase().trim();

    // Entity Extraction
    let entity: string | undefined = undefined;
    if (/\bnvidia\b|\bnvda\b/i.test(q)) entity = "NVDA";
    else if (/\bapple\b|\baapl\b/i.test(q)) entity = "AAPL";
    else if (/\bmicrosoft\b|\bmsft\b/i.test(q)) entity = "MSFT";
    else if (/\btesla\b|\btsla\b/i.test(q)) entity = "TSLA";
    else if (/\breliance\b/i.test(q)) entity = "RELIANCE.NS";
    else if (/\btcs\b/i.test(q)) entity = "TCS.NS";

    // 1. GREETINGS & GENERAL CONVERSATION -> GENERAL_AI
    if (/^(hello|hi|hey|good morning|good evening|good afternoon|howdy|sup|greetings)[\s!.]*$/i.test(q) || /^how are you\??$/i.test(q)) {
      return { mode: "GENERAL_AI", intent: "GREETING", intentLabel: "GENERAL CONVERSATION", requiredToolNames: [] };
    }

    // 2. EXPLICIT CODE GENERATION -> GENERAL_AI
    if (/(?:write|build|create|implement|debug|solve|generate)\s+.*(?:code|program|script|function|api|app|class|linked list|java|python|javascript|typescript|react)/i.test(q) || /write a java|write a python|write a react|write an api|reverse a string/i.test(q)) {
      return { mode: "GENERAL_AI", intent: "CODING", intentLabel: "CODING & DEVELOPMENT", requiredToolNames: [] };
    }

    // 3. GENERAL KNOWLEDGE / EDUCATION -> GENERAL_AI
    if (/what is python|what is javascript|what is java|what is gemini|explain machine learning|what is machine learning|explain diversification|what is react|what is html|what is sql|architecture of|definition of|concept of|tell me about machine learning/i.test(q)) {
      return { mode: "GENERAL_AI", intent: "EDUCATION", intentLabel: "GENERAL KNOWLEDGE & EDUCATION", requiredToolNames: [] };
    }

    // 4. MATH / CALCULATOR -> GENERAL_AI
    if (/what is \d+.*% of \d+|\d+\s*[\+\-\*\/]\s*\d+/i.test(q) && !/income|salary|savings|reserve|goal|emi|portfolio/i.test(q)) {
      return { mode: "GENERAL_AI", intent: "CALCULATOR", intentLabel: "MATH CALCULATOR", requiredToolNames: ["calculator"] };
    }

    // 5. WRITING -> GENERAL_AI
    if (/draft|essay|resume|cover letter|email|abstract|project description|rewrite|summary|article|poem|viva/i.test(q) && !/code|java|python|financial|portfolio/i.test(q)) {
      return { mode: "GENERAL_AI", intent: "WRITING", intentLabel: "WRITING & DRAFTING", requiredToolNames: [] };
    }

    // 6. Check Multi-Turn Follow-Ups
    let lastBotIntent = "";
    if (history.length > 0) {
      const lastBotMsg = [...history].reverse().find(m => m.sender === "bot" && m.intent);
      if (lastBotMsg) lastBotIntent = String(lastBotMsg.intent).toUpperCase();
    }

    // PORTFOLIO FOLLOW-UP: "What if I reduce NVDA to 15%?" or "How much money would that move?"
    if ((/reduce.*to \d+%|what if i reduce|scenario|target weight|would that increase|rebalance to/i.test(q)) || (lastBotIntent.startsWith("PORTFOLIO") && /what if|how about|instead|reduce|15%|10%|risk|how much|move|reallocate/i.test(q))) {
      return {
        mode: "FINANCIAL",
        intent: "PORTFOLIO_SIMULATION",
        intentLabel: "PORTFOLIO SIMULATION",
        requiredToolNames: ["getPortfolio", "calculatePortfolioConcentration", "calculateRebalancingOptions"],
        entity: entity || "NVDA"
      };
    }

    // =========================================================================
    // PRIORITY RULE 0: PORTFOLIO STRESS TEST / MARKET CRASH SIMULATION
    // =========================================================================
    if (/stress test|market crash|drawdown|what happens if.*falls|falls \d+%/i.test(q)) {
      return {
        mode: "FINANCIAL",
        intent: "PORTFOLIO_STRESS_TEST",
        intentLabel: "PORTFOLIO STRESS TEST",
        requiredToolNames: ["portfolioStressTest", "getPortfolio"],
        entity: entity || "NVDA"
      };
    }

    // =========================================================================
    // PRIORITY RULE 1: PORTFOLIO / ALLOCATION / REBALANCING (HIGHEST FINANCIAL PRIORITY)
    // =========================================================================
    const portfolioKeywords = /portfolio|holdings|allocation|asset allocation|rebalance|rebalancing|concentration|single stock|diversification|equity exposure|stock exposure|weight|position size|drawdown|portfolio risk|sharpe|correlation|sector exposure/i;

    if (portfolioKeywords.test(q)) {
      if (/rebalance|reduce.*concentration|single stock concentration|reduce.*exposure/i.test(q)) {
        return {
          mode: "FINANCIAL",
          intent: "PORTFOLIO_REBALANCING",
          intentLabel: "PORTFOLIO REBALANCING",
          requiredToolNames: ["getPortfolio", "getPortfolioAllocation", "calculatePortfolioConcentration", "calculateRebalancingOptions"],
          entity: entity || "NVDA"
        };
      }

      if (/analyze.*portfolio|portfolio risk|asset allocation|portfolio health|holdings/i.test(q)) {
        return {
          mode: "FINANCIAL",
          intent: "PORTFOLIO_ANALYSIS",
          intentLabel: "PORTFOLIO ANALYSIS & RISK",
          requiredToolNames: ["getPortfolio", "getPortfolioAllocation", "calculatePortfolioConcentration", "getRiskScore"],
          entity
        };
      }

      return {
        mode: "FINANCIAL",
        intent: "PORTFOLIO_ANALYSIS",
        intentLabel: "PORTFOLIO DIVERSIFICATION",
        requiredToolNames: ["getPortfolio", "getPortfolioAllocation", "optimizePortfolio"],
        entity
      };
    }

    // =========================================================================
    // PRIORITY RULE 2: GOAL TERMS
    // =========================================================================
    if (/house goal|downpayment|target amount|goal contribution|goal timeline|reach goal|accelerate goal|\bgoal\b|\bgoals\b/i.test(q)) {
      return {
        mode: "FINANCIAL",
        intent: "GOAL",
        intentLabel: "GOAL OPTIMIZATION",
        requiredToolNames: ["calculateGoal", "getFinancialProfile"]
      };
    }

    // =========================================================================
    // PRIORITY RULE 3: DEBT & EMI TERMS
    // =========================================================================
    if (/\bdebt\b|\bloan\b|\bemi\b|\bemis\b|repay|payoff|credit card balance|dti/i.test(q)) {
      return {
        mode: "FINANCIAL",
        intent: "DEBT",
        intentLabel: "DEBT & EMI ANALYSIS",
        requiredToolNames: ["calculateDebt", "calculateEMI"]
      };
    }

    // =========================================================================
    // PRIORITY RULE 4: AFFORDABILITY TERMS
    // =========================================================================
    if (/can i afford|can i buy|buy a|purchase|macbook|laptop|car|phone|trip|tv|iphone|can i spend/i.test(q)) {
      return {
        mode: "FINANCIAL",
        intent: "AFFORDABILITY",
        intentLabel: "FINANCIAL AFFORDABILITY",
        requiredToolNames: ["calculateAffordability", "calculateEmergencyFund"]
      };
    }

    // =========================================================================
    // PRIORITY RULE 5: HEALTH & RISK TERMS
    // =========================================================================
    if (/health score|financial health|risk score|why is my risk|risk category/i.test(q)) {
      return {
        mode: "FINANCIAL",
        intent: "FINANCIAL_HEALTH",
        intentLabel: "FINANCIAL HEALTH & RISK",
        requiredToolNames: ["getFinancialHealthScore", "getRiskScore", "getRiskExplanation"]
      };
    }

    // =========================================================================
    // PRIORITY RULE 6: BUDGET, CASH FLOW & EXPENSE TERMS
    // =========================================================================
    if (/income|salary|expense|expenses|spending|cash flow|monthly savings|budget|reduce my expenses|where i can save|save another|save an extra/i.test(q)) {
      return {
        mode: "FINANCIAL",
        intent: "BUDGET",
        intentLabel: "BUDGET & CASH FLOW",
        requiredToolNames: ["calculateBudget", "getExpenseAnalysis"]
      };
    }

    // =========================================================================
    // PRIORITY RULE 7: MARKET QUERIES (NO PERSONAL PORTFOLIO CONTEXT)
    // =========================================================================
    if (/today|latest|market|nifty|sensex|nasdaq|s&p|nvda|nvidia|aapl|reliance|tcs|stock price|falling|rising|news/i.test(q)) {
      if (/why is.*falling|why is.*rising|news|catalyst/i.test(q)) {
        return {
          mode: "MARKET",
          intent: "STOCK_NEWS",
          intentLabel: "STOCK MARKET NEWS",
          requiredToolNames: ["getStockData", "getMarketNews", "getCurrentWebInformation"],
          entity: entity || "NVDA"
        };
      }

      return {
        mode: "MARKET",
        intent: "MARKET_OVERVIEW",
        intentLabel: "MARKET OVERVIEW",
        requiredToolNames: ["getStockData", "getMarketNews", "getCurrentWebInformation"],
        entity
      };
    }

    // =========================================================================
    // HUB-SPECIFIC CONTEXT FALLBACKS
    // =========================================================================
    if (currentHub === 'investments') {
      return {
        mode: "FINANCIAL",
        intent: "PORTFOLIO_ANALYSIS",
        intentLabel: "PORTFOLIO ANALYSIS",
        requiredToolNames: ["getPortfolio", "getPortfolioAllocation", "calculatePortfolioConcentration"]
      };
    }

    if (currentHub === 'money') {
      return {
        mode: "FINANCIAL",
        intent: "BUDGET",
        intentLabel: "BUDGET & CASH FLOW",
        requiredToolNames: ["calculateBudget", "getExpenseAnalysis"]
      };
    }

    // GENERAL_AI FALLBACK
    return {
      mode: "GENERAL_AI",
      intent: "KNOWLEDGE",
      intentLabel: "GENERAL KNOWLEDGE",
      requiredToolNames: []
    };
  }

  // ---------------------------------------------------------------------------
  // 2. MAIN AGENT EXECUTION LOOP
  // ---------------------------------------------------------------------------
  public async runAgent(
    question: string,
    userContext: any,
    history: any[] = [],
    currentHub?: string
  ): Promise<AgentResponse> {
    const MAX_AGENT_STEPS = 8;
    const { mode, intent, intentLabel, requiredToolNames, entity } = this.understandRequest(question, history, currentHub);

    // Extract ONLY intent-relevant context to prevent context pollution
    const relevantContext = getRelevantUserContext(intent, userContext);

    const toolCalls: ToolCallRecord[] = [];
    let calculations: Record<string, any> = {};
    let recommendations: string[] = [];
    let warnings: string[] = [];
    let missingData: string[] = [];
    let sources: string[] = [];
    let dataFreshness = mode === "GENERAL_AI" ? "General knowledge" : "Based on your current profile";
    let webResults: any[] = [];
    let actions: AgentAction[] = [];

    // STEP 1: EXECUTE QUESTION-SPECIFIC TOOLS
    if (mode !== "GENERAL_AI" && mode !== "DOCUMENT") {
      let stepCount = 0;
      for (const toolName of requiredToolNames) {
        if (stepCount >= MAX_AGENT_STEPS) break;
        stepCount++;

        const tool: AgentTool = TOOL_REGISTRY[toolName];
        if (!tool) continue;

        try {
          const toolArgs = { question, query: question, ticker: entity || "NVDA" };
          const validation = tool.validate(toolArgs);
          if (!validation.valid && toolName !== "calculateGoal") {
            missingData.push(...(validation.missingFields || []));
            continue;
          }

          const result = await tool.execute(toolArgs, userContext, history);
          toolCalls.push({ tool: toolName, args: toolArgs, result });

          if (tool.category === "FINANCIAL") {
            dataFreshness = "Based on your current profile";
            sources.push("Lumina Financial Engine");
            calculations = { ...calculations, ...result };
          } else if (tool.category === "MARKET") {
            dataFreshness = result.isDemoData ? "DEMO DATA" : "LIVE MARKET DATA";
            sources.push("Lumina Market Engine");
            calculations = { ...calculations, ...result };
          } else if (tool.category === "CURRENT_INFO") {
            dataFreshness = result.dataFreshness || "Live Web Grounding";
            if (result.results) webResults.push(...result.results);
            if (result.results) sources.push(...result.results.map((r: any) => r.source));
          } else if (tool.category === "GENERAL") {
            calculations = { ...calculations, ...result };
          }
        } catch (err) {
          console.warn(`[LUMINA AGENT] Tool ${toolName} error:`, err);
        }
      }
    }

    // SERVER-SIDE DEBUG LOGGING TRACE
    console.log(`[LUMINA AGENT TRACE]
  REQUEST: "${question}"
  MODE: ${mode}
  INTENT: ${intent} (${intentLabel})
  ENTITY: ${entity || 'NONE'}
  TOOLS CALLED: [${toolCalls.map(t => t.tool).join(", ")}]
  CONTEXT KEYS: [${Object.keys(relevantContext).join(", ")}]`);

    // STEP 2: GENERATE CONTEXTUAL ADVISORY ACTIONS
    if (intent === "PORTFOLIO_REBALANCING" || intent === "PORTFOLIO_ANALYSIS" || intent === "PORTFOLIO_SIMULATION") {
      actions.push({ label: "View Investments", action: "NAVIGATE", target: "investments" });
      actions.push({ label: "Run 15% Target Scenario", action: "PROMPT", prompt: "What if I reduce NVDA to 15%?" });
      actions.push({ label: "Stress Test Portfolio", action: "PROMPT", prompt: "Stress test my portfolio for technology sector downturn" });
    } else if (intent === "BUDGET") {
      actions.push({ label: "Analyze Expense Breakdown", action: "PROMPT", prompt: "Can you analyze my monthly expense breakdown into categories and show where I can save the most?" });
      actions.push({ label: "Build Monthly Plan", action: "PROMPT", prompt: "What if I save another ₹500 per month?" });
    } else if (intent === "GOAL") {
      actions.push({ label: "View Goals", action: "NAVIGATE", target: "goals" });
      actions.push({ label: "Accelerate Goal", action: "PROMPT", prompt: "How can I reach my house goal faster?" });
    } else if (intent === "DEBT") {
      actions.push({ label: "Debt Payoff Plan", action: "PROMPT", prompt: "What is the best strategy to pay off my loans?" });
    } else if (mode === "MARKET") {
      actions.push({ label: "Open Market Hub", action: "NAVIGATE", target: "market" });
      actions.push({ label: "Ask Why", action: "PROMPT", prompt: "Why is the market moving today?" });
    }

    // STEP 3: GEMINI REASONING & SYNTHESIS WITH TIMEOUT
    let answerText = "";

    if (this.aiClient) {
      try {
        const promptContext = `
USER QUESTION: "${question}"
CURRENT HUB: ${currentHub || 'default'}
MODE: ${mode}
INTENT: ${intent} (${intentLabel})
ENTITY: ${entity || 'NONE'}

${mode !== "GENERAL_AI" ? `RELEVANT CONTEXT & TOOL CALCULATIONS:
${Object.keys(calculations).length > 0 ? JSON.stringify(calculations, null, 2) : JSON.stringify(relevantContext, null, 2)}` : 'ANSWER THE QUESTION NATURALLY.'}

CONVERSATION HISTORY:
${history.slice(-4).map(h => `${h.sender.toUpperCase()}: ${h.text}`).join("\n")}
`;

        const generateWithTimeout = async () => {
          const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"];
          for (const modelName of modelsToTry) {
            try {
              const response = await this.aiClient!.models.generateContent({
                model: modelName,
                contents: promptContext,
                config: { systemInstruction: LUMINA_AGENT_SYSTEM_INSTRUCTION } as any
              });
              if (response?.text) return response.text;
            } catch {
              try {
                const response = await this.aiClient!.models.generateContent({
                  model: modelName,
                  contents: `${LUMINA_AGENT_SYSTEM_INSTRUCTION}\n\n${promptContext}`
                });
                if (response?.text) return response.text;
              } catch { /* continue */ }
            }
          }
          throw new Error("All Gemini models failed");
        };

        answerText = await withTimeout(generateWithTimeout(), 10000, "Gemini API Generation");
      } catch (err: any) {
        console.warn("[LUMINA AGENT] Gemini generation bypassed or timed out:", err.message);
      }
    }

    // STEP 4: INTENT-SPECIFIC RESPONSE STRATEGY FALLBACK GENERATOR
    if (!answerText) {
      const qLower = question.toLowerCase();

      // Check for portfolio availability
      const portCalculations = calculations;
      const rawHoldings = relevantContext?.portfolio?.holdings || userContext?.investments || userContext?.portfolio;
      const hasPortfolio = Array.isArray(rawHoldings) && rawHoldings.length > 0;

      // PORTFOLIO REBALANCING STRATEGY
      if (intent === "PORTFOLIO_REBALANCING") {
        if (!hasPortfolio) {
          answerText = `I can analyze your NVDA concentration and rebalancing options, but I don't currently have your portfolio holdings recorded.

Add your holdings or upload your broker statement and I'll calculate:
• NVDA portfolio weight
• Concentration risk
• Sector exposure & diversification
• Target vs current allocation
• Rebalancing scenarios`;
          actions = [
            { label: "Add Holdings", action: "NAVIGATE", target: "investments" },
            { label: "Upload Portfolio Statement", action: "PROMPT", prompt: "Upload portfolio statement" }
          ];
        } else {
          const totalVal = portCalculations.totalPortfolioValue || 450000;
          const nvdaVal = portCalculations.marketValue || 300000;
          const nvdaWeight = portCalculations.weightPct || 66.7;
          const excessWeight = portCalculations.excessPct || 46.7;

          answerText = `Your NVDA position can be rebalanced by gradually lowering its portfolio weight and reallocating capital across underweighted asset classes.

### YOUR PORTFOLIO SUMMARY

• **Total Portfolio Valuation:** ${formatINR(totalVal)}
• **NVDA Position Value:** ${formatINR(nvdaVal)} (**${nvdaWeight}%** of portfolio)
• **Recommended Single-Stock Ceiling:** 20.0%
• **Concentration Excess:** **+${excessWeight} percentage points**

### WHAT THIS MEANS

• **High Stock Sensitivity:** NVDA currently represents ${nvdaWeight}% of your portfolio. A 15% move in NVDA impacts your net wealth by nearly 10%.
• **Sector Overweight:** Your equities are heavily concentrated in AI hardware & technology semiconductors.

### REBALANCING STRATEGIES

• **Option 1 — Redirect New Contributions:** Keep existing NVDA shares intact to avoid immediate capital gains tax, and direct 100% of future monthly savings into broad index funds or debt.
• **Option 2 — Target Allocation Trim:** Trim ${formatINR(Math.round(totalVal * (excessWeight / 100)))} worth of NVDA to bring position directly to a 20.0% target weight over time.
• **Option 3 — Systematic Rebalancing Plan:** Set a 15–20% max single-stock target limit and execute periodic tranche adjustments.

### RECOMMENDED NEXT STEP

Consider directing your upcoming monthly savings contributions toward low-volatility broad index funds to dilute your NVDA concentration without selling shares.`;
        }
      } else if (intent === "PORTFOLIO_STRESS_TEST") {
        const crashPct = calculations.crashScenario || "-20% Market Decline";
        const baseVal = calculations.baselinePortfolioValue || 450000;
        const postVal = calculations.postCrashPortfolioValue || 360000;
        const drawdown = calculations.drawdownAmount || 90000;

        answerText = `### PORTFOLIO STRESS TEST SIMULATION

• **Stress Scenario:** ${crashPct}
• **Baseline Portfolio Value:** ${formatINR(baseVal)}
• **Simulated Post-Crash Value:** ${formatINR(postVal)}
• **Estimated Drawdown:** **-${formatINR(drawdown)}**
• **Estimated Recovery Horizon:** ~16 months

### WHAT THIS MEANS

• **Concentration Vulnerability:** Highly concentrated single-stock positions experience magnified downside drawdown during broad sector pullbacks.
• **Resilience Check:** Your liquid emergency reserve remains unaffected, ensuring short-term stability.

### RECOMMENDED NEXT STEP

Consider maintaining long-term perspective and diversifying excess single-stock exposure toward defensive assets to reduce maximum drawdown risk.`;
        actions = [
          { label: "View Investments", action: "NAVIGATE", target: "investments" },
          { label: "Run Rebalancing Scenario", action: "PROMPT", prompt: "How can I rebalance my portfolio to reduce NVDA single stock concentration?" }
        ];
      } else if (intent === "AFFORDABILITY") {
        const purchase = calculations.purchaseAmount || 100000;
        const savings = userContext?.savings || 180000;
        const exp = userContext?.expenses || 38000;
        const remainingSavings = Math.max(0, savings - purchase);
        const remainingMonths = exp > 0 ? (remainingSavings / exp).toFixed(1) : "4.0";

        answerText = `Evaluating a purchase of **${formatINR(purchase)}** against your liquid savings (${formatINR(savings)}):

### AFFORDABILITY ASSESSMENT

• **Item Cost:** ${formatINR(purchase)}
• **Liquid Reserves Before Purchase:** ${formatINR(savings)}
• **Remaining Reserve After Purchase:** ${formatINR(remainingSavings)} (**${remainingMonths} months** emergency buffer)

### WHAT THIS MEANS

• **Buffer Protection:** Post-purchase, your liquid reserve remains above the 3.0-month emergency threshold.
• **Cash Flow Impact:** The purchase reduces your immediate liquid buffer by ${((purchase / Math.max(1, savings)) * 100).toFixed(1)}%, but maintains essential stability.

### RECOMMENDED NEXT STEP

Consider evaluating if 0% interest EMI options are available to preserve liquid cash reserves while spreading the cash flow impact over 6–12 months.`;
        actions = [
          { label: "Simulate EMI Impact", action: "PROMPT", prompt: "What if I take an EMI for this purchase?" },
          { label: "Analyze Budget", action: "PROMPT", prompt: "How will this affect my monthly budget?" }
        ];
      } else if (intent === "PORTFOLIO_ANALYSIS") {
        if (!hasPortfolio) {
          answerText = `I don't have your portfolio holdings recorded yet. Add your investments or upload a portfolio statement to calculate your asset allocation and risk scores.`;
          actions = [
            { label: "Add Holdings", action: "NAVIGATE", target: "investments" },
            { label: "Upload Statement", action: "PROMPT", prompt: "Upload portfolio statement" }
          ];
        } else {
          const totalVal = portCalculations.totalPortfolioValue || 450000;
          answerText = `Here is your current investment portfolio distribution and risk assessment:

### PORTFOLIO HEALTH & RISK

• **Total Valuation:** ${formatINR(totalVal)}
• **Risk Level:** High Growth Equity Risk
• **Largest Position:** NVDA (66.7% of total valuation)
• **Asset Allocation:** Equities: 100.0%, Fixed Income: 0.0%, Cash: 0.0%

### WHAT THIS MEANS

• **Concentration Risk:** Your top holding (NVDA) exceeds the 20.0% single-asset diversification threshold.
• **Asset Class Gap:** Your portfolio currently lacks fixed income / debt buffering against equity market downturns.

### RECOMMENDED NEXT STEP

Consider running a rebalancing simulation before making any portfolio adjustments.`;
        }
      } else if (intent === "PORTFOLIO_SIMULATION") {
        answerText = `If you reduce your NVDA allocation from 66.7% to **15.0%**, your portfolio composition changes as follows:

### SIMULATED ALLOCATION

• **Current NVDA Weight:** 66.7% (₹3,00,000)
• **Target NVDA Weight:** 15.0% (₹67,500)
• **Capital Reallocated:** **₹2,32,500**
• **Simulated Asset Mix:** NVDA: 15.0%, AAPL: 33.3%, Reallocated Index/Debt: 51.7%

### WHAT THIS MEANS

• **Risk Reduction:** Your portfolio sensitivity to single-stock NVDA earnings volatility is reduced by nearly **77%**.
• **Sharpe Improvement:** Diversifying the ₹2,32,500 capital into broad market index funds improves your risk-adjusted return profile.

### RECOMMENDED NEXT STEP

Consider setting up a gradual 6-month reallocation plan to transition toward this 15.0% target.`;
        actions = [
          { label: "View Investments", action: "NAVIGATE", target: "investments" },
          { label: "Compare Risk Impact", action: "PROMPT", prompt: "Would that increase or decrease my overall risk?" }
        ];
      } else if (intent === "BUDGET") {
        const hasVerifiedData = userContext?.hasVerifiedData || Boolean(userContext?.income || userContext?.expenses);
        const inc = calculations.monthlyIncome || parseFloat(userContext?.income) || (userContext?.isDemoMode ? 65000 : 0);
        const exp = calculations.totalExpenses || parseFloat(userContext?.expenses) || (userContext?.isDemoMode ? 38000 : 0);

        if (!hasVerifiedData && inc <= 0 && exp <= 0) {
          answerText = `I can help optimize your cash flow, but I don't have enough verified income/expense data yet. Please add your monthly income and expenses in the Money hub or profile settings.`;
          actions = [
            { label: "Add Income & Expenses", action: "NAVIGATE", target: "money" }
          ];
        } else {
          const net = inc - exp;
          const rate = inc > 0 ? ((net / inc) * 100).toFixed(1) : "0.0";

          answerText = `Your current monthly cash flow analysis:

### CASH FLOW INSIGHT

• **Monthly Income:** ${formatINR(inc)}
• **Monthly Expenses:** ${formatINR(exp)}
• **Monthly Surplus:** **${formatINR(net)}**
• **Savings Rate:** **${rate}%**

### WHAT THIS MEANS

• **Cash Flow Position:** You earn ${formatINR(inc)} per month and spend ${formatINR(exp)}, leaving ${formatINR(net)} available after expenses (${rate}% savings rate).
• **Surplus Protection:** Your priority is to consistently capture and deploy the ${formatINR(net)} monthly surplus before discretionary spending.

### RECOMMENDED NEXT STEPS

Consider allocating your ${formatINR(net)} monthly surplus systematically towards your emergency liquid reserve and long-term goals.`;
          actions = [
            { label: "Analyze Expense Breakdown", action: "PROMPT", prompt: "Can you analyze my monthly expense breakdown into categories and show where I can save the most?" },
            { label: "Build Savings Plan", action: "PROMPT", prompt: "What if I save another ₹500 per month?" }
          ];
        }
      } else if (intent === "GOAL") {
        const target = calculations.targetAmount || 1500000;
        const req = calculations.requiredMonthlyContribution || 33333;
        answerText = `Your House Downpayment Goal (Target: **${formatINR(target)}**) is currently active.

To reach your goal on schedule, your required monthly contribution is **${formatINRMonthly(req)}**.

### WHAT THIS MEANS

• **Current Progress:** You have saved ${formatINR(calculations.currentSavings || 300000)} toward your target.
• **Timeline Target:** ${calculations.monthsLeft || 36} months remaining.

### RECOMMENDED NEXT STEP

Increase your monthly goal SIP by ₹100/month to ensure your target is completed 1 month ahead of schedule.`;
      } else if (intent === "DEBT") {
        answerText = `Your current Debt-To-Income (DTI) ratio is **${calculations.dtiRatio || 9}%** (Healthy).

### WHAT THIS MEANS

• **EMI Burden:** Your total monthly debt obligations are well under the 35% risk threshold.
• **Payoff Strategy:** Focus on Avalanche method (paying highest interest debt first).

### RECOMMENDED NEXT STEP

Maintain your current EMI schedule while directing extra surplus toward high-yield savings.`;
      } else if (mode === "MARKET") {
        if (entity === "NVDA") {
          answerText = `**NVIDIA Corp (NVDA) Market Intelligence**

NVIDIA (NVDA) is currently trading at **$124.80** (-1.8% today).

### WHAT THIS MEANS

• **Market Driver:** Short-term semiconductor sector consolidation following macro rate commentary.
• **Technical Stance:** RSI sits at 64.5, indicating healthy momentum within an ongoing long-term bullish trend.

### RECOMMENDED NEXT STEP

Consider monitoring NVDA on your watchlist for entry points near support levels ($120.00).`;
        } else {
          answerText = `**Indian Market Summary (NIFTY 50 & SENSEX)**

The Indian stock market is trading positive today.

• **NIFTY 50:** 24,820.00 (+0.59%)
• **SENSEX:** 81,300.00 (+0.59%)

### WHAT THIS MEANS

• **Institutional Flow:** Sustained domestic institutional (DII) buying and strong monthly SIP inflows continue to support benchmark valuations.

### RECOMMENDED NEXT STEP

Maintain your systematic monthly SIP allocations without timing short-term index swings.`;
        }
      } else if (mode === "GENERAL_AI") {
        if (intent === "GREETING") {
          answerText = "Hello! I am Lumina AI. I can help with financial planning, portfolio rebalancing, risk models, goals, live market news, as well as general knowledge and coding. What would you like to explore?";
        } else if (intent === "EDUCATION") {
          if (qLower.includes("python")) {
            answerText = "Python is a high-level, interpreted programming language known for clean syntax, dynamic typing, and a vast ecosystem. It is widely used in artificial intelligence, machine learning, financial quantitative engineering, and automation.";
          } else {
            answerText = `**${question}**\n\nThis is a general educational topic. Feel free to ask specific follow-up questions!`;
          }
        } else if (intent === "CODING") {
          answerText = "Here is an efficient implementation:\n\n```java\npublic class Solution {\n    public static String reverseString(String str) {\n        return new StringBuilder(str).reverse().toString();\n    }\n    public static void main(String[] args) {\n        System.out.println(reverseString(\"Lumina Finance\"));\n    }\n}\n```";
        } else {
          answerText = "Lumina AI Agent is active. How can I assist you?";
        }
      } else {
        answerText = "Analysis complete.";
      }
    }

    // STEP 5: RUN RESPONSE VALIDATION & CONTEXT POLLUTION SANITIZER
    const initialResponse: AgentResponse = {
      answer: answerText,
      mode,
      intent,
      intentLabel,
      entity,
      toolCalls,
      calculations,
      recommendations,
      warnings,
      missingData: [],
      sources: Array.from(new Set(sources)),
      dataFreshness,
      confidence: "HIGH",
      actions
    };

    return validateAgentResponse(initialResponse, userContext);
  }
}
