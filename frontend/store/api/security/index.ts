import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export const securityApi = createApi({
  reducerPath: "securityApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/security`,
    credentials: "include",
  }),
  tagTypes: ["SecurityLogs", "SecurityOverview", "SecurityStats"],
  endpoints: (build) => ({
    getSecurityLogs: build.query<
      any,
      { limit?: number; event?: string; status?: string; severity?: string }
    >({
      query: (params = {}) => ({
        url: "/logs",
        params,
      }),
      providesTags: ["SecurityLogs"],
    }),
    getAllSecurityLogs: build.query<
      any,
      { limit?: number; userId?: string; event?: string; status?: string }
    >({
      query: (params = {}) => ({
        url: "/logs/all",
        params,
      }),
      providesTags: ["SecurityLogs"],
    }),
    logSecurityEvent: build.mutation<any, any>({
      query: (data) => ({
        url: "/logs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SecurityLogs", "SecurityOverview", "SecurityStats"],
    }),
    getSecurityOverview: build.query<any, void>({
      query: () => "/overview",
      providesTags: ["SecurityOverview"],
    }),
    getSecurityStats: build.query<any, void>({
      query: () => "/stats",
      providesTags: ["SecurityStats"],
    }),
  }),
});

export const {
  useGetSecurityLogsQuery,
  useGetAllSecurityLogsQuery,
  useLogSecurityEventMutation,
  useGetSecurityOverviewQuery,
  useGetSecurityStatsQuery,
} = securityApi;
