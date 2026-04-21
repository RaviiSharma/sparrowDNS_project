import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${baseUrl}/api`,
    credentials: 'include' 
  }),
  tagTypes: ['Health', 'RecentActivity', 'TopDomains', 'Users'],
  endpoints: (build) => ({
    checkHealth: build.query<any, void>({
      query: () => '/dns/health',
      providesTags: ['Health'],
    }),
    getRecentActivity: build.query<any, { limit?: number; userId?: string; before?: string; action?: string }>({
      query: (params = {}) => ({
        url: '/dns/getRecentActivity',
        params: {
          limit: params.limit || 20,
          ...(params.userId && { userId: params.userId }),
          ...(params.before && { before: params.before }),
          ...(params.action && { action: params.action }),
        },
      }),
      providesTags: ['RecentActivity'],
    }),
    getTopDomains: build.query<any, { limit?: number }>({
      query: (params = {}) => ({
        url: '/dns/top-domains',
        params: {
          limit: params.limit || 10,
        },
      }),
      providesTags: ['TopDomains'],
    }),
    getAllUsers: build.query<any, void>({
      query: () => '/admin/users',
      providesTags: ['Users'],
    }),
    transferDomain: build.mutation<any, { domainId?: string; domainName?: string; targetUserId: string }>({
      query: (data) => ({
        url: '/dns/transfer-domain',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RecentActivity'],
    }),
  }),
})

export const {
  useCheckHealthQuery,
  useGetRecentActivityQuery,
  useGetTopDomainsQuery,
  useGetAllUsersQuery,
  useTransferDomainMutation,
} = dashboardApi