import { notFound } from "next/navigation";
import { getProjectById, getTasksByProject, getProjectEmployees } from "@/lib/project-actions";
import { KanbanBoard } from "@/components/projects/kanban-board";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface KanbanPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function KanbanPage({ params }: KanbanPageProps) {
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
            <h1 className="text-2xl font-bold tracking-tight">{project.title} - Kanban Board</h1>
            <p className="text-muted-foreground">Drag and drop tasks to update their status</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/projects/${resolvedParams.id}/tasks/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Link>
        </Button>
      </div>{" "}
      <Suspense fallback={<div>Loading kanban board...</div>}>
        <KanbanBoard
          tasks={tasks}
          projectId={resolvedParams.id}
          employees={employees}
        />
      </Suspense>
    </div>
  );
}
