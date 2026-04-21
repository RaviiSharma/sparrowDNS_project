"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Code,
  Terminal,
  Webhook,
  Cloud,
  GitBranch,
  Key,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  Download,
  Settings,
  Plus,
} from "lucide-react";

const webhooks = [
  {
    id: "wh_001",
    name: "Zone Update Notifications",
    url: "https://api.example.com/webhooks/dns",
    events: ["zone.created", "zone.updated", "zone.deleted"],
    status: "active",
    lastTriggered: "2 hours ago",
  },
  {
    id: "wh_002",
    name: "Record Change Alerts",
    url: "https://hooks.slack.com/services/T00/B00/XXX",
    events: ["record.created", "record.updated"],
    status: "active",
    lastTriggered: "5 minutes ago",
  },
  {
    id: "wh_003",
    name: "Health Check Failures",
    url: "https://api.pagerduty.com/incidents",
    events: ["health.failed", "health.recovered"],
    status: "inactive",
    lastTriggered: "3 days ago",
  },
];

const cloudProviders = [
  {
    name: "AWS Route53",
    icon: "☁️",
    status: "connected",
    zones: 12,
    lastSync: "1 hour ago",
  },
  {
    name: "Cloudflare",
    icon: "🔶",
    status: "connected",
    zones: 8,
    lastSync: "30 minutes ago",
  },
  {
    name: "Google Cloud DNS",
    icon: "🔵",
    status: "not_connected",
    zones: 0,
    lastSync: "Never",
  },
  {
    name: "Azure DNS",
    icon: "🔷",
    status: "not_connected",
    zones: 0,
    lastSync: "Never",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="api" className="space-y-6">
        <TabsList>
          <TabsTrigger value="api">
            <Code className="mr-2 h-4 w-4" />
            API & CLI
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="mr-2 h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="cloud">
            <Cloud className="mr-2 h-4 w-4" />
            Cloud Providers
          </TabsTrigger>
          <TabsTrigger value="devops">
            <GitBranch className="mr-2 h-4 w-4" />
            DevOps
          </TabsTrigger>
        </TabsList>

        {/* API & CLI Tab */}
        <TabsContent value="api" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  CLI Tool
                </CardTitle>
                <CardDescription>
                  Command-line interface for DNS management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                  <div className="text-muted-foreground"># Install via npm</div>
                  <div className="flex items-center justify-between">
                    <span>npm install -g @sparrowdns/cli</span>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                  <div className="text-muted-foreground">
                    # Configure authentication
                  </div>
                  <div className="flex items-center justify-between">
                    <span>sparrow auth login</span>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download CLI
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Docs
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API Access
                </CardTitle>
                <CardDescription>
                  RESTful API for programmatic access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Endpoint</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value="https://api.sparrowdns.com/v1"
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Version</label>
                  <Badge variant="outline" className="font-mono">
                    v1.0.0
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Key className="mr-2 h-4 w-4" />
                    Manage API Keys
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    API Docs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start Examples</CardTitle>
              <CardDescription>
                Common API operations to get you started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">List all zones</div>
                <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span>
                      curl -H "Authorization: Bearer YOUR_API_KEY"
                      https://api.sparrowdns.com/v1/zones
                    </span>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Create a DNS record</div>
                <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span>
                      {
                        'curl -X POST -H "Authorization: Bearer YOUR_API_KEY" -d \'{"type":"A","name":"www","value":"192.0.2.1"}\' https://api.sparrowdns.com/v1/zones/ZONE_ID/records'
                      }
                    </span>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhook Endpoints</CardTitle>
                  <CardDescription>
                    Receive real-time notifications for DNS events
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Endpoint URL</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Triggered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">
                        {webhook.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {webhook.url}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <Badge
                              key={event}
                              variant="outline"
                              className="text-xs"
                            >
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {webhook.status === "active" ? (
                          <Badge
                            variant="default"
                            className="bg-accent/10  border-accent/20"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-muted">
                            <XCircle className="mr-1 h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {webhook.lastTriggered}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            Test
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Events</CardTitle>
              <CardDescription>
                Subscribe to these events in your webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {[
                  "zone.created",
                  "zone.updated",
                  "zone.deleted",
                  "record.created",
                  "record.updated",
                  "record.deleted",
                  "health.failed",
                  "health.recovered",
                  "query.threshold",
                ].map((event) => (
                  <div
                    key={event}
                    className="flex items-center gap-2 rounded-lg border border-border p-3"
                  >
                    <Webhook className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{event}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cloud Providers Tab */}
        <TabsContent value="cloud" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cloud Provider Integrations</CardTitle>
              <CardDescription>
                Import and sync zones from external DNS providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {cloudProviders.map((provider) => (
                  <Card key={provider.name}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{provider.icon}</div>
                          <div>
                            <h3 className="font-semibold">{provider.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {provider.status === "connected"
                                ? `${provider.zones} zones synced`
                                : "Not connected"}
                            </p>
                          </div>
                        </div>
                        {provider.status === "connected" ? (
                          <Badge
                            variant="default"
                            className="bg-accent/10  border-accent/20"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Not Connected</Badge>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Last sync: {provider.lastSync}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        {provider.status === "connected" ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                            >
                              Sync Now
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                            >
                              Configure
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" className="flex-1">
                            Connect
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import Settings</CardTitle>
              <CardDescription>
                Configure how zones are imported from external providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-sync zones</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically sync changes every hour
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Preserve existing records</div>
                  <div className="text-sm text-muted-foreground">
                    Keep local changes during sync
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Conflict resolution</div>
                  <div className="text-sm text-muted-foreground">
                    How to handle sync conflicts
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DevOps Tab */}
        <TabsContent value="devops" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Terraform Provider
                </CardTitle>
                <CardDescription>
                  Infrastructure as Code for DNS management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4 font-mono text-sm space-y-2">
                  <div className="text-muted-foreground">
                    # Add to your terraform configuration
                  </div>
                  <div>terraform {`{`}</div>
                  <div className="pl-4">
                    required_providers {`{`}
                    <div className="pl-4">
                      sparrowdns = {`{`}
                      <div className="pl-4">
                        source = "sparrowdns/sparrowdns"
                      </div>
                      <div className="pl-4">version = "~&gt; 1.0"</div>
                      {`}`}
                    </div>
                    {`}`}
                  </div>
                  <div>{`}`}</div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download Provider
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Docs
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  GitOps Integration
                </CardTitle>
                <CardDescription>
                  Manage DNS records via Git repositories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Repository URL</label>
                  <Input placeholder="https://github.com/yourorg/dns-config" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch</label>
                  <Input placeholder="main" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Config Path</label>
                  <Input placeholder="/zones" />
                </div>
                <Button className="w-full">Connect Repository</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>CI/CD Examples</CardTitle>
              <CardDescription>
                Integrate DNS management into your deployment pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">GitHub Actions</div>
                <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span>
                      {"- uses: sparrowdns/github-action@v1"}
                      <br />
                      {"  with:"}
                      <br />
                      {"    api-key: ${{ secrets.SPARROW_API_KEY }}"}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">GitLab CI</div>
                <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span>
                      deploy:dns:
                      <br />
                      &nbsp;&nbsp;script:
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;- sparrow zone sync --config
                      zones.yaml
                    </span>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
