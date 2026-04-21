import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL

// Define a service using a base URL and expected endpoints
export const apiKeysApi = createApi({
  reducerPath: 'apiKeysApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${baseUrl}/api/apikey`,
    credentials: 'include'
  }),
  
  endpoints: (build) => ({
    getApiKeys: build.query<any, void>({
      query: () => '/',
    }),
    createApiKey: build.mutation<any, { name: string, scope?: string, expiresAt?: string }>({
      query: (body) => ({
        url: '/createApiKey',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
    }),
    updateApiKey: build.mutation<any, { id: string, name?: string, scope?: string, status?: string;  }>({
      query: ({ id, ...body }) => ({
        url: `/updateApiKey/${id}`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
    }),
    deleteApiKey: build.mutation<any, string>({
      query: (id) => ({
        url: `/deleteApiKey/${id}`,
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    getApiUsage: build.query<any, void>({
      query: () => '/getApiKeyUsage',
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useUpdateApiKeyMutation,
  useDeleteApiKeyMutation,
  useGetApiUsageQuery,
} = apiKeysApi
