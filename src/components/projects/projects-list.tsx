"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProjectStatusColor, getProjectStatusLabel, PROJECT_STATUS } from "@/lib/project-validation";
import { CalendarDays, DollarSign, Search, Users, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteProject } from "@/lib/project-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Project } from "@/lib/project-validation";

interface ProjectsListProps {
  projects: Project[];
}

export function ProjectsList({ projects: initialProjects }: ProjectsListProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    const result = await deleteProject(id);
    if (result.success) {
      toast.success("Project deleted successfully");
      setProjects(projects.filter((p) => p.id !== id));
    } else {
      toast.error(result.error || "Failed to delete project");
    }
  };

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No projects yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Get started by creating your first project to organize tasks and track progress.
          </p>
          <Button asChild>
            <Link href="/dashboard/projects/new">Create Project</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {PROJECT_STATUS.map((status) => (
                  <SelectItem
                    key={status.value}
                    value={status.value}
                  >
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                  <Badge className={cn("mt-2", getProjectStatusColor(project.status))}>
                    {getProjectStatusLabel(project.status)}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/projects/${project.id}/kanban`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Kanban Board
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/projects/${project.id}/backlog`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Task Backlog
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteProject(project.id, project.title)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {project.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description}</p>
              )}

              <div className="space-y-2 text-sm">
                {project.startDate && (
                  <div className="flex items-center text-muted-foreground">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Started {format(new Date(project.startDate), "MMM dd, yyyy")}
                  </div>
                )}

                {project.budget && (
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Budget: ${project.budget.toLocaleString()}
                  </div>
                )}

                <div className="flex items-center text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  {project.tasks?.length || 0} tasks
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href={`/dashboard/projects/${project.id}`}>View Project</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && projects.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No projects found</h3>
            <p className="text-muted-foreground text-center">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
