"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Bell,
  Trash2,
  Download,
  Upload,
  Plus,
  X,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfileMutation } from "@/store/api/auth";

const teamMembers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@sparrowdns.com",
    role: "Owner",
    status: "active",
    joinedAt: "2023-01-15",
  },
  {
    id: 2,
    name: "John Developer",
    email: "john@example.com",
    role: "Developer",
    status: "active",
    joinedAt: "2023-06-20",
  },
  {
    id: 3,
    name: "Sarah Manager",
    email: "sarah@example.com",
    role: "Manager",
    status: "active",
    joinedAt: "2023-08-10",
  },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [webhookNotifications, setWebhookNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    bio: "",
    phone: "",
    website: "",
    profilePhoto: "",
  });

  // Populate form data when user data is available
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        company: user.company || "",
        bio: user.bio || "",
        phone: user.phone || "",
        website: user.website || "",
        profilePhoto: user.profilePhoto || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      const response = await updateProfile(profileData).unwrap();
      console.log("Profile updated successfully:", response);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      const errorMessage =
        error?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  const handleInviteMember = () => {
    console.log("Handle Invite");
    setShowInviteDialog(false);
  };

  const handleRemoveMember = (name: string) => {
    console.log("Handle Remove");
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {user?.firstName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    {user?.lastName?.charAt(0)?.toUpperCase() || ''}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  disabled
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={profileData.company}
                  onChange={(e) =>
                    setProfileData({ ...profileData, company: e.target.value })
                  }
                />
              </div>
            </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={profileData.website}
                    onChange={(e) =>
                      setProfileData({ ...profileData, website: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure which emails you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="email-notifications"
                    className="text-base flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email Notifications
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Receive email notifications for important events
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="zone-alerts" className="text-base">
                    Zone Alerts
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Get notified about zone changes and issues
                  </div>
                </div>
                <Switch id="zone-alerts" defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="api-alerts" className="text-base">
                    API Alerts
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Notifications for API rate limits and errors
                  </div>
                </div>
                <Switch id="api-alerts" defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="billing-alerts" className="text-base">
                    Billing Alerts
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Updates about invoices and payments
                  </div>
                </div>
                <Switch id="billing-alerts" defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-emails" className="text-base">
                    Marketing Emails
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Product updates and feature announcements
                  </div>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>

              <Button>
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Notifications</CardTitle>
              <CardDescription>
                Configure webhook endpoints for real-time notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="webhook-notifications"
                    className="text-base flex items-center gap-2"
                  >
                    <Bell className="h-4 w-4" />
                    Enable Webhooks
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Send notifications to your webhook endpoint
                  </div>
                </div>
                <Switch
                  id="webhook-notifications"
                  checked={webhookNotifications}
                  onCheckedChange={setWebhookNotifications}
                />
              </div>

              {webhookNotifications && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      type="url"
                      placeholder="https://api.example.com/webhooks"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Webhook Secret</Label>
                    <Input
                      id="webhook-secret"
                      type="password"
                      placeholder="Enter webhook secret"
                    />
                  </div>

                  <Button>
                    Save Webhook Settings
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage your team members and their roles
                  </CardDescription>
                </div>
                <Button onClick={() => setShowInviteDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-accent/10  border-accent/20 capitalize"
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {member.joinedAt}
                        </TableCell>
                        <TableCell className="text-right">
                          {member.role !== "Owner" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.name)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {showInviteDialog && (
            <Card>
              <CardHeader>
                <CardTitle>Invite Team Member</CardTitle>
                <CardDescription>
                  Send an invitation to join your team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select defaultValue="developer">
                    <SelectTrigger id="invite-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleInviteMember}>Send Invitation</Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowInviteDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Team Roles & Permissions</CardTitle>
              <CardDescription>Understanding team member roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border p-4">
                <div className="font-medium mb-1">Owner</div>
                <div className="text-sm text-muted-foreground">
                  Full access to all features, billing, and team management
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="font-medium mb-1">Manager</div>
                <div className="text-sm text-muted-foreground">
                  Can manage domains, DNS records, and view analytics
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="font-medium mb-1">Developer</div>
                <div className="text-sm text-muted-foreground">
                  Can manage DNS records and access API keys
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="font-medium mb-1">Viewer</div>
                <div className="text-sm text-muted-foreground">
                  Read-only access to domains and analytics
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>
                Configure your timezone and regional preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">
                      UTC (Coordinated Universal Time)
                    </SelectItem>
                    <SelectItem value="est">
                      EST (Eastern Standard Time)
                    </SelectItem>
                    <SelectItem value="pst">
                      PST (Pacific Standard Time)
                    </SelectItem>
                    <SelectItem value="cet">
                      CET (Central European Time)
                    </SelectItem>
                    <SelectItem value="jst">
                      JST (Japan Standard Time)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select defaultValue="iso">
                  <SelectTrigger id="date-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iso">YYYY-MM-DD (ISO 8601)</SelectItem>
                    <SelectItem value="us">MM/DD/YYYY (US)</SelectItem>
                    <SelectItem value="eu">DD/MM/YYYY (EU)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveProfile}>Save Preferences</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the dashboard looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select defaultValue="system">
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode" className="text-base">
                    Compact Mode
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Reduce spacing for more content density
                  </div>
                </div>
                <Switch id="compact-mode" />
              </div>

              <Button onClick={handleSaveProfile}>Save Appearance</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard Preferences</CardTitle>
              <CardDescription>
                Customize your dashboard experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="show-tips" className="text-base">
                    Show Tips
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Display helpful tips throughout the dashboard
                  </div>
                </div>
                <Switch id="show-tips" defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-refresh" className="text-base">
                    Auto-refresh Data
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically refresh dashboard data
                  </div>
                </div>
                <Switch id="auto-refresh" defaultChecked />
              </div>

              <Button onClick={handleSaveProfile}>
                Save Dashboard Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Download your account data and DNS records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export all your DNS zones, records, and account information in
                JSON format.
              </p>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export All Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>Manage your API access and keys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="api-access"
                    className="text-base flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    API Access Enabled
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Allow API access to your account
                  </div>
                </div>
                <Switch id="api-access" defaultChecked />
              </div>
              <Button variant="outline" asChild>
                <a href="/api">Manage API Keys</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-start gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <div className="font-medium text-destructive mb-1">
                      Delete Account
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data.
                    </div>
                  </div>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}