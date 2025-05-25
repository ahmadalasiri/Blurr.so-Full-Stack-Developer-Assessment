import { z } from "zod";

// Salary record validation schema
export const salaryRecordSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  month: z.number().min(1).max(12, "Month must be between 1 and 12"),
  year: z.number().min(2020).max(2030, "Year must be between 2020 and 2030"),
  bonus: z.number().min(0, "Bonus must be positive").default(0),
  deductions: z.number().min(0, "Deductions must be positive").default(0),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

export const salaryReportFiltersSchema = z.object({
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2020).max(2030).optional(),
  department: z.string().optional(),
  status: z.enum(["DRAFT", "APPROVED", "PAID"]).optional(),
  employeeId: z.string().optional(),
});

// Form schemas for React Hook Form - keeping all fields as strings for forms
export const salaryRecordFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  month: z.string().min(1, "Month is required"),
  year: z.string().min(1, "Year is required"),
  bonus: z.string(),
  deductions: z.string(),
  notes: z.string().optional(),
});

// Types
export type SalaryRecordInput = z.infer<typeof salaryRecordSchema>;
export type SalaryRecordFormInput = z.infer<typeof salaryRecordFormSchema>;
export type SalaryRecordFormData = z.infer<typeof salaryRecordFormSchema>;
export type SalaryReportFilters = z.infer<typeof salaryReportFiltersSchema>;

// Constants
export const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export const SALARY_STATUS = [
  { value: "DRAFT", label: "Draft" },
  { value: "APPROVED", label: "Approved" },
  { value: "PAID", label: "Paid" },
];

// Utility functions
export function getMonthName(month: number): string {
  const monthData = MONTHS.find((m) => m.value === month);
  return monthData?.label || "Unknown";
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getYearOptions(
  startYear: number = 2020,
  endYear: number = 2030,
): Array<{ value: number; label: string }> {
  const years = [];
  for (let year = endYear; year >= startYear; year--) {
    years.push({ value: year, label: year.toString() });
  }
  return years;
}
