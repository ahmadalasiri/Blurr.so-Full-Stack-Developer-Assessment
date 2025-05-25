"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  taskFormSchema,
  type TaskFormData,
  TASK_STATUS,
  TASK_PRIORITY,
  TaskPriority,
  TaskStatus,
} from "@/lib/project-validation";
import { createTask, updateTask, getAllEmployeesForProjects } from "@/lib/project-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface TaskFormProps {
  task?: {
    id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    estimatedHours?: number;
    actualHours?: number;
    dueDate?: Date;
    assigneeId?: string;
  };
  projectId: string;
  onSuccess?: () => void;
}

export function TaskForm({ task, projectId, onSuccess }: TaskFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<
    Array<{
      id: string;
      name: string;
      employeeId: string;
      department?: string;
      position?: string;
    }>
  >([]);
  const router = useRouter();
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "MEDIUM",
      status: task?.status || "TODO",
      estimatedHours: task?.estimatedHours ? task.estimatedHours.toString() : "",
      actualHours: task?.actualHours ? task.actualHours.toString() : "",
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      projectId: projectId,
      assigneeId: task?.assigneeId || "unassigned",
    },
  });
  useEffect(() => {
    async function loadEmployees() {
      try {
        const employeeList = await getAllEmployeesForProjects();
        setEmployees(employeeList);
      } catch (error) {
        console.error("Failed to load employees:", error);
      }
    }
    loadEmployees();
  }, []);

  async function onSubmit(data: TaskFormData) {
    setIsLoading(true);
    try {
      // Convert form data to server action format
      const taskData = {
        title: data.title,
        description: data.description || undefined,
        priority: data.priority as TaskPriority,
        status: data.status as TaskStatus,
        estimatedHours: data.estimatedHours ? parseInt(data.estimatedHours) : undefined,
        actualHours: data.actualHours ? parseInt(data.actualHours) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        projectId: data.projectId,
        assigneeId: data.assigneeId && data.assigneeId !== "unassigned" ? data.assigneeId : undefined,
      };

      const result = task ? await updateTask(task.id, taskData) : await createTask(taskData);

      if (result.success) {
        toast.success(task ? "Task updated successfully" : "Task created successfully");
        onSuccess?.();
        if (!task) {
          router.push(`/dashboard/projects/${projectId}`);
        }
      } else {
        toast.error(result.error || "Failed to save task");
      }
    } catch {
      toast.error("An error occurred while saving the task");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{task ? "Edit Task" : "Create New Task"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter task title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter task description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_PRIORITY.map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_STATUS.map((status) => (
                          <SelectItem
                            key={status.value}
                            value={status.value}
                          >
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>{" "}
            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem
                          key={employee.id}
                          value={employee.id}
                        >
                          {employee.name} ({employee.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {task ? "Update Task" : "Create Task"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
