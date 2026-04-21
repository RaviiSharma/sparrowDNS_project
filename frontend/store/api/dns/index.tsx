import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export const dnspi = createApi({
  reducerPath: "dnsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/dns`,
    credentials: "include",
  }),
  tagTypes: ['Zones', 'Records', 'ZoneStats'],

  endpoints: (build) => ({
    getZones: build.query<any, void>({
      query: () => "/my-zones",
      providesTags: ['Zones'],
    }),
    deleteZone: build.mutation<any, string>({
      query: (zoneName) => ({
        url: "/delete-zone",
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: { zoneName },
      }),
      invalidatesTags: ['Zones'],
    }),
    scanDomain: build.mutation<any, { domain: string }>({
      query: ({ domain }) => ({
        url: "/scan",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { domain },
      }),
    }),
    zoneImport: build.mutation<any, { domain: string; importRecords: boolean }>({
      query: ({ domain, importRecords }) => ({
        url: "/import-zone",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { domain, importRecords },
      }),
      invalidatesTags: ['Zones', 'Records'],
    }),
    getRecords: build.query<any, { zone: string }>({
      query: ({ zone }) => ({
        url: "/get-recordbyfilter",
        method: "POST",
        body: { zone },
      }),
      providesTags: (result, error, { zone }) =>
        result ? [{ type: 'Records' as const, id: zone }] : ['Records'],
    }),

    addRecord: build.mutation<
      any,
      {
        zone: string;
        recordName: string;
        type: string;
        content: string;
        ttl: number;
        priority?: number;
      }
    >({
      query: (body) => ({
        url: "/add-record",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: (result, error, { zone }) => [
        { type: 'Records', id: zone }
      ],
    }),
    updateRecord: build.mutation<
      any,
      {
        zone: string;
        recordName: string;
        type: string;
        records: any[];
        ttl?: number;
        newRecordName?: string;
      }
    >({
      query: (body) => ({
        url: "/update-record",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: (result, error, { zone }) => [
        { type: 'Records', id: zone }
      ],
    }),
    deleteRecord: build.mutation<
      any,
      { zone: string; recordName: string; type: string }
    >({
      query: (body) => ({
        url: "/delete-record",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: (result, error, { zone }) => [
        { type: 'Records', id: zone }
      ],
    }),
    zoneDnsQueries24h: build.query<any, { zone: string }>({
      query: ({ zone }) => ({
        url: "/zone_dnsQueries_24h",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { zone },
      }),
      providesTags: (result, error, { zone }) =>
        result ? [{ type: 'ZoneStats' as const, id: zone }] : ['ZoneStats'],
    }),
    dnsQueries24h: build.query<any, void>({
      query: () => "/dnsQueries_24h",
    }),
    // New optimized endpoint for bulk records fetch
    getBulkZoneRecords: build.query<
      { [zoneName: string]: any },
      string[] // array of zone names
    >({
      async queryFn(zoneNames, _queryApi, _extraOptions, fetchWithBQ) {
        const results: { [zoneName: string]: any } = {};

        // Fetch records for all zones in parallel
        const promises = zoneNames.map(async (zone) => {
          try {
            const result = await fetchWithBQ({
              url: "/get-recordbyfilter",
              method: "POST",
              body: { zone },
            });
            results[zone] = result.data;
          } catch (error) {
            results[zone] = {
              status: false,
              message: 'Failed to fetch records',
              count: 0,
              data: []
            };
          }
        });

        await Promise.all(promises);
        return { data: results };
      },
      providesTags: ['Records'],
    }),
  }),
});

// Export hooks
export const {
  useGetZonesQuery,
  useDeleteZoneMutation,
  useScanDomainMutation,
  useZoneImportMutation,
  useGetRecordsQuery,
  useAddRecordMutation,
  useUpdateRecordMutation,
  useDeleteRecordMutation,
  useZoneDnsQueries24hQuery,
  useDnsQueries24hQuery,
  useGetBulkZoneRecordsQuery, // New optimized bulk fetch hook
} = dnspi;