import { ProjectForm } from "@/components/projects/project-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          asChild
        >
          <Link href="/dashboard/projects">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Project</h1>
          <p className="text-muted-foreground">Set up a new project to organize tasks and track progress</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <ProjectForm />
      </div>
    </div>
  );
}
