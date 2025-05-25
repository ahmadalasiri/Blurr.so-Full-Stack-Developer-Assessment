import { z } from "zod";

// Employee validation schemas
export const employeeSchema = z.object({
  employeeId: z
    .string()
    .min(1, "Employee ID is required")
    .max(20, "Employee ID must be less than 20 characters")
    .regex(/^[A-Z0-9]+$/, "Employee ID must contain only uppercase letters and numbers"),
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  joiningDate: z.date({
    required_error: "Joining date is required",
    invalid_type_error: "Please enter a valid date",
  }),
  basicSalary: z
    .number({
      required_error: "Basic salary is required",
      invalid_type_error: "Basic salary must be a number",
    })
    .min(0, "Basic salary must be a positive number")
    .max(1000000, "Basic salary cannot exceed 1,000,000"),
  department: z.string().max(50, "Department must be less than 50 characters").optional().or(z.literal("")),
  position: z.string().max(50, "Position must be less than 50 characters").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const createEmployeeSchema = employeeSchema;

export const updateEmployeeSchema = employeeSchema.partial().extend({
  id: z.string().min(1, "Employee ID is required"),
});

export const employeeFilterSchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.enum(["name", "employeeId", "joiningDate", "basicSalary", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// TypeScript types
export type Employee = z.infer<typeof employeeSchema> & {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type EmployeeFilter = z.infer<typeof employeeFilterSchema>;

// Form-specific schemas (for client-side forms)
export const employeeFormSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  joiningDate: z.string().min(1, "Joining date is required"), // String for form input
  basicSalary: z.string().min(1, "Basic salary is required"), // String for form input
  department: z.string().optional(),
  position: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type EmployeeFormInput = z.infer<typeof employeeFormSchema>;

// Utility functions
export function validateEmployeeId(
  employeeId: string,
  existingIds: string[] = [],
): {
  isValid: boolean;
  error?: string;
} {
  if (!employeeId) {
    return { isValid: false, error: "Employee ID is required" };
  }

  if (!/^[A-Z0-9]+$/.test(employeeId)) {
    return { isValid: false, error: "Employee ID must contain only uppercase letters and numbers" };
  }

  if (existingIds.includes(employeeId)) {
    return { isValid: false, error: "Employee ID already exists" };
  }

  return { isValid: true };
}

export function validateEmail(email?: string): {
  isValid: boolean;
  error?: string;
} {
  if (!email || email === "") {
    return { isValid: true }; // Email is optional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  return { isValid: true };
}

export function validateSalary(salary: number): {
  isValid: boolean;
  error?: string;
} {
  if (salary < 0) {
    return { isValid: false, error: "Salary must be a positive number" };
  }

  if (salary > 1000000) {
    return { isValid: false, error: "Salary cannot exceed 1,000,000" };
  }

  return { isValid: true };
}

// Constants
export const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
  "Customer Support",
  "Legal",
] as const;

export const POSITIONS = [
  "Intern",
  "Junior Developer",
  "Senior Developer",
  "Lead Developer",
  "Engineering Manager",
  "Product Manager",
  "Designer",
  "Marketing Specialist",
  "Sales Representative",
  "HR Specialist",
  "Accountant",
  "Operations Specialist",
] as const;

export type Department = (typeof DEPARTMENTS)[number];
export type Position = (typeof POSITIONS)[number];
