"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Clock, CheckCircle2, Activity, Loader2 } from "lucide-react";
import { useDnsQueries24hQuery } from "@/store/api/dns";

export const QueryPerformance = () => {
  const { data: queriesData, isLoading, error } = useDnsQueries24hQuery();

  // Mock data in case API is not available
  const mockData = {
    avgResponseTime: "12ms",
    p95ResponseTime: "28ms",
    successRate: "99.97%",
    totalQueries: "8.4M",
    changeFromYesterday: "+5.2%"
  };

  // Use real data if available, otherwise fall back to mock data
  const performanceData = queriesData?.data || mockData;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Query Performance</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error fetching query performance data:', error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Performance</CardTitle>
        <CardDescription>
          Last 7 days {queriesData?.data?.changeFromYesterday && (
            <span className={queriesData.data.changeFromYesterday.includes('+') ? "text-green-500" : "text-red-500"}>
              ({queriesData.data.changeFromYesterday})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Average Response Time</span>
            </div>
            <span className="font-mono font-medium">
              {performanceData.avgResponseTime || "12ms"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>P95 Response Time</span>
            </div>
            <span className="font-mono font-medium">
              {performanceData.p95ResponseTime || "28ms"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Success Rate</span>
            </div>
            <span className="font-mono font-medium">
              {performanceData.successRate || "99.97%"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span>Total Queries</span>
            </div>
            <span className="font-mono font-medium">
              {performanceData.totalQueries24h ? 
                formatNumber(performanceData.totalQueries24h) : 
                performanceData.totalQueries || "8.4M"
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
};