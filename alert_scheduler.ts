import { NotificationService } from "./notification_service";

let schedulerTimerId: NodeJS.Timeout | null = null;
let isSchedulerRunning = false;

export interface SchedulerConfig {
  intervalMinutes?: number;
  activeUserIds?: string[];
  getUserContext?: (userId: string) => Promise<any>;
  getMarketData?: () => Promise<any[]>;
}

export function startAlertScheduler(config: SchedulerConfig = {}): boolean {
  const intervalMinutes = config.intervalMinutes || parseInt(process.env.ALERT_EVALUATION_INTERVAL_MINUTES || "60", 10);
  const intervalMs = intervalMinutes * 60 * 1000;

  if (isSchedulerRunning && schedulerTimerId !== null) {
    console.log(`[ALERT SCHEDULER] Scheduler is already active (interval: ${intervalMinutes} mins). Skipping duplicate instantiation.`);
    return false;
  }

  isSchedulerRunning = true;
  console.log(`[ALERT SCHEDULER] Starting Lumina Proactive Alert Scheduler (Interval: ${intervalMinutes} minutes)...`);

  const runEvaluationTask = async () => {
    try {
      console.log(`[ALERT SCHEDULER] Running periodic proactive alert evaluation at ${new Date().toISOString()}...`);
      const userIds = config.activeUserIds || ["demo_user", "default_user"];
      const service = NotificationService.getInstance();

      const marketData = config.getMarketData ? await config.getMarketData() : [];

      for (const userId of userIds) {
        const userContext = config.getUserContext ? await config.getUserContext(userId) : {
          monthlyIncome: 5000,
          monthlyExpenses: 3000,
          savings: 6300,
          targetEquityPct: 60,
          currentEquityPct: 72,
          investments: [{ ticker: "NVDA", name: "NVIDIA Corp", value: 300000 }]
        };

        const updatedAlerts = await service.evaluateAndStoreAlerts(userId, userContext, marketData);
        console.log(`[ALERT SCHEDULER] Evaluated ${updatedAlerts.length} active alerts for user ${userId}. Unread: ${service.getUnreadCount(userId)}`);
      }
    } catch (err) {
      console.error("[ALERT SCHEDULER] Error during periodic evaluation:", err);
    }
  };

  // Run initial evaluation
  runEvaluationTask();

  // Schedule recurring interval
  schedulerTimerId = setInterval(runEvaluationTask, intervalMs);

  return true;
}

export function stopAlertScheduler(): void {
  if (schedulerTimerId !== null) {
    clearInterval(schedulerTimerId);
    schedulerTimerId = null;
  }
  isSchedulerRunning = false;
  console.log("[ALERT SCHEDULER] Lumina Proactive Alert Scheduler stopped.");
}

export function isAlertSchedulerRunning(): boolean {
  return isSchedulerRunning;
}
