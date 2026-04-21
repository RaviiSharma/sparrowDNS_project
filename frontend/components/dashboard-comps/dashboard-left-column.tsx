import { QuickActions } from "./quick-actions";
import { BillingStatus } from "./billing-status";
import { SystemStatus } from "./system-status";

export const DashboardLeftColumn = () => {
  return (
    <div className="space-y-6">
      <QuickActions />
      <BillingStatus />
      <SystemStatus />
    </div>
  );
};