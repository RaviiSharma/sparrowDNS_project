import { configureStore } from "@reduxjs/toolkit";
import { dnspi } from "./api/dns/index";
import { dashboardApi } from "./api/dashboard/index";
import { authApi } from "./api/auth";
import { apiKeysApi } from "./api/api-keys";
import { analyticsApi } from "./api/analytics";
import { resellersApi } from "./api/resellers";
import { securityApi } from "./api/security";
import { integrationsApi } from "./api/integrations";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [dnspi.reducerPath]: dnspi.reducer,
      [dashboardApi.reducerPath]: dashboardApi.reducer,
      [authApi.reducerPath]: authApi.reducer,
      [apiKeysApi.reducerPath]: apiKeysApi.reducer,
      [analyticsApi.reducerPath]: analyticsApi.reducer,
      [resellersApi.reducerPath]: resellersApi.reducer,
      [securityApi.reducerPath]: securityApi.reducer,
      [integrationsApi.reducerPath]: integrationsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        dnspi.middleware,
        dashboardApi.middleware,
        authApi.middleware,
        apiKeysApi.middleware,
        analyticsApi.middleware,
        resellersApi.middleware,
        securityApi.middleware,
        integrationsApi.middleware,
      ),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
