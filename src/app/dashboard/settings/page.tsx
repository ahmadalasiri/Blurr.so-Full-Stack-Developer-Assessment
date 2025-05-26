import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Bell, Shield, Database, Download, Upload, Trash2, Save, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="container p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and system settings.</p>
        </div>
      </div>

      <Tabs
        defaultValue="profile"
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent
          value="profile"
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    defaultValue={session?.user?.name || ""}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={session?.user?.email || ""}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    placeholder="Your job title"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent
          value="notifications"
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to be notified about important events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Assignments</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when tasks are assigned to team members
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Project Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about project status changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Employee Changes</Label>
                    <p className="text-sm text-muted-foreground">Get notified about new employees and status updates</p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Salary Processing</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about salary calculations and payments
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent
          value="security"
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and privacy settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Change Password</h4>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="Enter current password"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                  <Button className="mt-4">Update Password</Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Session Management</h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Current Session</Label>
                      <p className="text-sm text-muted-foreground">You are currently signed in</p>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Sign Out All Devices
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Privacy Settings</h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">Control who can see your profile information</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent
          value="data"
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>Export, import, and manage your data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Export Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download your data in various formats for backup or transfer purposes.
                  </p>
                  <div className="grid gap-2 md:grid-cols-3">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export Projects
                    </Button>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export Employees
                    </Button>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export Salary Data
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-3">Import Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">Import data from CSV files or other sources.</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Import Employees
                    </Button>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Import Projects
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-3 text-red-600">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    These actions cannot be undone. Please be careful.
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete All Projects
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete All Employee Data
                    </Button>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent
          value="system"
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Preferences
              </CardTitle>
              <CardDescription>Configure system-wide settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact View</Label>
                    <p className="text-sm text-muted-foreground">Use a more compact layout for tables and lists</p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-save</Label>
                    <p className="text-sm text-muted-foreground">Automatically save form data while typing</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Language</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save System Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Information about your HR Portal instance.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Version</Label>
                  <p className="text-sm text-muted-foreground">v1.0.0</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground">May 26, 2025</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Database</Label>
                  <p className="text-sm text-muted-foreground">SQLite</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Environment</Label>
                  <Badge variant="outline">Development</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
