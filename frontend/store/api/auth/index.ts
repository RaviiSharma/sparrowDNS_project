import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL

// Define a service using a base URL and expected endpoints
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${baseUrl}/api`,
    credentials: 'include'
  }),
  
  endpoints: (build) => ({
    login: build.mutation<any, { email: string, password: string }>({
      query: ({ email, password }) => ({
        url: '/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { email, password },
      }),
    }),
    register: build.mutation<any, { username: string, email: string, password: string }>({
      query: ({ username, email, password }) => ({
        url: '/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { username, email, password },
      }),
    }),
    getUser: build.query<any, void>({
      query: () => '/auth/user',
    }),
    logout: build.mutation<any, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    updateProfile: build.mutation<any, any>({
      query: (body) => ({
        url: '/user/update-profile',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUserQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
} = authApi
