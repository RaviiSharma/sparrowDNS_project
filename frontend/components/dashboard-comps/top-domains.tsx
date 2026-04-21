"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetTopDomainsQuery } from "@/store/api/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

// Fallback data in case API fails
const fallbackDomains = [
  {
    domain: "api.example.com",
    queries: "342K",
    percentage: 85,
  },
  {
    domain: "cdn.example.com",
    queries: "198K",
    percentage: 49,
  },
  {
    domain: "app.example.com",
    queries: "156K",
    percentage: 39,
  },
  {
    domain: "www.example.com",
    queries: "124K",
    percentage: 31,
  },
  {
    domain: "mail.example.com",
    queries: "89K",
    percentage: 22,
  },
];

export const TopDomains = () => {
  const { data: topDomainsData, isLoading, error } = useGetTopDomainsQuery({
    limit: 5
  });

  // Format number to K/M
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  // Map API data to component format
  const mapDomainsData = (data: any[]) => {
    if (!data || data.length === 0) return fallbackDomains;

    // Find the maximum query count to calculate percentages
    const maxQueries = Math.max(...data.map(item => item.queries));
    
    return data.map((item, index) => ({
      domain: item.zone || item.domain || `domain-${index + 1}`,
      queries: formatNumber(item.queries),
      percentage: maxQueries > 0 ? Math.round((item.queries / maxQueries) * 100) : 0,
      rawQueries: item.queries
    }));
  };

  // Use API data if available, otherwise fallback
  const domains = topDomainsData?.data 
    ? mapDomainsData(topDomainsData.data)
    : fallbackDomains;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Domains</CardTitle>
          <CardDescription>By query volume (24h)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-1.5 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !topDomainsData) {
    console.error("Failed to fetch top domains:", error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Domains</CardTitle>
        <CardDescription>
          {error && !topDomainsData 
            ? "Using sample data - API connection failed" 
            : "By query volume (24h)"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {domains.map((item, index) => (
            <div key={`${item.domain}-${index}`} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs truncate max-w-[180px]">
                  {item.domain}
                </span>
                <span className="font-medium">{item.queries}</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary">
                <div
                  className="h-1.5 rounded-full bg-primary"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};