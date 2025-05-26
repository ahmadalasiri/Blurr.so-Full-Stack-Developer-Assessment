import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getProjectStats } from "@/lib/project-actions";
import { getEmployeeStats } from "@/lib/employee-actions";
import {
  FolderOpen,
  Users,
  CheckCircle,
  TrendingUp,
  Activity,
  Plus,
  BarChart3,
  Calendar,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

// Force dynamic rendering to prevent static generation
export const dynamic = "force-dynamic";

interface DashboardStats {
  projectStats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    pendingTasks: number;
  };
  employeeStats: {
    totalActive: number;
    totalInactive: number;
    totalEmployees: number;
    averageSalary: number;
    recentJoins: number;
  };
}

async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const [projectStatsResult, employeeStatsResult] = await Promise.all([getProjectStats(), getEmployeeStats()]);

    if (!projectStatsResult.success || !employeeStatsResult.success) {
      return null;
    }

    return {
      projectStats: projectStatsResult.data,
      employeeStats: employeeStatsResult.data,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return null;
  }
}

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getDashboardStats();

  const projectCompletion = stats
    ? stats.projectStats.totalTasks > 0
      ? ((stats.projectStats.totalTasks - stats.projectStats.pendingTasks) / stats.projectStats.totalTasks) * 100
      : 0
    : 0;

  const projectActiveRate = stats
    ? stats.projectStats.totalProjects > 0
      ? (stats.projectStats.activeProjects / stats.projectStats.totalProjects) * 100
      : 0
    : 0;

  return (
    <div className="container p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session?.user?.name || "User"}!</h1>{" "}
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your projects and team today.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
          >
            <Link href="/dashboard/employees/new">
              <Users className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.projectStats.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.projectStats.activeProjects || 0} active, {stats?.projectStats.completedProjects || 0} completed
            </p>
          </CardContent>
        </Card>

        {/* Active Employees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.employeeStats.totalActive || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.employeeStats.recentJoins || 0} joined this month</p>
          </CardContent>
        </Card>

        {/* Task Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(projectCompletion)}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress
                value={projectCompletion}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">{stats?.projectStats.totalTasks || 0} tasks</span>
            </div>
          </CardContent>
        </Card>

        {/* Average Salary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.employeeStats.averageSalary ? stats.employeeStats.averageSalary.toLocaleString() : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Across {stats?.employeeStats.totalActive || 0} employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Project Overview
            </CardTitle>
            <CardDescription>Current project status breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Projects</span>
                <div className="flex items-center gap-2">
                  <div className="w-24">
                    <Progress
                      value={projectActiveRate}
                      className="h-2"
                    />
                  </div>
                  <Badge variant="secondary">{stats?.projectStats.activeProjects || 0}</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700"
                >
                  {stats?.projectStats.completedProjects || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Tasks</span>
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700"
                >
                  {stats?.projectStats.pendingTasks || 0}
                </Badge>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href="/dashboard/projects">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View All Projects
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Overview
            </CardTitle>
            <CardDescription>Employee statistics and recent activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Employees</span>
                <Badge variant="secondary">{stats?.employeeStats.totalEmployees || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active</span>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700"
                >
                  {stats?.employeeStats.totalActive || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recent Joins</span>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700"
                >
                  {stats?.employeeStats.recentJoins || 0}
                </Badge>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href="/dashboard/employees">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Employees
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              asChild
            >
              <Link href="/dashboard/projects/new">
                <FolderOpen className="h-6 w-6" />
                <span>Create Project</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              asChild
            >
              <Link href="/dashboard/employees/new">
                <Users className="h-6 w-6" />
                <span>Add Employee</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              asChild
            >
              <Link href="/dashboard/salary">
                <Calendar className="h-6 w-6" />
                <span>Salary Management</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
