"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Globe,
  Zap,
  Activity,
  Clock,
} from "lucide-react";
import {
  useGetAnalyticsOverviewQuery,
  useGetQueryAnalyticsQuery,
  useGetPerformanceMetricsQuery,
  useGetGeographicAnalyticsQuery,
} from "@/store/api/analytics";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");

  const { data: overviewData, isLoading: overviewLoading } = useGetAnalyticsOverviewQuery({ timeRange });
  const { data: queryData, isLoading: queryLoading } = useGetQueryAnalyticsQuery({ timeRange });
  const { data: performanceData, isLoading: performanceLoading } = useGetPerformanceMetricsQuery({ timeRange });
  const { data: geoData, isLoading: geoLoading } = useGetGeographicAnalyticsQuery();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="queries">Query Analytics</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="geo">Geographic</TabsTrigger>
            </TabsList>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {overviewLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="text-muted-foreground">Loading analytics...</div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Queries
                      </CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {overviewData?.data?.totalQueries?.toLocaleString() || '0'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last {timeRange}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Avg Response Time
                      </CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {overviewData?.data?.avgLatency || 0}ms
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average latency
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {overviewData?.data?.uptime || 99.99}%
                      </div>
                      <p className="text-xs text-muted-foreground">Last {timeRange}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Zones
                      </CardTitle>
                      <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="">+2</span> new this month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Query Volume</CardTitle>
                <CardDescription>DNS queries over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border border-dashed border-border rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chart visualization would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Queried Domains</CardTitle>
                  <CardDescription>Most requested domains</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        domain: "example.com",
                        queries: "842K",
                        percentage: 35,
                      },
                      {
                        domain: "api.example.com",
                        queries: "621K",
                        percentage: 26,
                      },
                      {
                        domain: "cdn.example.com",
                        queries: "512K",
                        percentage: 21,
                      },
                      {
                        domain: "mail.example.com",
                        queries: "425K",
                        percentage: 18,
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-mono">{item.domain}</span>
                          <span className="text-muted-foreground">
                            {item.queries}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-accent"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Query Types</CardTitle>
                  <CardDescription>Distribution by record type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: "A", count: "1.2M", percentage: 50 },
                      { type: "AAAA", count: "480K", percentage: 20 },
                      { type: "CNAME", count: "360K", percentage: 15 },
                      { type: "MX", count: "240K", percentage: 10 },
                      { type: "TXT", count: "120K", percentage: 5 },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-mono font-medium">
                            {item.type}
                          </span>
                          <span className="text-muted-foreground">
                            {item.count}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-accent"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="queries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Query Analytics</CardTitle>
                <CardDescription>
                  Detailed query metrics and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border border-dashed border-border rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Query analytics visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Response times and latency analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border border-dashed border-border rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Performance metrics visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Query origins by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border border-dashed border-border rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Geographic map visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
