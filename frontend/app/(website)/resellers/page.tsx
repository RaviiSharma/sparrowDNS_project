"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreVertical, Users, Globe, Activity, DollarSign, Settings, Eye } from "lucide-react"

const resellers = [
  {
    id: "res_001",
    name: "TechHost Solutions",
    email: "admin@techhost.com",
    status: "active",
    plan: "Enterprise",
    tenants: 45,
    zones: 234,
    queriesMonth: "12.4M",
    revenue: "$2,250",
    whitelabel: true,
    nameservers: "ns1.techhost.com",
    created: "2024-01-15",
  },
  {
    id: "res_002",
    name: "CloudServe Inc",
    email: "billing@cloudserve.io",
    status: "active",
    plan: "Business",
    tenants: 28,
    zones: 156,
    queriesMonth: "8.2M",
    revenue: "$1,680",
    whitelabel: true,
    nameservers: "ns1.cloudserve.io",
    created: "2024-02-20",
  },
  {
    id: "res_003",
    name: "WebPro Hosting",
    email: "ops@webpro.net",
    status: "active",
    plan: "Pro",
    tenants: 12,
    zones: 67,
    queriesMonth: "3.1M",
    revenue: "$720",
    whitelabel: false,
    nameservers: "Default",
    created: "2024-03-10",
  },
  {
    id: "res_004",
    name: "Digital Ventures",
    email: "admin@digitalventures.com",
    status: "suspended",
    plan: "Business",
    tenants: 8,
    zones: 34,
    queriesMonth: "1.2M",
    revenue: "$0",
    whitelabel: false,
    nameservers: "Default",
    created: "2024-02-05",
  },
  {
    id: "res_005",
    name: "HostMaster Pro",
    email: "support@hostmaster.com",
    status: "active",
    plan: "Enterprise",
    tenants: 67,
    zones: 412,
    queriesMonth: "18.9M",
    revenue: "$3,350",
    whitelabel: true,
    nameservers: "ns1.hostmaster.com",
    created: "2023-11-08",
  },
]

export default function ResellersPage() {
  return (
     <div className="p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Resellers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">4 active, 1 suspended</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">160</div>
                  <p className="text-xs text-muted-foreground">Across all resellers</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Queries</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">43.8M</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$8,000</div>
                  <p className="text-xs text-muted-foreground">From active resellers</p>
                </CardContent>
              </Card>
            </div>

            {/* Resellers Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Reseller Accounts</CardTitle>
                    <CardDescription>Manage your reseller partners and their tenants</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search resellers..." className="pl-8 w-[250px]" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reseller</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead className="text-right">Tenants</TableHead>
                      <TableHead className="text-right">Zones</TableHead>
                      <TableHead className="text-right">Queries/Month</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead>White-label</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resellers.map((reseller) => (
                      <TableRow key={reseller.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{reseller.name}</span>
                            <span className="text-xs text-muted-foreground">{reseller.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={reseller.status === "active" ? "default" : "secondary"}
                            className={
                              reseller.status === "active"
                                ? "bg-accent/10  border-accent/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }
                          >
                            {reseller.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{reseller.plan}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{reseller.tenants}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{reseller.zones}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{reseller.queriesMonth}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{reseller.revenue}</TableCell>
                        <TableCell>
                          {reseller.whitelabel ? (
                            <div className="flex flex-col">
                              <Badge variant="outline" className="w-fit bg-primary/10 text-primary border-primary/20">
                                Enabled
                              </Badge>
                              <span className="text-xs text-muted-foreground mt-1">{reseller.nameservers}</span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="bg-muted">
                              Default
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                Configure
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="mr-2 h-4 w-4" />
                                Manage Tenants
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                {reseller.status === "active" ? "Suspend" : "Activate"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* White-label Configuration */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>White-label Settings</CardTitle>
                  <CardDescription>Configure branding for reseller portals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom Domain</label>
                    <Input placeholder="dns.yourcompany.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Brand Name</label>
                    <Input placeholder="Your DNS Service" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Support Email</label>
                    <Input placeholder="support@yourcompany.com" />
                  </div>
                  <Button className="w-full">Save White-label Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reseller Quotas</CardTitle>
                  <CardDescription>Set default limits for new resellers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Tenants</label>
                    <Input type="number" placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Zones per Tenant</label>
                    <Input type="number" placeholder="50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Query Limit</label>
                    <Input placeholder="10,000,000" />
                  </div>
                  <Button className="w-full">Update Default Quotas</Button>
                </CardContent>
              </Card>
            </div>
          </div>
  )
}
