import { RecentActivity } from "./recent-activity";
import { QueryPerformance } from "./query-performance";
import { TopDomains } from "./top-domains";

export const DashboardRightColumn = () => {
  return (
    <div className="space-y-6">
      <RecentActivity />
      <QueryPerformance />
      <TopDomains />
    </div>
  );
};