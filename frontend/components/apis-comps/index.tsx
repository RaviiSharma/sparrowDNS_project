"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Copy, MoreVertical, Eye, EyeOff, Code, Loader2, Edit, RotateCcw } from "lucide-react";
import { useState } from "react";
import { 
  useGetApiKeysQuery, 
  useDeleteApiKeyMutation, 
  useGetApiUsageQuery 
} from "@/store/api/api-keys";
import { toast } from "sonner";
import CreateEditApiKeyDialog from "./create-edit-api-key-dialog";
import DeleteConfirmationDialog from "@/components/common/delete-confirmation-dialog";

export default function APIPage() {
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<any>(null);
  const [keyViewModalOpen, setKeyViewModalOpen] = useState(false);
  const [keyToView, setKeyToView] = useState<any>(null);
  
  const { data: apiKeysData, isLoading: keysLoading, refetch: refetchKeys } = useGetApiKeysQuery();
  const { data: usageData, isLoading: usageLoading, refetch: refetchUsage } = useGetApiUsageQuery();
  const [deleteApiKey, { isLoading: isDeleting }] = useDeleteApiKeyMutation();

  const apiKeys = apiKeysData?.apiKeys || [];

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ 
      ...prev, 
      [id]: !prev[id] 
    }));
  };

  const maskKey = (key: string) => {
    if (!key) return "••••••••••••";
    if (key.length <= 12) return "•".repeat(12);
    return key.slice(0, 8) + "•".repeat(12) + key.slice(-4);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard");
  };

  const handleCreateKey = () => {
    setDialogMode("create");
    setSelectedKey(null);
    setDialogOpen(true);
  };

  const handleEditKey = (apiKey: any) => {
    setDialogMode("edit");
    setSelectedKey(apiKey);
    setDialogOpen(true);
  };

  const handleRegenerateKey = async (apiKey: any) => {
    toast.info("Regenerate feature coming soon");
  };

  const handleDeleteKey = (apiKey: any) => {
    setSelectedKey(apiKey);
    setDeleteDialogOpen(true);
  };

  const handleViewKey = (apiKey: any) => {
    setKeyToView(apiKey);
    setKeyViewModalOpen(true);
  };

  const confirmDeleteKey = async () => {
    if (!selectedKey) return;
    
    try {
      const result = await deleteApiKey(selectedKey._id).unwrap();
      if (result.success) {
        toast.success("API key deleted successfully");
        refetchKeys();
        refetchUsage();
        setDeleteDialogOpen(false);
        setSelectedKey(null);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete API key");
    }
  };

  const handleApiKeyCreated = () => {
    refetchKeys();
    refetchUsage();
  };

  const handleApiKeyUpdated = () => {
    refetchKeys();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        variant: "default" as const, 
        className: "bg-green-500/10 text-green-500 border-green-500/20" 
      },
      inactive: { 
        variant: "outline" as const, 
        className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" 
      },
      revoked: { 
        variant: "outline" as const, 
        className: "bg-red-500/10 text-red-500 border-red-500/20" 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getScopeBadge = (scope: string) => {
    const scopeConfig = {
      "Read Only": { 
        variant: "outline" as const, 
        className: "bg-blue-500/10 text-blue-500 border-blue-500/20" 
      },
      "Write Only": { 
        variant: "outline" as const, 
        className: "bg-orange-500/10 text-orange-500 border-orange-500/20" 
      },
      "Full Access": { 
        variant: "outline" as const, 
        className: "bg-purple-500/10 text-purple-500 border-purple-500/20" 
      }
    };

    const config = scopeConfig[scope as keyof typeof scopeConfig] || scopeConfig["Read Only"];

    return (
      <Badge variant={config.variant} className={config.className}>
        {scope}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Never";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const isExpired = (expiresAt: string) => {
    if (!expiresAt) return false;
    try {
      return new Date(expiresAt) < new Date();
    } catch (error) {
      return false;
    }
  };

  const getExpirationBadge = (expiresAt: string) => {
    if (!expiresAt) {
      return (
        <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
          Never expires
        </Badge>
      );
    }

    if (isExpired(expiresAt)) {
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
          Expired
        </Badge>
      );
    }

    try {
      const daysUntilExpiry = Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 7) {
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
          </Badge>
        );
      }

      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          Expires {formatDate(expiresAt)}
        </Badge>
      );
    } catch (error) {
      return (
        <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
          Invalid date
        </Badge>
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">API Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your API keys and monitor usage
          </p>
        </div>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto sm:mx-0">
          <TabsTrigger value="keys" className="text-xs sm:text-sm">API Keys</TabsTrigger>
          <TabsTrigger value="docs" className="text-xs sm:text-sm">Documentation</TabsTrigger>
          <TabsTrigger value="examples" className="text-xs sm:text-sm">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">API Keys</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Manage your API keys for programmatic access to SparrowDNS
                  </CardDescription>
                </div>
                <Button onClick={handleCreateKey} className="sm:w-auto w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {keysLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading API keys...</span>
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Code className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No API keys found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                    Create your first API key to start integrating with SparrowDNS programmatically.
                  </p>
                  <Button onClick={handleCreateKey}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First API Key
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap min-w-[140px]">Name</TableHead>
                          <TableHead className="whitespace-nowrap min-w-[200px]">Key</TableHead>
                          <TableHead className="whitespace-nowrap min-w-[120px]">Scope</TableHead>
                          <TableHead className="whitespace-nowrap min-w-[120px]">Created</TableHead>
                          <TableHead className="whitespace-nowrap min-w-[140px]">Last Used</TableHead>
                          <TableHead className="whitespace-nowrap min-w-[140px]">Expires</TableHead>
                          <TableHead className="whitespace-nowrap min-w-[100px]">Status</TableHead>
                          <TableHead className="whitespace-nowrap w-[100px] text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys.map((apiKey: any) => (
                          <TableRow key={apiKey._id}>
                            <TableCell className="py-3">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold">{apiKey.name}</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {apiKey._id?.slice(-8) || 'N/A'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                <code className="font-mono text-xs bg-muted px-2 py-1 rounded break-all flex-1 min-w-0 max-w-[180px] sm:max-w-[220px]">
                                  {maskKey(apiKey.key)}
                                </code>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 hover:bg-accent"
                                    onClick={() => handleViewKey(apiKey)}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 hover:bg-accent"
                                    onClick={() => {
                                      if (apiKey.key) {
                                        copyToClipboard(apiKey.key);
                                      } else {
                                        toast.error("No API key available to copy");
                                      }
                                    }}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              {getScopeBadge(apiKey.scope)}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm text-muted-foreground py-3">
                              {formatDate(apiKey.createdAt || apiKey.created)}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm text-muted-foreground py-3">
                              {formatDateTime(apiKey.lastUsed)}
                            </TableCell>
                            <TableCell className="py-3">
                              {getExpirationBadge(apiKey.expiresAt)}
                            </TableCell>
                            <TableCell className="py-3">
                              {getStatusBadge(apiKey.status)}
                            </TableCell>
                            <TableCell className="py-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 hover:bg-accent mx-auto"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                                  <DropdownMenuItem 
                                    onClick={() => handleEditKey(apiKey)}
                                    className="text-xs"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Key
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleRegenerateKey(apiKey)}
                                    className="text-xs"
                                  >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Regenerate Key
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive text-xs"
                                    onClick={() => handleDeleteKey(apiKey)}
                                  >
                                    Delete Key
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">API Usage</CardTitle>
              <CardDescription>Monitor your API request usage and limits</CardDescription>
            </CardHeader>
            <CardContent>
              {usageLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      Requests Today
                    </div>
                    <div className="text-xl sm:text-2xl font-bold">
                      {usageData?.usage?.requestsToday?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      Requests This Month
                    </div>
                    <div className="text-xl sm:text-2xl font-bold">
                      {usageData?.usage?.requestsThisMonth?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      Total Requests
                    </div>
                    <div className="text-xl sm:text-2xl font-bold">
                      {usageData?.usage?.totalRequests?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      Rate Limit
                    </div>
                    <div className="text-xl sm:text-2xl font-bold">
                      {usageData?.usage?.rateLimit || "1000/min"}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">API Documentation</CardTitle>
              <CardDescription>
                Complete reference for the SparrowDNS REST API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Base URL</h3>
                <code className="block rounded-lg bg-muted p-4 font-mono text-sm break-all">
                  https://api.sparrowdns.com/v1
                </code>
                <p className="text-sm text-muted-foreground">
                  All API requests must be made to this base URL.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Include your API key in the Authorization header as a Bearer token:
                </p>
                <code className="block rounded-lg bg-muted p-4 font-mono text-sm break-all">
                  Authorization: Bearer YOUR_API_KEY
                </code>
                <p className="text-sm text-muted-foreground">
                  Replace <code className="bg-muted px-1 rounded">YOUR_API_KEY</code> with your actual API key.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Endpoints</h3>
                
                <div className="space-y-3">
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        GET
                      </Badge>
                      <code className="font-mono text-sm break-all">/zones</code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      List all DNS zones in your account
                    </p>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                        POST
                      </Badge>
                      <code className="font-mono text-sm break-all">/zones</code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Create a new DNS zone
                    </p>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        GET
                      </Badge>
                      <code className="font-mono text-sm break-all">/zones/:id/records</code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Get all DNS records for a specific zone
                    </p>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                        POST
                      </Badge>
                      <code className="font-mono text-sm break-all">/zones/:id/records</code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Create a new DNS record in a zone
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Rate Limiting</h3>
                <p className="text-sm text-muted-foreground">
                  API requests are limited to 1000 requests per minute per API key. 
                  Exceeding this limit will result in a 429 Too Many Requests response.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Code Examples</CardTitle>
              <CardDescription>
                Quick start examples in popular programming languages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  JavaScript / Node.js
                </h3>
                <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                  <code className="font-mono text-sm break-all">{`// List all DNS zones
const listZones = async () => {
  const response = await fetch('https://api.sparrowdns.com/v1/zones', {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(\`API error: \${response.status}\`);
  }

  return await response.json();
};`}</code>
                </pre>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  cURL
                </h3>
                <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                  <code className="font-mono text-sm break-all">{`# List all zones
curl -X GET "https://api.sparrowdns.com/v1/zones" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateEditApiKeyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        apiKey={selectedKey}
        onApiKeyCreated={handleApiKeyCreated}
        onApiKeyUpdated={handleApiKeyUpdated}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        record={selectedKey}
        isLoading={isDeleting}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSelectedKey(null);
        }}
        onDelete={confirmDeleteKey}
        title="Delete API Key"
        description={(key) =>
          key
            ? `Are you sure you want to delete the API key "${key.name}"? This action cannot be undone and will immediately revoke access for any applications using this key.`
            : ""
        }
        cancelText="Cancel"
        deleteText="Delete Key"
      />

      {/* API Key View Modal */}
      <Dialog open={keyViewModalOpen} onOpenChange={setKeyViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API Key</DialogTitle>
            <DialogDescription>
              View and copy your API key. Keep it secure and don't share it publicly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {keyToView && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Key Name</label>
                  <p className="text-sm text-muted-foreground">{keyToView.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">API Key</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-sm bg-muted p-3 rounded break-all">
                      {keyToView.key}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(keyToView.key)}
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setKeyViewModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      copyToClipboard(keyToView.key);
                      setKeyViewModalOpen(false);
                    }}
                  >
                    Copy & Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}