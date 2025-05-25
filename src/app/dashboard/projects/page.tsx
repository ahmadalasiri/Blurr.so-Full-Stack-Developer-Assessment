import { Suspense } from "react";
import { ProjectsList } from "@/components/projects/projects-list";
import { ProjectStats } from "@/components/projects/project-stats";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getProjects, getProjectStats } from "@/lib/project-actions";
import Link from "next/link";

export default async function ProjectsPage() {
  const [projects, statsResult] = await Promise.all([getProjects(), getProjectStats()]);

  const stats = statsResult.success ? statsResult.data : null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and track progress</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {stats && (
        <Suspense fallback={<div>Loading stats...</div>}>
          <ProjectStats stats={stats} />
        </Suspense>
      )}

      <Suspense fallback={<div>Loading projects...</div>}>
        <ProjectsList projects={projects} />
      </Suspense>
    </div>
  );
}
