"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskStatus, TaskPriority, type Task, type User } from "@/lib/project-validation";
import { updateTaskStatus } from "@/lib/project-actions";
import { useRouter } from "next/navigation";

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  employees: User[];
}

const statusColumns = [
  { status: TaskStatus.TODO, title: "To Do", color: "bg-slate-100" },
  { status: TaskStatus.IN_PROGRESS, title: "In Progress", color: "bg-blue-100" },
  { status: TaskStatus.IN_REVIEW, title: "In Review", color: "bg-yellow-100" },
  { status: TaskStatus.DONE, title: "Done", color: "bg-green-100" },
];

const priorityColors = {
  [TaskPriority.LOW]: "bg-green-100 text-green-800",
  [TaskPriority.MEDIUM]: "bg-yellow-100 text-yellow-800",
  [TaskPriority.HIGH]: "bg-orange-100 text-orange-800",
  [TaskPriority.URGENT]: "bg-red-100 text-red-800",
};

export function KanbanBoard({ tasks, projectId, employees }: KanbanBoardProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setIsUpdating(taskId);
    try {
      await updateTaskStatus(taskId, newStatus);
      router.refresh();
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || "Unassigned";
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statusColumns.map((column) => (
        <div
          key={column.status}
          className="space-y-4"
        >
          <div className={`p-4 rounded-lg ${column.color}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{getTasksByStatus(column.status).length}</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push(`/dashboard/projects/${projectId}/tasks/new?status=${column.status}`)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {getTasksByStatus(column.status).map((task) => (
              <Card
                key={task.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/dashboard/projects/${projectId}/tasks/${task.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
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
                        {statusColumns
                          .filter((col) => col.status !== task.status)
                          .map((col) => (
                            <DropdownMenuItem
                              key={col.status}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task.id, col.status);
                              }}
                              disabled={isUpdating === task.id}
                            >
                              Move to {col.title}
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {task.description && <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={priorityColors[task.priority]}
                      variant="secondary"
                    >
                      {task.priority}
                    </Badge>
                    {task.assignedToId && (
                      <span className="text-xs text-gray-500">{getEmployeeName(task.assignedToId)}</span>
                    )}
                  </div>
                  {task.dueDate && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
