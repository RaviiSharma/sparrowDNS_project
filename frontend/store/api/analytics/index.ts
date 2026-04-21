import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/analytics`,
    credentials: "include",
  }),
  tagTypes: ["Analytics"],
  endpoints: (build) => ({
    getAnalyticsOverview: build.query<any, { timeRange?: string }>({
      query: (params = {}) => ({
        url: "/overview",
        params: { timeRange: params.timeRange || "7d" },
      }),
      providesTags: ["Analytics"],
    }),
    getQueryAnalytics: build.query<any, { timeRange?: string }>({
      query: (params = {}) => ({
        url: "/queries",
        params: { timeRange: params.timeRange || "7d" },
      }),
      providesTags: ["Analytics"],
    }),
    getPerformanceMetrics: build.query<any, { timeRange?: string }>({
      query: (params = {}) => ({
        url: "/performance",
        params: { timeRange: params.timeRange || "7d" },
      }),
      providesTags: ["Analytics"],
    }),
    getGeographicAnalytics: build.query<any, void>({
      query: () => "/geographic",
      providesTags: ["Analytics"],
    }),
  }),
});

export const {
  useGetAnalyticsOverviewQuery,
  useGetQueryAnalyticsQuery,
  useGetPerformanceMetricsQuery,
  useGetGeographicAnalyticsQuery,
} = analyticsApi;
