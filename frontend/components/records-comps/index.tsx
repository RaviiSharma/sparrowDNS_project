"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MoreVertical,
  Upload,
  Download,
  Copy,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  useGetRecordsQuery,
  useDeleteRecordMutation,
} from "@/store/api/dns/index";
import AddEditRecordDialog from "./add-edit-record-dialog";
import DeleteConfirmationDialog from "@/components/common/delete-confirmation-dialog";

type DNSRecord = {
  id: string;
  name: string;
  type: string;
  value: string;
  ttl: number;
  priority: number | null;
  status: string;
  disabled: boolean;
};

type ApiDNSRecord = {
  comments: any[];
  name: string;
  records: {
    content: string;
    disabled: boolean;
  }[];
  ttl: number;
  type: string;
};

export default function RecordsPage({ slug }: { slug: string }) {
  const [selectedZone] = useState(slug);
  const { data: recordsData, refetch, isLoading, isFetching } = useGetRecordsQuery({
    zone: selectedZone,
  });
  const [deleteRecordApi, { isLoading: isDeleting }] = useDeleteRecordMutation();
  console.log(slug);
  console.log(recordsData);
  
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<DNSRecord | null>(null);
  
  // Bulk delete states
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteProgress, setBulkDeleteProgress] = useState(0);
  const [currentDeletingRecord, setCurrentDeletingRecord] = useState<DNSRecord | null>(null);

  // Transform API data to match frontend structure
  useEffect(() => {
    if (recordsData?.data) {
      const transformedRecords: DNSRecord[] = recordsData.data.flatMap(
        (apiRecord: ApiDNSRecord, index: number) =>
          apiRecord.records.map((rec, recIndex) => ({
            id: `${apiRecord.name}-${apiRecord.type}-${index}-${recIndex}`,
            name: apiRecord.name,
            type: apiRecord.type,
            value: rec.content,
            ttl: apiRecord.ttl,
            priority: null, // You can extract this from content if needed
            status: rec.disabled ? "Disabled" : "Active",
            disabled: rec.disabled,
          }))
      );
      setRecords(transformedRecords);
    } else {
      setRecords([]);
    }
  }, [recordsData]);

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.value.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || record.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDeleteRecord = async () => {
    if (!deleteConfirmRecord) return;

    try {
      await deleteRecordApi({
        zone: selectedZone,
        recordName: deleteConfirmRecord.name,
        type: deleteConfirmRecord.type,
      }).unwrap();

      toast.success("Record Deleted");
      refetch();
      setDeleteConfirmRecord(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete the record.");
    }
  };

  const handleCopyRecord = (record: DNSRecord) => {
    navigator.clipboard.writeText(record.value);
    toast.success("Record Value Copied to Clipboard");
  };

  const handleEditRecord = (record: DNSRecord) => {
    setEditingRecord(record);
    setShowAddDialog(true);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredRecords, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedZone}-dns-records.json`;
    link.click();
    toast.success("Records Exported");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedRecords = JSON.parse(event.target?.result as string);
            setRecords(importedRecords);
            toast.success("Records Imported Successfully");
          } catch (error) {
            toast.error("Failed to import records: Invalid JSON file format.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleBulkDelete = async () => {
    if (selectedRecords.length === 0) return;

    setIsBulkDeleting(true);
    setBulkDeleteProgress(0);
    
    const selectedRecordsData = records.filter(record => 
      selectedRecords.includes(record.id)
    );

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < selectedRecordsData.length; i++) {
      const record = selectedRecordsData[i];
      setCurrentDeletingRecord(record);
      
      try {
        await deleteRecordApi({
          zone: selectedZone,
          recordName: record.name,
          type: record.type,
        }).unwrap();
        
        successCount++;
      } catch (error: any) {
        console.error(`Failed to delete record ${record.name}:`, error);
        errorCount++;
        
        toast.error(`Failed to delete ${record.name}: ${error?.data?.message || "Unknown error"}`);
      }
      
      // Update progress
      const progress = ((i + 1) / selectedRecordsData.length) * 100;
      setBulkDeleteProgress(progress);
    }

    // Final progress update
    setBulkDeleteProgress(100);
    
    // Show summary toast
    if (errorCount === 0) {
      toast.success(`Successfully deleted ${successCount} records`);
    } else if (successCount === 0) {
      toast.error(`Failed to delete all ${errorCount} records`);
    } else {
      toast.warning(`Deleted ${successCount} records, ${errorCount} failed`);
    }

    // Reset states and refetch data
    setCurrentDeletingRecord(null);
    setIsBulkDeleting(false);
    setSelectedRecords([]);
    
    // Refetch the updated records
    setTimeout(() => {
      refetch();
      setBulkDeleteProgress(0);
    }, 1000);
  };

  const handleAddEditSuccess = () => {
    refetch();
    setEditingRecord(null);
  };

  return (
    <div>
      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="AAAA">AAAA</SelectItem>
                <SelectItem value="CNAME">CNAME</SelectItem>
                <SelectItem value="MX">MX</SelectItem>
                <SelectItem value="TXT">TXT</SelectItem>
                <SelectItem value="SRV">SRV</SelectItem>
                <SelectItem value="NS">NS</SelectItem>
                <SelectItem value="CAA">CAA</SelectItem>
                <SelectItem value="SOA">SOA</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => {
                setEditingRecord(null);
                setShowAddDialog(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </div>
        </div>

        {/* Bulk Delete Progress */}
        {isBulkDeleting && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Bulk Delete in Progress
                {currentDeletingRecord && (
                  <span className="text-sm font-normal text-muted-foreground">
                    (Deleting {currentDeletingRecord.name} - {currentDeletingRecord.type})
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Please wait while we delete the selected records...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={bulkDeleteProgress} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Progress: {Math.round(bulkDeleteProgress)}%</span>
                <span>
                  {currentDeletingRecord ? 
                    `Deleting ${currentDeletingRecord.name}` : 
                    'Processing...'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Records Table */}
        <div className="rounded-lg border border-border bg-card">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        filteredRecords.length > 0 &&
                        selectedRecords.length === filteredRecords.length
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRecords(filteredRecords.map((r) => r.id));
                        } else {
                          setSelectedRecords([]);
                        }
                      }}
                      disabled={isBulkDeleting}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">TTL</TableHead>
                  <TableHead className="text-right">Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">
                    {isFetching && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow 
                      key={record.id}
                      className={isBulkDeleting ? "opacity-50" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRecords.includes(record.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRecords([...selectedRecords, record.id]);
                            } else {
                              setSelectedRecords(
                                selectedRecords.filter((id) => id !== record.id)
                              );
                            }
                          }}
                          disabled={isBulkDeleting}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {record.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm max-w-[300px] truncate">
                        {record.value}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {record.ttl}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {record.priority || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={record.disabled ? "secondary" : "outline"}
                          className={
                            record.disabled 
                              ? "bg-gray-100 text-gray-600" 
                              : "bg-green-50 text-green-700 border-green-200"
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyRecord(record)}
                            disabled={isBulkDeleting}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRecord(record)}
                            disabled={isBulkDeleting}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={isBulkDeleting}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleEditRecord(record)}
                                disabled={isBulkDeleting}
                              >
                                Edit Record
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCopyRecord(record)}
                                disabled={isBulkDeleting}
                              >
                                Copy Value
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteConfirmRecord(record)}
                                disabled={isBulkDeleting}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedRecords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Bulk Operations ({selectedRecords.length} selected)
              </CardTitle>
              <CardDescription>
                Perform actions on selected records
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
              >
                {isBulkDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Bulk Delete
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRecords([])}
                disabled={isBulkDeleting}
              >
                Clear Selection
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <AddEditRecordDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        editingRecord={editingRecord}
        selectedZone={selectedZone}
        onSuccess={handleAddEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deleteConfirmRecord}
        record={deleteConfirmRecord}
        isLoading={isDeleting}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmRecord(null);
        }}
        onDelete={handleDeleteRecord}
      />
    </div>
  );
}