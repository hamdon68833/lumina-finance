import { JournalEntry } from "./src/types";

export class DecisionJournalEngine {
  private static journal: JournalEntry[] = [
    {
      id: "j_1",
      date: "2026-08-15",
      decisionTitle: "Allocated ₹20,000 to Index Fund",
      category: "INVESTMENT",
      amount: { amount: 20000, currency: "INR" },
      rationale: "Long-term rupee-cost averaging into broad market index.",
      expectedOutcome: "8-10% CAGR wealth growth over 5-year horizon.",
      riskLevel: "Medium",
      actualOutcome: "On track with +2.4% gain in first month.",
      alignedWithPlan: true
    },
    {
      id: "j_2",
      date: "2026-08-01",
      decisionTitle: "Postponed Smartphone Purchase",
      category: "EXPENSE",
      amount: { amount: 80000, currency: "INR" },
      rationale: "Avoided drawing down emergency fund reserve.",
      expectedOutcome: "Preserved 6-month liquidity buffer.",
      riskLevel: "Low",
      actualOutcome: "Emergency reserves remain 100% intact.",
      alignedWithPlan: true
    }
  ];

  public static getEntries(): JournalEntry[] {
    return this.journal;
  }

  public static addEntry(entry: Partial<JournalEntry>): JournalEntry {
    const newEntry: JournalEntry = {
      id: `j_${Date.now()}`,
      date: entry.date || new Date().toISOString().split("T")[0],
      decisionTitle: entry.decisionTitle || "Financial Decision",
      category: entry.category || "GENERAL",
      amount: entry.amount || { amount: 0, currency: "INR" },
      rationale: entry.rationale || "Educational decision tracking.",
      expectedOutcome: entry.expectedOutcome || "Positive financial health impact.",
      riskLevel: entry.riskLevel || "Low",
      alignedWithPlan: entry.alignedWithPlan ?? true
    };
    this.journal.push(newEntry);
    return newEntry;
  }
}
