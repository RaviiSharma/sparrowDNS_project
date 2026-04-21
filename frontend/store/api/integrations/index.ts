import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export const integrationsApi = createApi({
  reducerPath: "integrationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/integrations`,
    credentials: "include",
  }),
  tagTypes: ["Webhooks", "WebhookDeliveries"],
  endpoints: (build) => ({
    getWebhooks: build.query<any, void>({
      query: () => "/webhooks",
      providesTags: ["Webhooks"],
    }),
    getWebhookById: build.query<any, string>({
      query: (id) => `/webhooks/${id}`,
      providesTags: (result, error, id) => [{ type: "Webhooks", id }],
    }),
    createWebhook: build.mutation<any, any>({
      query: (data) => ({
        url: "/webhooks",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Webhooks"],
    }),
    updateWebhook: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/webhooks/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Webhooks", id },
        "Webhooks",
      ],
    }),
    deleteWebhook: build.mutation<any, string>({
      query: (id) => ({
        url: `/webhooks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Webhooks"],
    }),
    testWebhook: build.mutation<any, string>({
      query: (id) => ({
        url: `/webhooks/${id}/test`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Webhooks", id },
        { type: "WebhookDeliveries", id },
      ],
    }),
    getWebhookDeliveries: build.query<any, { id: string; limit?: number }>({
      query: ({ id, limit = 50 }) => ({
        url: `/webhooks/${id}/deliveries`,
        params: { limit },
      }),
      providesTags: (result, error, { id }) => [
        { type: "WebhookDeliveries", id },
      ],
    }),
    rotateWebhookSecret: build.mutation<any, string>({
      query: (id) => ({
        url: `/webhooks/${id}/rotate-secret`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Webhooks", id }],
    }),
  }),
});

export const {
  useGetWebhooksQuery,
  useGetWebhookByIdQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useTestWebhookMutation,
  useGetWebhookDeliveriesQuery,
  useRotateWebhookSecretMutation,
} = integrationsApi;
