import { notFound } from "next/navigation";
import { getProjectById, getTasksByProject, getProjectEmployees } from "@/lib/project-actions";
import { TasksBacklog } from "@/components/projects/tasks-backlog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface BacklogPageProps {
  params: {
    id: string;
  };
}

export default async function BacklogPage({ params }: BacklogPageProps) {
  const resolvedParams = await params;
  const [project, tasks, employees] = await Promise.all([
    getProjectById(resolvedParams.id),
    getTasksByProject(resolvedParams.id).catch(() => []),
    getProjectEmployees(resolvedParams.id).catch(() => []),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {" "}
          <Button
            variant="outline"
            size="icon"
            asChild
          >
            <Link href={`/dashboard/projects/${resolvedParams.id}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.title} - Task Backlog</h1>
            <p className="text-muted-foreground">Complete view of all project tasks with filtering and sorting</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/projects/${resolvedParams.id}/tasks/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Link>
        </Button>
      </div>{" "}
      <Suspense fallback={<div>Loading tasks...</div>}>
        <TasksBacklog
          tasks={tasks}
          projectId={resolvedParams.id}
          employees={employees}
        />
      </Suspense>
    </div>
  );
}
