"use client";

import { useEffect } from "react";
import { DashboardStats } from "./dashboard-stats";
import { DashboardLeftColumn } from "./dashboard-left-column";
import { DashboardRightColumn } from "./dashboard-right-column";
import { useCheckHealthQuery } from "@/store/api/dashboard";
import { useGetZonesQuery, useDnsQueries24hQuery } from "@/store/api/dns";

const DashboardPage = () => {
  const { data: healthData, refetch: refetchHealth } = useCheckHealthQuery();
  const { data: zonesData, refetch: refetchZones } = useGetZonesQuery();
  const { data: queries24hData, refetch: refetchQueries } = useDnsQueries24hQuery();
  
  useEffect(() => {
    refetchHealth();
    refetchZones();
    refetchQueries();
  }, [refetchHealth, refetchZones, refetchQueries]);

  return (
    <div className="p-6 space-y-6">
      <DashboardStats 
        healthData={healthData}
        zonesData={zonesData}
        queries24hData={queries24hData}
      />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardLeftColumn />
        <DashboardRightColumn />
      </div>
    </div>
  );
};

export default DashboardPage;