"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Key, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const securityLogs = [
  {
    id: 1,
    event: "API Key Created",
    timestamp: "2024-01-15 14:32:10",
    ip: "192.168.1.100",
    status: "success",
  },
  {
    id: 2,
    event: "Login Successful",
    timestamp: "2024-01-15 09:15:22",
    ip: "192.168.1.100",
    status: "success",
  },
  {
    id: 3,
    event: "Failed Login Attempt",
    timestamp: "2024-01-14 23:45:33",
    ip: "203.0.113.42",
    status: "failed",
  },
  {
    id: 4,
    event: "Password Changed",
    timestamp: "2024-01-12 16:20:15",
    ip: "192.168.1.100",
    status: "success",
  },
];

export default function SecurityPage() {
  return (
      

      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Overview</CardTitle>
            <CardDescription>Your account security status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 " />
                  <div className="font-medium">Two-Factor Auth</div>
                </div>
                <div className="text-sm text-muted-foreground">Enabled</div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 " />
                  <div className="font-medium">Strong Password</div>
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div className="font-medium">Last Login</div>
                </div>
                <div className="text-sm text-muted-foreground">2 hours ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              Manage your authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label
                  htmlFor="2fa"
                  className="text-base flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Two-Factor Authentication
                </Label>
                <div className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </div>
              </div>
              <Switch id="2fa" defaultChecked />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>Update Password</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Access Control</CardTitle>
            <CardDescription>
              Configure IP restrictions and access policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="ip-whitelist" className="text-base">
                  IP Whitelist
                </Label>
                <div className="text-sm text-muted-foreground">
                  Only allow access from specific IP addresses
                </div>
              </div>
              <Switch id="ip-whitelist" />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="api-rate-limit" className="text-base">
                  API Rate Limiting
                </Label>
                <div className="text-sm text-muted-foreground">
                  Protect against abuse with rate limits
                </div>
              </div>
              <Switch id="api-rate-limit" defaultChecked />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="session-timeout" className="text-base">
                  Session Timeout
                </Label>
                <div className="text-sm text-muted-foreground">
                  Automatically log out after inactivity
                </div>
              </div>
              <Switch id="session-timeout" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DNSSEC</CardTitle>
            <CardDescription>
              Domain Name System Security Extensions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label
                  htmlFor="dnssec"
                  className="text-base flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  Enable DNSSEC
                </Label>
                <div className="text-sm text-muted-foreground">
                  Cryptographically sign your DNS records
                </div>
              </div>
              <Switch id="dnssec" />
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium mb-1">Important</div>
                  <div className="text-muted-foreground">
                    After enabling DNSSEC, you must add the DS records to your
                    domain registrar. Failure to do so will make your domain
                    unreachable.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Activity Log</CardTitle>
            <CardDescription>
              Recent security events and login attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.event}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.timestamp}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ip}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.status === "success"
                              ? "bg-accent/10  border-accent/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
}
