"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, CreditCard, Download } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["Up to 3 domains", "1M queries/month", "Basic DNS records", "Community support", "99.9% uptime SLA"],
    current: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    features: [
      "Up to 25 domains",
      "10M queries/month",
      "All DNS record types",
      "Priority support",
      "99.95% uptime SLA",
      "API access",
      "Advanced analytics",
    ],
    current: false,
  },
  {
    name: "Business",
    price: "$99",
    period: "per month",
    features: [
      "Up to 100 domains",
      "100M queries/month",
      "All DNS record types",
      "24/7 priority support",
      "99.99% uptime SLA",
      "Full API access",
      "Advanced analytics",
      "Custom nameservers",
      "White-label options",
    ],
    current: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact sales",
    features: [
      "Unlimited domains",
      "Unlimited queries",
      "All DNS record types",
      "Dedicated support",
      "99.999% uptime SLA",
      "Full API access",
      "Advanced analytics",
      "Custom nameservers",
      "Full white-label",
      "Custom integrations",
      "SLA guarantees",
    ],
    current: false,
  },
]

const invoices = [
  {
    id: "INV-2024-001",
    date: "2024-01-01",
    amount: "$99.00",
    status: "paid",
    plan: "Business",
  },
  {
    id: "INV-2023-012",
    date: "2023-12-01",
    amount: "$99.00",
    status: "paid",
    plan: "Business",
  },
  {
    id: "INV-2023-011",
    date: "2023-11-01",
    amount: "$99.00",
    status: "paid",
    plan: "Business",
  },
]

export default function BillingPage() {
  return (
   

          <div className="p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>You are currently on the Business plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">$99.00</div>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Next billing date</div>
                    <div className="font-medium">February 1, 2024</div>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-sm text-muted-foreground">Domains Used</div>
                    <div className="text-2xl font-bold">24 / 100</div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-sm text-muted-foreground">Queries This Month</div>
                    <div className="text-2xl font-bold">2.4M / 100M</div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-sm text-muted-foreground">API Calls</div>
                    <div className="text-2xl font-bold">342K</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {plans.map((plan) => (
                  <Card key={plan.name} className={plan.current ? "border-accent" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{plan.name}</CardTitle>
                        {plan.current && (
                          <Badge variant="outline" className="bg-accent/10  border-accent/20">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-sm text-muted-foreground ml-2">{plan.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4  mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" variant={plan.current ? "outline" : "default"} disabled={plan.current}>
                        {plan.current ? "Current Plan" : plan.name === "Enterprise" ? "Contact Sales" : "Upgrade"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Manage your payment information</CardDescription>
                  </div>
                  <Button variant="outline">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Update Card
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-16 items-center justify-center rounded-lg border border-border bg-muted">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-medium">Visa ending in 4242</div>
                    <div className="text-sm text-muted-foreground">Expires 12/2025</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View and download past invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell>{invoice.plan}</TableCell>
                          <TableCell className="font-medium">{invoice.amount}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-accent/10  border-accent/20">
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
       
  )
}
