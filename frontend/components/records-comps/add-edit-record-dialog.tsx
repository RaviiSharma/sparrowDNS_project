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
import { Check, Loader2, Trash2, AlertCircle } from "lucide-react";
import {
  useAddRecordMutation,
  useUpdateRecordMutation,
  useDeleteRecordMutation,
} from "@/store/api/dns/index";
import { toast } from "sonner";

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

interface AddEditRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRecord: DNSRecord | null;
  selectedZone: string;
  onSuccess: () => void;
}

export default function AddEditRecordDialog({
  open,
  onOpenChange,
  editingRecord,
  selectedZone,
  onSuccess,
}: AddEditRecordDialogProps) {
  const [addRecord, { isLoading: isAdding, error: addError }] =
    useAddRecordMutation();
  const [updateRecord, { isLoading: isUpdating, error: updateError }] =
    useUpdateRecordMutation();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    type: "A",
    value: "",
    ttl: 3600,
    priority: "",
  });

  // Store original values to track changes
  const [originalData, setOriginalData] = useState({
    name: "",
    type: "A",
    value: "",
    ttl: 3600,
    priority: "",
  });

  const isLoading = isAdding || isUpdating;
  const isEditMode = !!editingRecord;

  // Reset form when dialog opens/closes or editing record changes
  useEffect(() => {
    if (open) {
      if (editingRecord) {
        // Fix the name extraction logic with better domain handling
        let recordName = editingRecord.name;

        console.log("Original record name:", recordName);
        console.log("Selected zone:", selectedZone);

        // Remove trailing dot if present
        recordName = recordName.replace(/\.$/, '');

        // Remove the zone from the name if it ends with the zone
        // Handle both with and without trailing dots
        const zonePattern = new RegExp(`\\.${selectedZone.replace(/\./g, '\\.')}$`);
        if (recordName.endsWith(`.${selectedZone}`) || zonePattern.test(recordName)) {
          recordName = recordName.replace(new RegExp(`\\.${selectedZone.replace(/\./g, '\\.')}$`), "");
        }

        // Handle the case where name is exactly the zone (apex record)
        if (recordName === selectedZone) {
          recordName = "@";
        }

        // If after all processing we have an empty string, it's the zone apex
        if (recordName === "") {
          recordName = "@";
        }

        console.log("Processed record name:", recordName);

        const initialData = {
          name: recordName,
          type: editingRecord.type,
          value: editingRecord.value,
          ttl: editingRecord.ttl,
          priority: editingRecord.priority?.toString() || "",
        };
        setFormData(initialData);
        setOriginalData(initialData);
      } else {
        const initialData = {
          name: "",
          type: "A",
          value: "",
          ttl: 3600,
          priority: "",
        };
        setFormData(initialData);
        setOriginalData(initialData);
      }
      setErrors({});
    }
  }, [open, editingRecord, selectedZone]);
  // Reset form and errors
  const resetState = () => {
    setFormData({
      name: "",
      type: "A",
      value: "",
      ttl: 3600,
      priority: "",
    });
    setOriginalData({
      name: "",
      type: "A",
      value: "",
      ttl: 3600,
      priority: "",
    });
    setErrors({});
  };

  // Wrap dialog open/close handler
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

 const validateForm = () => {
  const newErrors: Record<string, string> = {};

  if (!formData.name.trim()) {
    newErrors.name = "Name is required";
  }

  if (!formData.value.trim()) {
    newErrors.value = "Value is required";
  }

  // Validate based on record type
  if (formData.type === "A") {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Regex.test(formData.value)) {
      newErrors.value = "Invalid IPv4 address";
    }
  } else if (formData.type === "AAAA") {
    // CHANGED: Simplified IPv6 validation - just check for colon presence
    if (!formData.value.includes(':')) {
      newErrors.value = "Invalid IPv6 address";
    }
  } else if (formData.type === "CNAME" || formData.type === "MX" || formData.type === "NS") {
    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(formData.value.replace(/\.$/, ""))) {
      newErrors.value = "Invalid domain format";
    }
  }

  if (formData.type === "MX" && !formData.priority) {
    newErrors.priority = "Priority is required for MX records";
  }

  if (formData.ttl < 60 || formData.ttl > 86400) {
    newErrors.ttl = "TTL must be between 60 and 86400 seconds";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      // Process the name field - convert "@" to empty string for zone apex
      const processedName = formData.name === "@" ? "" : formData.name;

      if (isEditMode) {
        // UPDATE RECORD - Use nested records array structure
        const updatePayload: any = {
          zone: selectedZone,
          recordName: originalData.name === "@" ? "" : originalData.name, // Original record name
          type: originalData.type, // Original type
          newRecordName: formData.name !== originalData.name ? processedName : undefined,
          ttl: formData.ttl,
          records: [
            {
              content: formData.value,
              ttl: formData.ttl,
              disabled: false,
              ...(formData.priority && (formData.type === "MX" || formData.type === "SRV") ? {
                priority: parseInt(formData.priority)
              } : {}),
            },
          ],
        };

        // Clean up undefined fields
        Object.keys(updatePayload).forEach(key => {
          if (updatePayload[key] === undefined) {
            delete updatePayload[key];
          }
        });

        console.log("Update Payload:", updatePayload);

        const result = await updateRecord(updatePayload).unwrap();

        if (result.status) {
          toast.success("Record updated successfully");
          onSuccess();
          handleDialogOpenChange(false);
        } else {
          toast.error(result.message || "Failed to update record");
        }
      } else {
        // ADD NEW RECORD - Use flat structure
        const addPayload: any = {
          zone: selectedZone,
          recordName: processedName,
          type: formData.type,
          content: formData.value, // Direct content field for add
          ttl: formData.ttl,
        };

        // Add priority only for MX/SRV records
        if (formData.priority && (formData.type === "MX" || formData.type === "SRV")) {
          addPayload.priority = parseInt(formData.priority);
        }

        console.log("Add Payload:", addPayload);

        const result = await addRecord(addPayload).unwrap();

        if (result.status) {
          toast.success("Record added successfully");
          onSuccess();
          handleDialogOpenChange(false);
        } else {
          toast.error(result.message || "Failed to add record");
        }
      }
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(error?.data?.message || "Something went wrong!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit DNS Record" : "Add DNS Record"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the DNS record details"
              : "Create a new DNS record for your domain"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="@ or subdomain"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={isLoading}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Leave empty for zone apex (@), or enter subdomain name
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value, priority: "" })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A (IPv4 Address)</SelectItem>
                <SelectItem value="AAAA">AAAA (IPv6 Address)</SelectItem>
                <SelectItem value="CNAME">CNAME (Canonical Name)</SelectItem>
                <SelectItem value="MX">MX (Mail Exchange)</SelectItem>
                <SelectItem value="TXT">TXT (Text Record)</SelectItem>
                <SelectItem value="SRV">SRV (Service Record)</SelectItem>
                <SelectItem value="NS">NS (Name Server)</SelectItem>
                <SelectItem value="CAA">CAA (Certificate Authority)</SelectItem>
                <SelectItem value="SOA">SOA (Start of Authority)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              Value{" "}
              {formData.type === "MX" && "(Mail Server)"}
              {formData.type === "CNAME" && "(Target Domain)"}
              {formData.type === "NS" && "(Name Server)"}
            </Label>
            <Input
              id="value"
              placeholder={
                formData.type === "A"
                  ? "192.168.1.1"
                  : formData.type === "AAAA"
                    ? "2001:db8::1"
                    : formData.type === "CNAME"
                      ? "example.com"
                      : formData.type === "MX"
                        ? "mail.example.com"
                        : formData.type === "TXT"
                          ? '"your text here"'
                          : "Record value"
              }
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
              disabled={isLoading}
              className={errors.value ? "border-destructive" : ""}
            />
            {errors.value && (
              <p className="text-sm text-destructive">{errors.value}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ttl">TTL (seconds)</Label>
              <Input
                id="ttl"
                type="number"
                min="60"
                max="86400"
                value={formData.ttl}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ttl: parseInt(e.target.value) || 3600,
                  })
                }
                disabled={isLoading}
                className={errors.ttl ? "border-destructive" : ""}
              />
              {errors.ttl && (
                <p className="text-sm text-destructive">{errors.ttl}</p>
              )}
            </div>

            {(formData.type === "MX" || formData.type === "SRV") && (
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  placeholder="10"
                  min="0"
                  max="65535"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  disabled={isLoading}
                  className={errors.priority ? "border-destructive" : ""}
                />
                {errors.priority && (
                  <p className="text-sm text-destructive">{errors.priority}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleDialogOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? "Update Record" : "Add Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}