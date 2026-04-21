"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreVertical,
  CheckCircle2,
  Filter,
  Loader2,
  RefreshCw,
  Globe,
  Wifi,
  WifiOff,
} from "lucide-react";
import { DomainOnboardingDialog } from "@/components/domains-comps/domain-onboarding-dialog";

import { 
  useGetZonesQuery, 
  useDeleteZoneMutation, 
  useGetBulkZoneRecordsQuery,
  useZoneDnsQueries24hQuery
} from "@/store/api/dns";
import Link from "next/link";
import DeleteConfirmationDialog from "@/components/common/delete-confirmation-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Zone {
  _id: string;
  zoneName: string;
  owner: string;
  description: string;
  tags: string[];
  syncedWithPDNS: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id?: string;
  name?: string;
  kind?: string;
  serial?: number;
  edited_serial?: number;
  masters?: string[];
  dnssec?: boolean;
  nsec3param?: string;
  nsec3narrow?: boolean;
  soa_edit?: string;
  soa_edit_api?: string;
  api_rectify?: boolean;
  notified_serial?: number;
  last_check?: number;
  catalog?: string;
  url?: string;
  rrsets?: any[];
}

interface RecordResponse {
  status: boolean;
  message: string;
  count: number;
  data: Array<{
    comments: any[];
    name: string;
    records: Array<{
      content: string;
      disabled: boolean;
    }>;
    ttl: number;
    type: string;
  }>;
}

interface ZoneStats {
  recordCount: number;
  queries24h: string;
  lastModified: string;
  isLoading: boolean;
  isRealTime: boolean;
}

// Zone Row Component that uses the hook individually
interface ZoneRowProps {
  zone: Zone;
  allZoneRecords: Record<string, any>;
  recordsLoading: boolean;
  recordsFetching: boolean;
  realTimeEnabled: boolean;
  onDelete: (zoneName: string) => void; // Only need zone name now
}

