import { notFound } from "next/navigation";
import { getTaskById } from "@/lib/project-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User as UserIcon, Edit } from "lucide-react";
import Link from "next/link";
import { TaskStatus, TaskPriority } from "@/lib/project-validation";

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

interface TaskDetailPageProps {
  params: Promise<{ id: string; taskId: string }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id: projectId, taskId } = await params;

  try {
    const task = await getTaskById(taskId);

    if (!task || task.projectId !== projectId) {
      notFound();
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/projects/${projectId}`}>
              <Button
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Task Details</h1>
          </div>
          <Link href={`/dashboard/projects/${projectId}/tasks/${taskId}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Task
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-xl">{task.title}</CardTitle>{" "}
                <div className="flex items-center gap-2">
                  <Badge
                    className={statusColors[task.status as TaskStatus]}
                    variant="secondary"
                  >
                    {task.status
                      .replace("_", " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </Badge>
                  <Badge
                    className={priorityColors[task.priority as TaskPriority]}
                    variant="secondary"
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {task.description && (
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Assignee</h3>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span>{task.assigneeId ? "Assigned User" : "Unassigned"}</span>
                  </div>
                </div>

                {task.dueDate && (
                  <div>
                    <h3 className="font-medium mb-2">Due Date</h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Created</h3>
                  <span className="text-gray-600">{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Last Updated</h3>
                  <span className="text-gray-600">{new Date(task.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error loading task:", error);
    notFound();
  }
}
