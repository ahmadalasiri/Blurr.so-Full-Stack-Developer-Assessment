import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FolderOpen, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface ProjectStatsProps {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    pendingTasks: number;
  };
}

export function ProjectStats({ stats }: ProjectStatsProps) {
  const completionRate = stats.totalTasks > 0 ? ((stats.totalTasks - stats.pendingTasks) / stats.totalTasks) * 100 : 0;

  const activeRate = stats.totalProjects > 0 ? (stats.activeProjects / stats.totalProjects) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProjects}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeProjects} active, {stats.completedProjects} completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.activeProjects}</div>
          <div className="flex items-center space-x-2">
            <Progress
              value={activeRate}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground">{activeRate.toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.completedProjects}</div>
          <p className="text-xs text-muted-foreground">Successfully delivered</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Task Progress</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalTasks - stats.pendingTasks}/{stats.totalTasks}
          </div>
          <div className="flex items-center space-x-2">
            <Progress
              value={completionRate}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground">{completionRate.toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
