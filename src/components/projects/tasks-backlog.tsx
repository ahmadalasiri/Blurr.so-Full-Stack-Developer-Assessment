"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/component                  <TableCell>
                    <Badge
                      className={getPriorityColor(task.priority)}
                      variant="secondary"
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.assigneeId ? getEmployeeName(task.assigneeId) : "Unassigned"}</TableCell>
                  <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{new Date(task.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus } from "lucide-react";
import { TaskStatus, TaskPriority, type Task, type User } from "@/lib/project-validation";
import { useRouter } from "next/navigation";

interface TasksBacklogProps {
  tasks: Task[];
  projectId: string;
  employees: User[];
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
  [TaskStatus.DONE]: "bg-green-100 text-green-800",
};

export function TasksBacklog({ tasks, projectId, employees }: TasksBacklogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const router = useRouter();

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || "Unassigned";
  };

  const filteredTasks = tasks.filter((task) => {    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === "all" || task.assigneeId === assigneeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as TaskStatus | "all")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(TaskStatus).map((status) => (
              <SelectItem
                key={status}
                value={status}
              >
                {status
                  .replace("_", " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter}
          onValueChange={(value) => setPriorityFilter(value as TaskPriority | "all")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {Object.values(TaskPriority).map((priority) => (
              <SelectItem
                key={priority}
                value={priority}
              >
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={assigneeFilter}
          onValueChange={setAssigneeFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="">Unassigned</SelectItem>
            {employees.map((employee) => (
              <SelectItem
                key={employee.id}
                value={employee.id}
              >
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => router.push(`/dashboard/projects/${projectId}/tasks/new`)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </div>

      {/* Tasks table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  No tasks found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/dashboard/projects/${projectId}/tasks/${task.id}`)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      {task.description && <div className="text-sm text-gray-500 line-clamp-1">{task.description}</div>}
                    </div>
                  </TableCell>
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
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={priorityColors[task.priority]}
                      variant="secondary"
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.assignedToId ? getEmployeeName(task.assignedToId) : "Unassigned"}</TableCell>
                  <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{new Date(task.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
