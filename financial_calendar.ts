import { CalendarEvent } from "./src/types";

export class FinancialCalendarEngine {
  public static getEvents(userContext: any): CalendarEvent[] {
    return [
      {
        id: "cal_1",
        date: "2026-08-25",
        title: "Credit Card EMI Payment",
        category: "EMI",
        amount: { amount: 3000, currency: "INR" },
        isCompleted: false
      },
      {
        id: "cal_2",
        date: "2026-09-01",
        title: "Monthly SIP Mutual Fund Investment",
        category: "Investment",
        amount: { amount: 5000, currency: "INR" },
        isCompleted: false
      },
      {
        id: "cal_3",
        date: "2026-09-05",
        title: "House Emergency Reserve Allocation",
        category: "Goal Contribution",
        amount: { amount: 2000, currency: "INR" },
        isCompleted: false
      },
      {
        id: "cal_4",
        date: "2026-09-15",
        title: "Health Insurance Annual Premium",
        category: "Insurance Renewal",
        amount: { amount: 12000, currency: "INR" },
        isCompleted: false
      }
    ];
  }
}