const ZoneRow: React.FC<ZoneRowProps> = ({ 
  zone, 
  allZoneRecords, 
  recordsLoading, 
  recordsFetching, 
  realTimeEnabled,
  onDelete 
}) => {
  // Use the hook for each individual zone
  const { 
    data: zoneQueriesData, 
    isLoading: queriesLoading,
    isFetching: queriesFetching 
  } = useZoneDnsQueries24hQuery(
    { zone: zone.zoneName },
    { 
      skip: !realTimeEnabled,
      pollingInterval: realTimeEnabled ? 30000 : 0,
    }
  );

  const getZoneStats = (): ZoneStats => {
    // Get record count from real-time data
    const zoneRecordData = allZoneRecords?.[zone.zoneName];
    const recordCount = zoneRecordData?.count || 0;
    
    // Get queries from zone queries data
    const queries24h = zoneQueriesData?.data?.totalQueries24h || 0;
    
    const lastModified = zone.updatedAt
      ? new Date(zone.updatedAt).toLocaleDateString()
      : "Recently";

    const isLoading = recordsLoading || recordsFetching || queriesLoading || queriesFetching;

    return { 
      recordCount, 
      queries24h: `${queries24h}`, 
      lastModified,
      isLoading,
      isRealTime: realTimeEnabled && !isLoading
    };
  };

  const stats = getZoneStats();

  return (
    <TableRow key={zone._id}>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">
            {zone.zoneName}
          </span>
          {zone.syncedWithPDNS && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
          {stats.isRealTime && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Real-time data"></div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className="bg-accent/10 border-accent/20"
        >
          {zone.kind || "Native"}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm font-mono">
          {zone.serial || zone.edited_serial || "-"}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <span className="font-mono text-sm">
            {stats.isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              stats.recordCount
            )}
          </span>
          {stats.isRealTime && (
            <Wifi className="h-3 w-3 text-green-500" />
          )}
        </div>
      </TableCell>
      <TableCell className="text-right font-mono text-sm">
        {stats.isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin inline" />
        ) : (
          stats.queries24h
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {stats.lastModified}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Link href={`/records/${zone.zoneName}`}>
                Manage Records
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Zone Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Export Zone</DropdownMenuItem>
            <DropdownMenuItem>Transfer Domain</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(zone.zoneName)} // Only pass zone name
            >
              Delete Zone
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function DomainsPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const {
    data: zonesData,
    isLoading: zonesLoading,
    error: apiError,
    refetch: refetchZones,
  } = useGetZonesQuery();

  const [deleteZone] = useDeleteZoneMutation();
  const [zones, setZones] = useState<Zone[]>([]);
  const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<string | null>(null); // Back to just zone name
  const [isDeleting, setIsDeleting] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const router = useRouter();

  // Get all zone names for bulk records fetch
  const zoneNames = useMemo(() => 
    zones.map(zone => zone.zoneName), 
    [zones]
  );

  // Real-time records for all zones (bulk fetch with polling)
  const { 
    data: allZoneRecords, 
    isLoading: recordsLoading,
    isFetching: recordsFetching,
    refetch: refetchRecords
  } = useGetBulkZoneRecordsQuery(
    zoneNames,
    {
      skip: zoneNames.length === 0 || !realTimeEnabled,
      pollingInterval: realTimeEnabled ? 30000 : 0,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  // Auto-refresh when real-time is enabled
  useEffect(() => {
    if (realTimeEnabled && zones.length > 0) {
      const interval = setInterval(() => {
        refetchZones();
        refetchRecords();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [realTimeEnabled, zones.length, refetchZones, refetchRecords]);

  // Transform API data to match frontend interface
  const transformZoneData = (apiZones: any[]): Zone[] => {
    return apiZones.map(zone => ({
      _id: zone.id || zone._id,
      zoneName: zone.name || zone.zoneName || "",
      owner: zone.owner || "system",
      description: zone.description || `${zone.kind || 'Native'} zone`,
      tags: zone.tags || [],
      syncedWithPDNS: zone.syncedWithPDNS !== undefined ? zone.syncedWithPDNS : true,
      createdAt: zone.createdAt || new Date().toISOString(),
      updatedAt: zone.updatedAt || new Date().toISOString(),
      __v: zone.__v || 0,
      ...zone
    }));
  };

  // Set zones from API response
  useEffect(() => {
    if (zonesData && Array.isArray(zonesData)) {
      const transformedZones = transformZoneData(zonesData);
      setZones(transformedZones);
    } else if (zonesData && zonesData.status && Array.isArray(zonesData.data)) {
      const transformedZones = transformZoneData(zonesData.data);
      setZones(transformedZones);
    } else if (apiError) {
      console.error("Failed to fetch zones:", apiError);
      setZones([]);
    } else {
      setZones([]);
    }
  }, [zonesData, apiError]);

  // Filter zones based on search and status
  useEffect(() => {
    let filtered = zones;

    if (searchQuery) {
      filtered = filtered.filter((zone) =>
        zone.zoneName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((zone) => {
        if (statusFilter === "active") {
          return zone.kind === "Native";
        } else if (statusFilter === "secondary") {
          return zone.kind === "Secondary";
        }
        return true;
      });
    }

    setFilteredZones(filtered);
  }, [searchQuery, statusFilter, zones]);

  // Delete zone using mutation - only zone name needed
  const handleDeleteZone = (zoneName: string) => {
    setZoneToDelete(zoneName);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteZone = async () => {
    if (!zoneToDelete) return;
    
    setIsDeleting(true);
    try {
      // Send zone name directly to the API
      const result = await deleteZone(zoneToDelete).unwrap();
      
      if (result.status) {
        // Refetch both zones and records to update the table
        await Promise.all([refetchZones(), refetchRecords()]);
        
        setDeleteDialogOpen(false);
        setZoneToDelete(null);
        toast.success(`Zone "${zoneToDelete}" deleted successfully.`);
        window.location.reload()
      } else {
        toast.error(result.message || "Failed to delete zone");
      }
    } catch (err: any) {
      console.error("Delete zone error:", err);
      toast.error(err?.data?.message || "Failed to delete zone");
    } finally {
      setIsDeleting(false);
    }
  };

  // Combined refresh function
  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchZones(), refetchRecords()]);
      toast.success("All data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const toggleRealTime = () => {
    setRealTimeEnabled(!realTimeEnabled);
    toast.success(`Real-time updates ${!realTimeEnabled ? 'enabled' : 'disabled'}`);
  };

  // Show loading state only
  if (zonesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header with real-time controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search domains..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                <SelectItem value="active">Native</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Real-time toggle */}
            <Button
              onClick={toggleRealTime}
              variant={realTimeEnabled ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              {realTimeEnabled ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              {realTimeEnabled ? 'Live' : 'Paused'}
            </Button>

            {/* Single refresh button for both zones and records */}
            <Button
              onClick={handleRefreshAll}
              variant="outline"
              disabled={refreshing}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            
            <Button onClick={() => setShowOnboarding(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Domain
            </Button>
          </div>
        </div>

        {/* Real-time status indicator */}
        {realTimeEnabled && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live updates active (30s intervals)</span>
            </div>
            {(recordsFetching || refreshing) && (
              <div className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Updating data...</span>
              </div>
            )}
          </div>
        )}

        {/* Always show the table/empty state */}
        {zones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-border rounded-lg bg-muted/20">
            <Globe className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No domains configured</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get started by adding your first domain to manage DNS records and settings.
            </p>
            <Button onClick={() => setShowOnboarding(true)} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Domain
            </Button>
          </div>
        ) : (
          /* Table when zones exist */
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead className="text-right">Records</TableHead>
                  <TableHead className="text-right">Queries (24h)</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredZones.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchQuery || statusFilter !== "all"
                        ? "No zones found matching your filters"
                        : "No zones found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredZones.map((zone: Zone) => (
                    <ZoneRow
                      key={zone._id}
                      zone={zone}
                      allZoneRecords={allZoneRecords || {}}
                      recordsLoading={recordsLoading}
                      recordsFetching={recordsFetching}
                      realTimeEnabled={realTimeEnabled}
                      onDelete={handleDeleteZone}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <DomainOnboardingDialog
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onSuccess={() => {
          refetchZones();
          refetchRecords();
        }}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        record={zoneToDelete} // Just pass the zone name
        isLoading={isDeleting}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setZoneToDelete(null);
        }}
        onDelete={confirmDeleteZone}
        title="Delete Zone"
        description={(zoneName) =>
          zoneName
            ? `Are you sure you want to delete the zone "${zoneName}"? This action cannot be undone.`
            : ""
        }
        cancelText="Cancel"
        deleteText="Delete"
      />
    </>
  );
}