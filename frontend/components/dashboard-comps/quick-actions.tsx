"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Key, FileText, ArrowRightLeft } from "lucide-react"
import { DomainOnboardingDialog } from "../domains-comps/domain-onboarding-dialog";
import { useState } from "react";
import { toast } from "sonner";
import CreateEditApiKeyDialog from "../apis-comps/create-edit-api-key-dialog";
import { TransferDomainDialog } from "./transfer-domain-modal";

export function QuickActions() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get started</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Button variant="outline" className="justify-start bg-transparent" size="sm" onClick={() => setShowOnboarding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Domain
          </Button>
          <Button variant="outline" className="justify-start bg-transparent" size="sm" onClick={() => setDialogOpen(true)}>
            <Key className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
          <Button variant="outline" className="justify-start bg-transparent" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Create Zone from Template
          </Button>
          <Button variant="outline" className="justify-start bg-transparent" size="sm" onClick={()=>setTransferDialogOpen(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Transfer Domain
          </Button>
        </CardContent>
      </Card>

      <DomainOnboardingDialog
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onSuccess={() => {
          toast.success("domain added succesfully.")
        }}
      />

      <CreateEditApiKeyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={"create"}

        onApiKeyCreated={() => { toast.success("api key created.") }}

      />

      <TransferDomainDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        onSuccess={() => {
          toast.success("Domain transferred successfully.");
        }}
      />
    </>
  )
}
