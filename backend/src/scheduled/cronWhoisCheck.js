import cron from "node-cron";
import { checkDomainsNow } from "../services/whoisService.js";

export function startWhoisCronScheduler(options = {}) {
  const { runAtStartup = true } = options;

  if (runAtStartup) {
    checkDomainsNow()
      .then((results) => {
        console.log("Initial domain check complete. Results:", results);
      })
      .catch((err) => {
        console.error("Initial domain check error:", err);
      });
  } else {
    console.log("Skipping initial WHOIS check at startup (runAtStartup=false)");
  }

  /**Registrars use event-driven alerts, not cron.LIKE GoDaddy	Only on user change	Immediate e-mail after control panel change */
  // Schedule to run daily at 14:00 (2 PM) server local time
  cron.schedule("0 14 * * *", async () => {
    try {
      console.log("⏰ [CRON] Scheduled domain nameserver check running...");
      const results = await checkDomainsNow();
      console.log("✅ [CRON] Results:", results);
    } catch (err) {
      console.error("❌ [CRON] Error:", err.message, err);
    }
  });
}
