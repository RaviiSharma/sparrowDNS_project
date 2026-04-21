import { StatCard } from "@/components/stat-card";
import { Globe, Activity, CheckCircle2, AlertCircle } from "lucide-react";

interface DashboardStatsProps {
  healthData: any;
  zonesData: any;
  queries24hData: any;
}

export const DashboardStats = ({ healthData, zonesData, queries24hData }: DashboardStatsProps) => {
  // Calculate health percentage and details
  let healthPercentage = 0;
  let healthDescription = "All systems operational";
  if (healthData && healthData.data) {
    const checks = Object.entries(healthData.data).filter(
      ([key, value]) => key !== "details" && typeof value === "boolean"
    );
    const totalChecks = checks.length;
    const passedChecks = checks.filter(([_, value]) => value === true).length;
    healthPercentage =
      totalChecks > 0
        ? Math.round((passedChecks / totalChecks) * 1000) / 10
        : 0;
    healthDescription = healthData.message || healthDescription;
  }

  // Format number to K/M
  const formatNumber = (num?: number) => {
    if (typeof num !== "number" || isNaN(num)) return "—"
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K"
    return num.toString()
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Zones"
        value={zonesData?.count || 0}
        description="Across 3 accounts"
        icon={Globe}
        trend={{ value: "12% from last month", positive: true }}
      />
      <StatCard
        title="Queries (24h)"
        value={formatNumber(queries24hData?.data?.totalQueries24h) || 0}
        description={`Avg response: ${queries24hData?.data?.avgResponseTime}`}
        icon={Activity}
        trend={{ value: `${queries24hData?.data?.changeFromYesterday}% from yesterday`, positive: true }}
      />
      <StatCard
        title="Health Status"
        value={`${healthPercentage}%`}
        description={healthDescription}
        icon={CheckCircle2}
        trend={{ value: "0.1% from last week", positive: true }}
      />
      <StatCard
        title="Active Alerts"
        value="2"
        description="1 warning, 1 info"
        icon={AlertCircle}
      />
    </div>
  );
};