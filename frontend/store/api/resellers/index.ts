import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export const resellersApi = createApi({
  reducerPath: "resellersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/reseller`,
    credentials: "include",
  }),
  tagTypes: ["Resellers", "ResellerStats"],
  endpoints: (build) => ({
    getAllResellers: build.query<any, void>({
      query: () => "/",
      providesTags: ["Resellers"],
    }),
    getResellerById: build.query<any, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Resellers", id }],
    }),
    getResellerStats: build.query<any, void>({
      query: () => "/stats",
      providesTags: ["ResellerStats"],
    }),
    createReseller: build.mutation<any, any>({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Resellers", "ResellerStats"],
    }),
    updateReseller: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Resellers", id },
        "Resellers",
        "ResellerStats",
      ],
    }),
    deleteReseller: build.mutation<any, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Resellers", "ResellerStats"],
    }),
    updateResellerUsage: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/${id}/usage`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Resellers", id },
        "ResellerStats",
      ],
    }),
  }),
});

export const {
  useGetAllResellersQuery,
  useGetResellerByIdQuery,
  useGetResellerStatsQuery,
  useCreateResellerMutation,
  useUpdateResellerMutation,
  useDeleteResellerMutation,
  useUpdateResellerUsageMutation,
} = resellersApi;
