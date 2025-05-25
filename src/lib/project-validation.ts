import { z } from "zod";

// Project validation schemas
export const projectSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
    description: z.string().max(1000, "Description must be less than 1000 characters").optional().or(z.literal("")),
    status: z.enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]).default("PLANNING"),
    startDate: z.date().optional().nullable(),
    endDate: z.date().optional().nullable(),
    budget: z.number().min(0, "Budget must be positive").optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export const projectFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  status: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.string().optional(),
});

export const projectFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
  startDateFrom: z.date().optional(),
  startDateTo: z.date().optional(),
});

// Task validation schemas
export const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "TESTING", "DONE", "CANCELLED"]).default("TODO"),
  estimatedHours: z.number().min(0, "Estimated hours must be positive").optional().nullable(),
  actualHours: z.number().min(0, "Actual hours must be positive").optional().nullable(),
  dueDate: z.date().optional().nullable(),
  projectId: z.string().min(1, "Project is required"),
  assigneeId: z.string().optional().nullable(),
});

export const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  priority: z.string(),
  status: z.string(),
  estimatedHours: z.string().optional(),
  actualHours: z.string().optional(),
  dueDate: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
  assigneeId: z.string().optional(),
});

export const taskFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "TESTING", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().optional(),
  projectId: z.string().optional(),
  dueDateFrom: z.date().optional(),
  dueDateTo: z.date().optional(),
});

// Types
export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectFormInput = z.infer<typeof projectFormSchema>;
export type ProjectFormData = z.infer<typeof projectFormSchema>;
export type ProjectFilters = z.infer<typeof projectFiltersSchema>;

export type TaskInput = z.infer<typeof taskSchema>;
export type TaskFormInput = z.infer<typeof taskFormSchema>;
export type TaskFormData = z.infer<typeof taskFormSchema>;
export type TaskFilters = z.infer<typeof taskFiltersSchema>;

// Additional types for components
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  assigneeId?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Constants
export const PROJECT_STATUS = [
  { value: "PLANNING", label: "Planning" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const TASK_STATUS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "TESTING", label: "Testing" },
  { value: "DONE", label: "Done" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const TASK_PRIORITY = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

// Enums for type safety
export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  TESTING = "TESTING",
  DONE = "DONE",
  CANCELLED = "CANCELLED",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum ProjectStatus {
  PLANNING = "PLANNING",
  IN_PROGRESS = "IN_PROGRESS",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Utility functions
export function getProjectStatusLabel(status: string): string {
  const statusData = PROJECT_STATUS.find((s) => s.value === status);
  return statusData?.label || status;
}

export function getTaskStatusLabel(status: string): string {
  const statusData = TASK_STATUS.find((s) => s.value === status);
  return statusData?.label || status;
}

export function getTaskPriorityLabel(priority: string): string {
  const priorityData = TASK_PRIORITY.find((p) => p.value === priority);
  return priorityData?.label || priority;
}

export function getPriorityColor(priority: string): string {
  const colors = {
    LOW: "bg-gray-100 text-gray-800",
    MEDIUM: "bg-blue-100 text-blue-800",
    HIGH: "bg-orange-100 text-orange-800",
    URGENT: "bg-red-100 text-red-800",
  };
  return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800";
}

export function getStatusColor(status: string): string {
  const colors = {
    TODO: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    IN_REVIEW: "bg-yellow-100 text-yellow-800",
    TESTING: "bg-orange-100 text-orange-800",
    DONE: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
}

export function getProjectStatusColor(status: string): string {
  const colors = {
    PLANNING: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    ON_HOLD: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
}
