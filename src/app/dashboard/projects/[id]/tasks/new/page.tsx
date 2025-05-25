import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/project-actions";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface NewTaskPageProps {
  params: {
    id: string;
  };
  searchParams: {
    status?: string;
  };
}

export default async function NewTaskPage({ params, searchParams }: NewTaskPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const project = await getProjectById(resolvedParams.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">
      {" "}
      <div className="flex items-center gap-4">
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
          <h1 className="text-2xl font-bold tracking-tight">Create Task</h1>
          <p className="text-muted-foreground">Add a new task to {project.title}</p>
        </div>
      </div>{" "}
      <div className="max-w-2xl">
        <TaskForm
          projectId={resolvedParams.id}
          initialStatus={resolvedSearchParams.status}
        />
      </div>
    </div>
  );
}
