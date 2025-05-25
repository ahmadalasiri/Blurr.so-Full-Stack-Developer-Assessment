import { notFound } from "next/navigation";
import { getTaskById } from "@/lib/project-actions";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditTaskPageProps {
  params: Promise<{ id: string; taskId: string }>;
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id: projectId, taskId } = await params;

  try {
    const task = await getTaskById(taskId);

    if (!task || task.projectId !== projectId) {
      notFound();
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/projects/${projectId}/tasks/${taskId}`}>
            <Button
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Task
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Task</h1>
        </div>

        <TaskForm
          projectId={projectId}
          task={task}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading task:", error);
    notFound();
  }
}
