"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatus, TaskPriority, type Task, type User } from "@/lib/project-validation";
import { MoreHorizontal, Calendar, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface TasksTableProps {
  tasks: Task[];
  employees: User[];
  projectId?: string;
  showProject?: boolean;
}

const priorityColors = {
  [TaskPriority.LOW]: "bg-green-100 text-green-800",
  [TaskPriority.MEDIUM]: "bg-yellow-100 text-yellow-800",
  [TaskPriority.HIGH]: "bg-orange-100 text-orange-800",
  [TaskPriority.URGENT]: "bg-red-100 text-red-800",
};

const statusColors = {
  [TaskStatus.TODO]: "bg-slate-100 text-slate-800",
  [TaskStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [TaskStatus.IN_REVIEW]: "bg-yellow-100 text-yellow-800",
  [TaskStatus.TESTING]: "bg-purple-100 text-purple-800",
  [TaskStatus.DONE]: "bg-green-100 text-green-800",
  [TaskStatus.CANCELLED]: "bg-red-100 text-red-800",
};

export function TasksTable({ tasks, employees, projectId, showProject = false }: TasksTableProps) {
  const router = useRouter();

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || "Unassigned";
  };

  const handleTaskClick = (task: Task) => {
    if (projectId) {
      router.push(`/dashboard/projects/${projectId}/tasks/${task.id}`);
    } else {
      router.push(`/dashboard/projects/${task.projectId}/tasks/${task.id}`);
    }
  };

  const handleEditTask = (task: Task) => {
    if (projectId) {
      router.push(`/dashboard/projects/${projectId}/tasks/${task.id}/edit`);
    } else {
      router.push(`/dashboard/projects/${task.projectId}/tasks/${task.id}/edit`);
    }
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            <div className="mb-2">No tasks found</div>
            {projectId && (
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/projects/${projectId}/tasks/new`)}
              >
                Create your first task
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tasks ({tasks.length})</span>
          {projectId && (
            <Button
              size="sm"
              onClick={() => router.push(`/dashboard/projects/${projectId}/tasks/new`)}
            >
              Add Task
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              {showProject && <TableHead>Project</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleTaskClick(task)}
              >
                <TableCell>
                  <div>
                    <div className="font-medium">{task.title}</div>
                    {task.description && <div className="text-sm text-gray-500 line-clamp-1">{task.description}</div>}
                  </div>
                </TableCell>
                {showProject && (
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {/* Project name would come from project relation */}
                      Project #{task.projectId.slice(-8)}
                    </span>
                  </TableCell>
                )}
                <TableCell>
                  <Badge
                    className={statusColors[task.status]}
                    variant="secondary"
                  >
                    {task.status
                      .replace("_", " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                </TableCell>{" "}
                <TableCell>
                  <Badge
                    className={priorityColors[task.priority]}
                    variant="secondary"
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{task.assigneeId ? getEmployeeName(task.assigneeId) : "Unassigned"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {task.dueDate ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskClick(task);
                        }}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task);
                        }}
                      >
                        Edit Task
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
  );
}
