"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Server, Globe, Shield, Copy, Check } from "lucide-react"
import { useState } from "react"

export default function NameserversPage() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
  

          <div className="p-6 space-y-6">
            <Tabs defaultValue="nameservers" className="w-full">
              <TabsList>
                <TabsTrigger value="nameservers">Nameservers</TabsTrigger>
                <TabsTrigger value="whitelabel">White-label</TabsTrigger>
                <TabsTrigger value="network">Network Status</TabsTrigger>
              </TabsList>

              <TabsContent value="nameservers" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Default Nameservers</CardTitle>
                    <CardDescription>Point your domains to these nameservers to use SparrowDNS</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {["ns1.sparrowdns.com", "ns2.sparrowdns.com", "ns3.sparrowdns.com", "ns4.sparrowdns.com"].map(
                      (ns, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg border border-border p-4"
                        >
                          <div className="flex items-center gap-3">
                            <Server className="h-5 w-5 text-muted-foreground" />
                            <code className="font-mono text-sm font-medium">{ns}</code>
                            <Badge variant="outline" className="bg-accent/10  border-accent/20">
                              Active
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ns)}>
                            {copied ? <Check className="h-4 w-4 " /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      ),
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Nameserver Locations</CardTitle>
                    <CardDescription>Global anycast network for optimal performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[
                        { location: "North America", pops: 12, status: "operational" },
                        { location: "Europe", pops: 15, status: "operational" },
                        { location: "Asia Pacific", pops: 10, status: "operational" },
                        { location: "South America", pops: 4, status: "operational" },
                        { location: "Africa", pops: 3, status: "operational" },
                        { location: "Middle East", pops: 5, status: "operational" },
                      ].map((region, idx) => (
                        <div key={idx} className="rounded-lg border border-border p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{region.location}</div>
                            <Badge variant="outline" className="bg-accent/10  border-accent/20">
                              {region.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">{region.pops} Points of Presence</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="whitelabel" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Nameservers</CardTitle>
                    <CardDescription>Use your own branded nameservers (Business plan and above)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="whitelabel-enabled" className="text-base">
                          Enable White-label Nameservers
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          Use custom branded nameservers for your domains
                        </div>
                      </div>
                      <Switch id="whitelabel-enabled" />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ns1">Primary Nameserver (ns1)</Label>
                        <Input id="ns1" placeholder="ns1.yourdomain.com" className="font-mono" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ns2">Secondary Nameserver (ns2)</Label>
                        <Input id="ns2" placeholder="ns2.yourdomain.com" className="font-mono" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ns3">Tertiary Nameserver (ns3)</Label>
                        <Input id="ns3" placeholder="ns3.yourdomain.com" className="font-mono" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ns4">Quaternary Nameserver (ns4)</Label>
                        <Input id="ns4" placeholder="ns4.yourdomain.com" className="font-mono" />
                      </div>
                    </div>

                    <Button>Save Custom Nameservers</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Setup Instructions</CardTitle>
                    <CardDescription>How to configure your custom nameservers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Step 1: Create Glue Records</h4>
                      <p className="text-sm text-muted-foreground">
                        At your domain registrar, create glue records pointing your nameserver hostnames to our IP
                        addresses:
                      </p>
                      <div className="rounded-lg bg-muted p-4 space-y-1 font-mono text-sm">
                        <div>ns1.yourdomain.com → 192.0.2.1</div>
                        <div>ns2.yourdomain.com → 192.0.2.2</div>
                        <div>ns3.yourdomain.com → 192.0.2.3</div>
                        <div>ns4.yourdomain.com → 192.0.2.4</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Step 2: Configure Above</h4>
                      <p className="text-sm text-muted-foreground">
                        Enter your custom nameserver hostnames in the form above and save.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Step 3: Update Your Domains</h4>
                      <p className="text-sm text-muted-foreground">
                        Point your domains to your new custom nameservers at your registrar.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="network" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Network Status</CardTitle>
                    <CardDescription>Real-time status of our global DNS network</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-accent" />
                          <div>
                            <div className="font-medium">All Systems Operational</div>
                            <div className="text-sm text-muted-foreground">All nameservers are responding normally</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-accent/10  border-accent/20">
                          100% Uptime
                        </Badge>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-border p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-5 w-5 text-muted-foreground" />
                            <div className="font-medium">Global Response Time</div>
                          </div>
                          <div className="text-3xl font-bold">12ms</div>
                          <div className="text-sm text-muted-foreground">Average across all regions</div>
                        </div>

                        <div className="rounded-lg border border-border p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-5 w-5 text-muted-foreground" />
                            <div className="font-medium">DDoS Protection</div>
                          </div>
                          <div className="text-3xl font-bold">Active</div>
                          <div className="text-sm text-muted-foreground">Multi-layer protection enabled</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Incidents</CardTitle>
                    <CardDescription>Service disruptions and maintenance windows</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Check className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No incidents in the last 90 days</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
       
  )
}
