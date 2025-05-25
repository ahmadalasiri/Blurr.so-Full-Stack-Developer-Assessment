"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProjectStatusColor, getProjectStatusLabel } from "@/lib/project-validation";
import { CalendarDays, DollarSign, Users, Edit, KanbanSquare, List, Plus } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { ProjectForm } from "./project-form";
import { TasksTable } from "../tasks/tasks-table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ProjectDetailProps {
  project: any;
  tasks: any[];
  employees?: any[];
}

export function ProjectDetail({ project, tasks, employees = [] }: ProjectDetailProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const completedTasks = tasks.filter((task) => task.status === "DONE").length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{project.title}</CardTitle>
                <Badge className={`mt-2 ${getProjectStatusColor(project.status)}`}>
                  {getProjectStatusLabel(project.status)}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Dialog
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <ProjectForm
                      project={project}
                      onSuccess={() => setIsEditDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {project.description && <p className="text-muted-foreground mb-4">{project.description}</p>}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {project.startDate && (
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Started: {format(new Date(project.startDate), "MMM dd, yyyy")}</span>
                </div>
              )}

              {project.endDate && (
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Due: {format(new Date(project.endDate), "MMM dd, yyyy")}</span>
                </div>
              )}

              {project.budget && (
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Budget: ${project.budget.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{totalTasks} tasks</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Completion</span>
                  <span>{progressPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Tasks</span>
                  <span className="font-medium">{totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed</span>
                  <span className="font-medium text-green-600">{completedTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining</span>
                  <span className="font-medium text-orange-600">{totalTasks - completedTasks}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/dashboard/projects/${project.id}/tasks/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
            >
              <Link href={`/dashboard/projects/${project.id}/kanban`}>
                <KanbanSquare className="mr-2 h-4 w-4" />
                Kanban Board
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
            >
              <Link href={`/dashboard/projects/${project.id}/backlog`}>
                <List className="mr-2 h-4 w-4" />
                Task Backlog
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {" "}
          {tasks.length > 0 ? (
            <TasksTable
              tasks={tasks.slice(0, 5)}
              employees={employees}
              showProject={false}
            />
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No tasks yet</h3>
              <p className="text-muted-foreground mb-4">Start by creating your first task for this project.</p>
              <Button asChild>
                <Link href={`/dashboard/projects/${project.id}/tasks/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Link>
              </Button>
            </div>
          )}
          {tasks.length > 5 && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                asChild
              >
                <Link href={`/dashboard/projects/${project.id}/backlog`}>View All Tasks ({tasks.length})</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
