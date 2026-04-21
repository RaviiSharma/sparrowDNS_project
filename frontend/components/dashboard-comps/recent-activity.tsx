"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetRecentActivityQuery } from "@/store/api/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

const typeColors = {
  create: "bg-accent/10 border-accent/20",
  update: "bg-primary/10 text-primary border-primary/20",
  success: "bg-accent/10 border-accent/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

// Fallback data in case API fails
const fallbackActivities = [
  {
    id: 1,
    action: "Zone created",
    target: "example.com",
    user: "admin@sparrowdns.com",
    time: "2 minutes ago",
    type: "create",
  },
  {
    id: 2,
    action: "API key rotated",
    target: "prod-api-key-1",
    user: "dev@sparrowdns.com",
    time: "15 minutes ago",
    type: "update",
  },
  {
    id: 3,
    action: "Record updated",
    target: "api.example.com (A)",
    user: "admin@sparrowdns.com",
    time: "1 hour ago",
    type: "update",
  },
  {
    id: 4,
    action: "Domain verified",
    target: "newdomain.com",
    user: "admin@sparrowdns.com",
    time: "3 hours ago",
    type: "success",
  },
  {
    id: 5,
    action: "Health check failed",
    target: "api.example.com",
    user: "system",
    time: "5 hours ago",
    type: "error",
  },
];

export function RecentActivity() {
  const {
    data: activityData,
    isLoading,
    error,
  } = useGetRecentActivityQuery({
    limit: 5,
  });

  // Format the time to relative time (e.g., "2 minutes ago")
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Map API data to component format
  const mapActivityData = (data: any[]) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((activity, index) => ({
      id: activity._id || `activity-${index}`,
      action: activity.action || "Unknown action",
      target: activity.target || "No target",
      user: activity.userId?.name || activity.userId?.email || "system",
      time: formatTime(activity.timestamp || activity.createdAt),
      type: getActivityType(activity.action),
    }));
  };

  // Determine activity type based on action
  const getActivityType = (action: string) => {
    if (action.includes("create") || action.includes("add")) return "create";
    if (action.includes("update") || action.includes("modify")) return "update";
    if (action.includes("fail") || action.includes("error")) return "error";
    if (action.includes("success") || action.includes("verify"))
      return "success";
    return "update"; // default
  };

  // Use API data if available, otherwise fallback
  const activities = activityData?.data
    ? mapActivityData(activityData.data)
    : fallbackActivities;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest changes and events in your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <Skeleton className="h-6 w-20" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !activityData) {
    console.error("Failed to fetch recent activity:", error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          {error && !activityData
            ? "Using sample data - API connection failed"
            : "Latest changes and events in your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 text-sm">
              <Badge
                variant="outline"
                className={typeColors[activity.type as keyof typeof typeColors]}
              >
                {activity.action}
              </Badge>
              <div className="flex-1 space-y-1">
                <p className="font-medium font-mono text-xs">
                  {activity.target}
                </p>
                <p className="text-xs text-muted-foreground">
                  by {activity.user} • {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
