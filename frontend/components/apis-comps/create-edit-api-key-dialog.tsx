"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Loader2, Copy, AlertCircle, Edit, Plus, Calendar } from "lucide-react";
import { useCreateApiKeyMutation, useUpdateApiKeyMutation } from "@/store/api/api-keys";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface ApiKey {
  _id: string;
  name: string;
  scope: string;
  status: string;
  lastUsed?: string;
  usageCount?: number;
  expiresAt?: string;
  key?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateEditApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  apiKey?: ApiKey | null;
  onApiKeyCreated?: () => void;
  onApiKeyUpdated?: () => void;
}

export default function CreateEditApiKeyDialog({
  open,
  onOpenChange,
  mode,
  apiKey,
  onApiKeyCreated,
  onApiKeyUpdated,
}: CreateEditApiKeyDialogProps) {
  const [createApiKey, { isLoading: isCreating }] = useCreateApiKeyMutation();
  const [updateApiKey, { isLoading: isUpdating }] = useUpdateApiKeyMutation();
  
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    scope: "Read Only",
    status: "active",
    expiresAt: "",
    neverExpires: true,
    lastUsed: "",
    resetLastUsed: false
  });

  const [error, setError] = useState<string | null>(null);

  const isLoading = isCreating || isUpdating;

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && apiKey) {
        // Pre-fill form with existing API key data for edit mode
        const hasExpiry = apiKey.expiresAt && new Date(apiKey.expiresAt) > new Date();
        setFormData({
          name: apiKey.name || "",
          scope: apiKey.scope || "Read Only",
          status: apiKey.status || "active",
          expiresAt: hasExpiry && apiKey.expiresAt ? new Date(apiKey.expiresAt).toISOString().split('T')[0] : "",
          neverExpires: !hasExpiry,
          lastUsed: apiKey.lastUsed ? new Date(apiKey.lastUsed).toISOString().split('T')[0] : "",
          resetLastUsed: false
        });
      } else {
        // Reset form for create mode
        setFormData({
          name: "",
          scope: "Read Only",
          status: "active",
          expiresAt: "",
          neverExpires: true,
          lastUsed: "",
          resetLastUsed: false
        });
      }
      setError(null);
      setCreatedKey(null);
    }
  }, [open, mode, apiKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("API key name is required");
      return;
    }

    if (formData.name.length > 50) {
      setError("API key name must be 50 characters or less");
      return;
    }

    // Validate expiration date if set
    if (!formData.neverExpires && !formData.expiresAt) {
      setError("Expiration date is required when 'Never expires' is disabled");
      return;
    }

    if (!formData.neverExpires && formData.expiresAt) {
      const expirationDate = new Date(formData.expiresAt);
      if (expirationDate <= new Date()) {
        setError("Expiration date must be in the future");
        return;
      }
    }

    try {
      if (mode === "create") {
        const payload: any = {
          name: formData.name.trim(),
          scope: formData.scope,
        };

        // Add expiration if set
        if (!formData.neverExpires && formData.expiresAt) {
          payload.expiresAt = new Date(formData.expiresAt).toISOString();
        }

        const result = await createApiKey(payload).unwrap();

        if (result.success) {
          setError(null);
          setCreatedKey(result.apiKey?.key || null);
          onApiKeyCreated?.();
          toast.success("API key created successfully");
        }
      } else if (mode === "edit" && apiKey) {
        // Prepare update data
        const updateData: any = {
          name: formData.name.trim(),
          scope: formData.scope,
          status: formData.status
        };

        // Handle expiration
        if (formData.neverExpires) {
          updateData.expiresAt = null;
        } else if (formData.expiresAt) {
          updateData.expiresAt = new Date(formData.expiresAt).toISOString();
        }

        // Only include lastUsed if it's changed and not empty
        if (formData.lastUsed && formData.lastUsed !== (apiKey.lastUsed ? new Date(apiKey.lastUsed).toISOString().split('T')[0] : "")) {
          updateData.lastUsed = new Date(formData.lastUsed).toISOString();
        }

        // If reset last used is enabled, set lastUsed to null
        if (formData.resetLastUsed) {
          updateData.lastUsed = null;
        }

        const result = await updateApiKey({
          id: apiKey._id,
          ...updateData
        }).unwrap();

        if (result.success) {
          setError(null);
          onApiKeyUpdated?.();
          toast.success("API key updated successfully");
          handleClose();
        }
      }
    } catch (err: any) {
      setError(err?.data?.message || `Failed to ${mode} API key`);
    }
  };

  const handleClose = () => {
    setFormData({ 
      name: "", 
      scope: "Read Only", 
      status: "active",
      expiresAt: "",
      neverExpires: true,
      lastUsed: "",
      resetLastUsed: false
    });
    setError(null);
    setCreatedKey(null);
    onOpenChange(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard");
    handleClose();
  };

  const resetLastUsedToNow = () => {
    const now = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      lastUsed: now,
      resetLastUsed: false
    }));
  };

  const handleResetLastUsedToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      resetLastUsed: checked,
      lastUsed: checked ? "" : prev.lastUsed
    }));
  };

  const handleNeverExpiresToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      neverExpires: checked,
      expiresAt: checked ? "" : prev.expiresAt
    }));
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Success view for created API key (only in create mode)
  if (mode === "create" && createdKey) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md sm:max-w-lg mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Check className="h-5 w-5 text-green-500" />
              API Key Created
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Make sure to copy your API key now. You won't be able to see it again!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                This is the only time you'll be able to view the full API key. Make sure to copy it now and store it securely.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Your API Key</Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <code className="flex-1 rounded-lg bg-muted p-3 font-mono text-sm break-all min-h-[80px] sm:min-h-0">
                  {createdKey}
                </code>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => copyToClipboard(createdKey)}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button type="button" onClick={handleClose} className="w-full sm:w-auto">
                Done
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Form view for both create and edit modes
  const isEditMode = mode === "edit";
  const title = isEditMode ? "Edit API Key" : "Create New API Key";
  const description = isEditMode 
    ? "Update the API key permissions, status, and usage information."
    : "Create a new API key for programmatic access to your account.";
  const submitText = isEditMode 
    ? (isUpdating ? "Updating..." : "Update API Key") 
    : (isCreating ? "Creating..." : "Create API Key");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md sm:max-w-lg mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {isEditMode ? (
              <Edit className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm sm:text-base">Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Production API Key"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={isLoading}
              required
              maxLength={50}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Maximum 50 characters</span>
              <span>{formData.name.length}/50</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope" className="text-sm sm:text-base">Scope</Label>
            <Select
              value={formData.scope}
              onValueChange={(value) =>
                setFormData({ ...formData, scope: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Read Only">Read Only</SelectItem>
                <SelectItem value="Write Only">Write Only</SelectItem>
                <SelectItem value="Full Access">Full Access</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.scope === "Read Only" && "Can only read data and records"}
              {formData.scope === "Write Only" && "Can only create and update records"}
              {formData.scope === "Full Access" && "Full access to all operations including create, update, and delete"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt" className="text-sm sm:text-base">Expiration</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="neverExpires" className="text-sm">
                  Never expires
                </Label>
                <Switch
                  id="neverExpires"
                  checked={formData.neverExpires}
                  onCheckedChange={handleNeverExpiresToggle}
                  disabled={isLoading}
                />
              </div>
              
              {!formData.neverExpires && (
                <div className="space-y-2">
                  <Label htmlFor="expiresAt" className="text-sm">
                    Expiration Date *
                  </Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                    disabled={isLoading}
                    min={new Date().toISOString().split("T")[0]}
                    required={!formData.neverExpires}
                  />
                  <p className="text-xs text-muted-foreground">
                    Select when this API key should expire
                  </p>
                </div>
              )}
            </div>
          </div>

          {isEditMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm sm:text-base">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.status === "active" && "Key is active and can be used for API requests"}
                  {formData.status === "inactive" && "Key is inactive and cannot be used"}
                  {formData.status === "revoked" && "Key is revoked and permanently disabled"}
                </p>
              </div>

              <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                <Label className="text-sm sm:text-base">Last Used Configuration</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="resetLastUsed" className="text-sm">
                      Reset Last Used to "Never"
                    </Label>
                    <Switch
                      id="resetLastUsed"
                      checked={formData.resetLastUsed}
                      onCheckedChange={handleResetLastUsedToggle}
                      disabled={isLoading}
                    />
                  </div>
                  
                  {formData.resetLastUsed ? (
                    <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded border">
                      Last used timestamp will be reset to "Never"
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="lastUsed" className="text-sm">
                        Set Last Used Date
                      </Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          id="lastUsed"
                          type="date"
                          value={formData.lastUsed}
                          onChange={(e) =>
                            setFormData({ ...formData, lastUsed: e.target.value, resetLastUsed: false })
                          }
                          disabled={isLoading}
                          max={new Date().toISOString().split("T")[0]}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={resetLastUsedToNow}
                          disabled={isLoading}
                          className="shrink-0"
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Today
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Set when this key was last used, or use the button to set to today
                      </p>
                    </div>
                  )}
                </div>

                {apiKey?.lastUsed && !formData.resetLastUsed && (
                  <div className="text-xs p-2 bg-background rounded border">
                    <strong>Current Last Used:</strong> {formatDisplayDate(apiKey.lastUsed)}
                  </div>
                )}
              </div>

              {apiKey && (
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Key Preview</Label>
                  <div className="rounded-lg bg-muted p-3">
                    <code className="font-mono text-sm break-all">
                      {apiKey.key ? `${apiKey.key.slice(0, 8)}••••${apiKey.key.slice(-4)}` : '••••••••••••'}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For security reasons, the full key cannot be displayed here.
                  </p>
                </div>
              )}

              {apiKey?.usageCount !== undefined && (
                <div className="text-xs p-2 bg-muted/30 rounded border">
                  <strong>Usage Count:</strong> {apiKey.usageCount} requests
                </div>
              )}

              {apiKey?.createdAt && (
                <div className="text-xs p-2 bg-muted/30 rounded border">
                  <strong>Created:</strong> {formatDisplayDate(apiKey.createdAt)}
                </div>
              )}
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}