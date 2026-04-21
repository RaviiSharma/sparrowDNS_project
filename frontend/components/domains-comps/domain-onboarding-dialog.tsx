"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Copy,
  ArrowRight,
  Server,
  Globe,
  FileText,
  Check,
  Info,
  Search,
  Settings,
  Upload,
  CheckCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useScanDomainMutation, useZoneImportMutation } from "@/store/api/dns"

const API_BASE_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api`

type OnboardingStep = "domain" | "fetching" | "nameservers" | "verification" | "import" | "complete"

interface DomainOnboardingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface DNSRecord {
  type: string
  name: string
  value: string
  ttl?: number
  priority?: number
}

export function DomainOnboardingDialog({ open, onOpenChange, onSuccess }: DomainOnboardingDialogProps) {
  const [step, setStep] = useState<OnboardingStep>("domain")
  const [domain, setDomain] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentNS, setCurrentNS] = useState<string[]>([])
  const [currentRecords, setCurrentRecords] = useState<any>({})
  const [isVerified, setIsVerified] = useState(false)
  const [verificationAttempt, setVerificationAttempt] = useState(0)
  const [copiedNS, setCopiedNS] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanData, setScanData] = useState<any>(null)

  const sparrowNS = ["ns1.in.select", "ns2.in.select"] // Update these with your actual nameservers

  const steps = [
    { id: "domain", label: "Domain", icon: Globe, description: "Enter domain" },
    { id: "fetching", label: "Analyze", icon: Search, description: "Fetch DNS data" },
    { id: "nameservers", label: "Nameservers", icon: Server, description: "Update NS records" },
    { id: "verification", label: "Verify", icon: Settings, description: "Check configuration" },
    { id: "import", label: "Import", icon: Upload, description: "Import records" },
    { id: "complete", label: "Complete", icon: CheckCheck, description: "All done" },
  ]

  const getStepStatus = (stepId: string) => {
    const currentIndex = steps.findIndex((s) => s.id === step)
    const stepIndex = steps.findIndex((s) => s.id === stepId)

    if (stepIndex < currentIndex) return "complete"
    if (stepIndex === currentIndex) return "current"
    return "upcoming"
  }

  const [scanDomain] = useScanDomainMutation()
  const [zoneImport] = useZoneImportMutation()

  const handleDomainSubmit = async () => {
    if (!domain) return
    setIsLoading(true)
    setError(null)
    setStep("fetching")

    try {
      const result = await scanDomain({ domain }).unwrap()
      if (result.success) {
        setScanData(result)
        setCurrentRecords(result.records || {})
        const nsRecords = result.records?.NS || []
        setCurrentNS(nsRecords.length > 0 ? nsRecords : ["ns1.currentprovider.com", "ns2.currentprovider.com"])
        setIsVerified(result.isValidNS || false)
        setStep("nameservers")
      } else {
        // Even if scan fails with "No DNS records found", proceed to nameservers step
        // because import step will handle zone creation
        if (result.message?.includes('No DNS records found') || 
            result.message?.includes('No records found')) {
          setCurrentRecords({})
          setCurrentNS(["ns1.currentprovider.com", "ns2.currentprovider.com"])
          setIsVerified(false)
          setStep("nameservers")
        } else {
          setError(result.message || "Failed to scan domain")
          setStep("domain")
        }
      }
    } catch (err:any) {
      // Even if scan fails completely, proceed to nameservers step
      // because import step will handle zone creation
      setCurrentRecords({})
      setCurrentNS(["ns1.currentprovider.com", "ns2.currentprovider.com"])
      setIsVerified(false)
      setStep("nameservers")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyNS = async () => {
    setIsLoading(true)
    setVerificationAttempt((prev) => prev + 1)
    setError(null)

    try {
      const result = await scanDomain({ domain }).unwrap()
      if (result.success) {
        setIsVerified(result.isValidNS || false)
        if (result.isValidNS) {
          setTimeout(() => setStep("import"), 800)
        }
      }
    } catch (err:any) {
      setError(err?.data?.message || "Failed to verify nameservers")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipVerification = () => {
    setStep("import")
  }

  const handleImportRecords = async (importAll: boolean) => {
    setIsLoading(true)
    setError(null)
     
    console.log(domain, importAll, currentRecords)

    try {
      const result = await zoneImport({
        domain: domain.endsWith('.') ? domain : `${domain}.`,
        importRecords: importAll
      }).unwrap()
      
      console.log("Import Result:", result)
      
      // Handle both success cases - zone created OR zone already exists
      if (result.success) {
        setStep("complete")
      } else {
        // Even if success is false, check if we have data (zone might already exist)
        if (result.data) {
          // Zone exists in DB - treat as success
          setStep("complete")
        } else {
          setError(result.message || "Failed to import zone")
        }
      }
    } catch (err:any) {
      console.error("Import error:", err)
      
      // More specific error handling for zone creation
      const errorMessage = err?.data?.message || "Failed to create zone"
      
      // Check if the error indicates the zone already exists
      if (errorMessage.includes('already exists') || 
          errorMessage.includes('Zone already exists') ||
          err?.status === 409) {
        // Zone exists - proceed to success
        setStep("complete")
      } else if (err?.status === 400) {
        setError('Invalid domain format')
      } else if (err?.status === 500) {
        setError('Server error. Please try again later.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetAllStates = () => {
    setStep("domain")
    setDomain("")
    setIsLoading(false)
    setCurrentNS([])
    setCurrentRecords({})
    setIsVerified(false)
    setVerificationAttempt(0)
    setCopiedNS(null)
    setError(null)
    setScanData(null)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetAllStates()
    }
    onOpenChange(open)
  }

  const handleComplete = () => {
    // Reset state
    resetAllStates()
    
    // Call onSuccess callback
    if (onSuccess) {
      onSuccess()
    }
    
    onOpenChange(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedNS(text)
    setTimeout(() => setCopiedNS(null), 2000)
  }

  // Count total records
  const getTotalRecordCount = () => {
    let count = 0
    Object.values(currentRecords).forEach((records: any) => {
      if (Array.isArray(records)) {
        count += records.length
      }
    })
    return count
  }

  // Format records for API payload: { type: [string, ...] }
  const getFormattedRecords = () => {
    const formatted: Record<string, string[]> = {}

    Object.entries(currentRecords).forEach(([type, records]: [string, any]) => {
      if (Array.isArray(records)) {
        if (type === "MX") {
          // MX records: array of objects, use .exchange
          formatted[type] = records.map((mx: any) =>
            typeof mx === "string" ? mx : mx.exchange
          ).filter(Boolean)
        } else if (type === "TXT") {
          // TXT records: array of strings or arrays of strings
          formatted[type] = records.flat().map((txt: any) => String(txt))
        } else {
          // Other types: flatten to string
          formatted[type] = records.map((rec: any) =>
            typeof rec === "string" ? rec : rec.data || rec.value || rec
          ).filter(Boolean)
        }
      }
    })

    return formatted
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>

      <DialogContent className="!max-w-4xl max-h-[90vh] w-full p-0 gap-0 overflow-hidden">
        
        <div className="flex h-[600px]">
          {/* Left Sidebar - Step Navigation */}
          <div className="w-64 border-r bg-muted/30 p-6 space-y-1">
            <div className="mb-6">
              <h3 className="font-semibold text-sm">Add Domain</h3>
              <p className="text-xs text-muted-foreground mt-1">Setup wizard</p>
            </div>

            {steps.map((s, idx) => {
              const status = getStepStatus(s.id)
              const Icon = s.icon

              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg transition-colors",
                    status === "current" && "bg-accent/10 border border-accent/20",
                    status === "complete" && "opacity-60",
                    status === "upcoming" && "opacity-40",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium",
                      status === "complete" && "border-accent bg-accent text-foreground",
                      status === "current" && "border-accent bg-background",
                      status === "upcoming" && "border-muted-foreground/30 bg-background text-muted-foreground",
                    )}
                  >
                    {status === "complete" ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", status === "current" && "")}>{s.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-8">
              {/* Step 1: Enter Domain */}
              {step === "domain" && (
                <div className="space-y-6 max-w-md">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Enter your domain</h2>
                    <p className="text-sm text-muted-foreground">
                      We'll analyze your current DNS configuration and help you migrate to our DNS service
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="domain" className="text-base">
                      Domain Name
                    </Label>
                    <Input
                      id="domain"
                      placeholder="example.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleDomainSubmit()}
                      className="font-mono h-11 text-base"
                    />
                    <p className="text-xs text-muted-foreground">Enter without www or http:// prefix</p>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Your website will continue working during the migration process
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step 2: Fetching DNS */}
              {step === "fetching" && (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <Loader2 className="h-12 w-12 animate-spin" />
                  <div className="text-center space-y-3">
                    <h2 className="text-xl font-semibold">Analyzing {domain}</h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Fetching nameservers</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Discovering DNS records</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing configuration</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Nameservers */}
              {step === "nameservers" && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Update nameservers</h2>
                    <p className="text-sm text-muted-foreground">
                      Change your nameservers at your domain registrar to activate our DNS service
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        <p className="text-sm font-medium">Current Nameservers</p>
                      </div>
                      <div className="space-y-2">
                        {currentNS.map((ns, idx) => (
                          <div key={idx} className="p-3 rounded-lg border bg-muted/30">
                            <span className="font-mono text-xs text-muted-foreground">{ns}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-accent" />
                        <p className="text-sm font-medium">Required Nameservers</p>
                      </div>
                      <div className="space-y-2">
                        {sparrowNS.map((ns, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg border border-accent/20 bg-accent/5"
                          >
                            <span className="font-mono text-xs">{ns}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(ns)}
                              className="h-7 w-7 p-0"
                            >
                              {copiedNS === ns ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      DNS propagation typically takes 1-4 hours. Your website will continue working during the
                      transition.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step 4: Verification */}
              {step === "verification" && (
                <div className="space-y-6 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                      <Server className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">Verify nameserver update</h2>
                    <p className="text-sm text-muted-foreground">
                      Check if your nameservers have been updated successfully
                    </p>
                  </div>

                  {isVerified ? (
                    <Alert className="border-accent bg-accent/10">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Verified!</strong> Your domain is now using our nameservers.
                      </AlertDescription>
                    </Alert>
                  ) : verificationAttempt > 0 ? (
                    <Alert className="border-orange-500/50 bg-orange-500/5">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <AlertDescription className="text-xs">
                        Nameservers not updated yet. This is normal if you just made the change. DNS propagation can
                        take up to 4 hours.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      Click verify to check nameserver status
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Step 5: Import Records */}
              {step === "import" && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Import DNS records</h2>
                    <p className="text-sm text-muted-foreground">
                      {getTotalRecordCount() > 0 
                        ? `We found ${getTotalRecordCount()} existing DNS records. Choose how to proceed.`
                        : `No existing DNS records found. We'll create a new zone for ${domain}. Choose how to proceed.`
                      }
                    </p>
                  </div>

                  {getTotalRecordCount() > 0 && (
                    <div className="rounded-lg border overflow-hidden">
                      <div className="grid grid-cols-4 gap-3 p-3 border-b bg-muted/50 text-xs font-medium">
                        <span>Type</span>
                        <span>Name</span>
                        <span>Value</span>
                        <span className="text-right">TTL</span>
                      </div>
                      <div className="divide-y max-h-[280px] overflow-y-auto">
                        {Object.entries(getFormattedRecords()).map(([type, values], idx) =>
                          Array.isArray(values)
                            ? values.map((value, vIdx) => (
                                <div key={`${type}-${vIdx}`} className="grid grid-cols-4 gap-3 p-3 text-xs hover:bg-muted/30">
                                  <Badge variant="outline" className="font-mono text-xs h-5 w-fit">
                                    {type}
                                  </Badge>
                                  <span className="font-mono text-muted-foreground">{domain}</span>
                                  <span
                                    className="font-mono truncate"
                                    title={
                                      typeof value === 'object'
                                        ? JSON.stringify(value)
                                        : String(value)
                                    }
                                  >
                                    {typeof value === 'object'
                                      ? Object.entries(value)
                                          .map(([k, v]) => `${k}: ${v}`)
                                          .join(', ')
                                      : String(value)}
                                  </span>
                                  <span className="text-muted-foreground text-right">-</span>
                                </div>
                              ))
                            : null
                        )}
                      </div>
                    </div>
                  )}

                  {getTotalRecordCount() === 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        No existing DNS records found for {domain}. We'll create a new zone with basic records.
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Step 6: Complete */}
              {step === "complete" && (
                <div className="flex flex-col items-center justify-center h-full space-y-6 max-w-md mx-auto">
                  <div className="rounded-full bg-accent/10 p-6">
                    <CheckCircle2 className="h-16 w-16" />
                  </div>

                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-semibold">Domain added successfully!</h2>
                    <p className="text-sm text-muted-foreground">
                      <strong className="font-mono">{domain}</strong> is now managed by our DNS service
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 w-full pt-4">
                    <div className="text-center p-4 rounded-lg border bg-muted/30">
                      <Server className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-xs font-medium">DNS Active</p>
                    </div>
                    <div className="text-center p-4 rounded-lg border bg-muted/30">
                      <FileText className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-xs font-medium">{getTotalRecordCount()} Records</p>
                    </div>
                    <div className="text-center p-4 rounded-lg border bg-muted/30">
                      <Globe className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-xs font-medium">Ready</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t p-6 bg-muted/20">
              <div className="flex justify-between gap-3">
                {step === "domain" && (
                  <>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
                      Cancel
                    </Button>
                    <Button onClick={handleDomainSubmit} disabled={!domain || isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </>
                )}

                {step === "nameservers" && (
                  <Button onClick={() => setStep("verification")} className="ml-auto">
                    I've Updated Nameservers
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                {step === "verification" && (
                  <>
                    {!isVerified && (
                      <Button onClick={handleSkipVerification} variant="outline" className="bg-transparent">
                        Skip for Now
                      </Button>
                    )}
                    <Button onClick={handleVerifyNS} disabled={isLoading} className="ml-auto">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : isVerified ? (
                        <>
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        "Verify Now"
                      )}
                    </Button>
                  </>
                )}

                {step === "import" && (
                  <>
                    <Button
                      onClick={() => handleImportRecords(false)}
                      variant="outline"
                      disabled={isLoading}
                      className="bg-transparent"
                    >
                      Start Fresh
                    </Button>
                    <Button onClick={() => handleImportRecords(true)} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          {getTotalRecordCount() > 0 ? 'Import All Records' : 'Create Zone'}
                        </>
                      )}
                    </Button>
                  </>
                )}

                {step === "complete" && (
                  <>
                    <Button onClick={handleComplete} variant="outline" className="bg-transparent">
                      Add Another Domain
                    </Button>
                    <Button onClick={handleComplete}>Go to Dashboard</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}