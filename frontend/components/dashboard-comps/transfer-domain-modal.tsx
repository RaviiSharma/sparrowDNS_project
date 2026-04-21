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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetAllUsersQuery,
  useTransferDomainMutation,
} from "@/store/api/dashboard";
import { toast } from "sonner";

interface TransferDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface User {
  _id: string;
  name?: string;
  email: string;
}

export function TransferDomainDialog({
  open,
  onOpenChange,
  onSuccess,
}: TransferDomainDialogProps) {
  const [domainInput, setDomainInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useGetAllUsersQuery();
  const [transferDomain] = useTransferDomainMutation();

  const users: User[] = usersData?.users || [];

  useEffect(() => {
    if (usersError) {
      toast.error("Failed to load users");
    }
  }, [usersError]);

  const handleTransfer = async () => {
    if (!domainInput.trim()) {
      toast.error("Please enter a domain name");
      return;
    }

    if (!selectedUser) {
      toast.error("Please select a user to transfer to");
      return;
    }

    // Ensure domain ends with a dot
    const domainName = domainInput.endsWith(".")
      ? domainInput
      : `${domainInput}.`;

    setIsSubmitting(true);

    try {
      const result = await transferDomain({
        domainName,
        targetUserId: selectedUser._id,
      }).unwrap();

      if (result.status) {
        toast.success(result.message || "Domain transferred successfully");
        setDomainInput("");
        setSelectedUser(null);
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(result.message || "Failed to transfer domain");
      }
    } catch (error: any) {
      console.error("Transfer domain error:", error);
      toast.error(error?.data?.message || "Failed to transfer domain");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setDomainInput("");
      setSelectedUser(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfer Domain</DialogTitle>
          <DialogDescription>
            Transfer domain ownership to another user. The domain name must end
            with a trailing dot (e.g., "example.com.").
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Domain Input */}
          <div className="space-y-2">
            <Label htmlFor="domain">Domain Name</Label>
            <Input
              id="domain"
              placeholder="example.com."
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              className={cn(
                !domainInput.endsWith(".") &&
                  domainInput.length > 0 &&
                  "border-yellow-500",
              )}
            />
            {!domainInput.endsWith(".") && domainInput.length > 0 && (
              <p className="text-sm text-yellow-600">
                Domain should end with a trailing dot (e.g., "example.com.")
              </p>
            )}
          </div>

          {/* User Selection */}
          <div className="space-y-2">
            <Label>Transfer To User</Label>
            <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={userSearchOpen}
                  className="w-full justify-between"
                  disabled={usersLoading}
                >
                  {selectedUser ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        {selectedUser.name || selectedUser.email}
                        {selectedUser.name && (
                          <span className="text-muted-foreground ml-1">
                            ({selectedUser.email})
                          </span>
                        )}
                      </span>
                    </div>
                  ) : (
                    "Select user..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search users..." />
                  <CommandList>
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {users.map((user) => (
                        <CommandItem
                          key={user._id}
                          value={`${user.name || ""} ${user.email}`}
                          onSelect={() => {
                            setSelectedUser(user);
                            setUserSearchOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedUser?._id === user._id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{user.name || user.email}</span>
                            {user.name && (
                              <span className="text-sm text-muted-foreground">
                                {user.email}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Selected User Display */}
          {selectedUser && (
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">
                      {selectedUser.name || selectedUser.email}
                    </p>
                    {selectedUser.name && (
                      <p className="text-xs text-muted-foreground">
                        {selectedUser.email}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant="secondary">Selected</Badge>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!domainInput.trim() || !selectedUser || isSubmitting}
          >
            {isSubmitting ? "Transferring..." : "Transfer Domain"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
