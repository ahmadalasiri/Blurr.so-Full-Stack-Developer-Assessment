"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateSalary, SalaryCalculation } from "@/lib/salary-utils";

// Extended types with relations
export type SalaryRecordWithEmployee = any;
export type EmployeeWithSalaryRecords = any;

// Types for salary management

export interface SalaryRecordInput {
  employeeId: string;
  month: number;
  year: number;
  bonus?: number;
  deductions?: number;
  allowances?: number;
  overtimeHours?: number;
  overtimeRate?: number;
  notes?: string;
}

export interface SalaryReportFilters {
  month?: number;
  year?: number;
  department?: string;
  status?: string;
  employeeId?: string;
}

// Server Actions
export async function createSalaryRecord(data: SalaryRecordInput) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // Verify employee belongs to user
    const employee = await prisma.employee.findFirst({
      where: {
        id: data.employeeId,
        userId: user.id,
      },
    });

    if (!employee) {
      return { success: false, error: "Employee not found" };
    }

    // Check if salary record already exists for this month/year
    const existingRecord = await prisma.salaryRecord.findUnique({
      where: {
        employeeId_month_year: {
          employeeId: data.employeeId,
          month: data.month,
          year: data.year,
        },
      },
    });

    if (existingRecord) {
      return {
        success: false,
        error: "Salary record already exists for this month/year",
      };
    }

    // Calculate salary
    const calculation = calculateSalary(
      employee.basicSalary,
      data.bonus || 0,
      data.deductions || 0,
      data.allowances || 0,
      data.overtimeHours || 0,
      data.overtimeRate || 0,
    );

    // Create salary record
    const salaryRecord = await prisma.salaryRecord.create({
      data: {
        employeeId: data.employeeId,
        month: data.month,
        year: data.year,
        basicSalary: employee.basicSalary,
        bonus: data.bonus || 0,
        deductions: data.deductions || 0,
        allowances: data.allowances || 0,
        overtimeHours: data.overtimeHours || 0,
        overtimeRate: data.overtimeRate || 0,
        totalSalary: calculation.netSalary,
        notes: data.notes,
        status: "DRAFT",
      },
      include: {
        employee: true,
      },
    });

    revalidatePath("/dashboard/employees");
    return { success: true, data: salaryRecord };
  } catch (error) {
    console.error("Create salary record error:", error);
    return {
      success: false,
      error: "Failed to create salary record",
    };
  }
}

export async function updateSalaryRecord(id: string, data: Partial<SalaryRecordInput>) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // Verify salary record belongs to user's employee
    const existingRecord = await prisma.salaryRecord.findFirst({
      where: {
        id,
        employee: {
          userId: user.id,
        },
      },
      include: {
        employee: true,
      },
    });

    if (!existingRecord) {
      return { success: false, error: "Salary record not found" };
    } // Calculate updated salary
    const calculation = calculateSalary(
      existingRecord.employee.basicSalary,
      data.bonus ?? existingRecord.bonus,
      data.deductions ?? existingRecord.deductions,
      data.allowances ?? existingRecord.allowances,
      data.overtimeHours ?? existingRecord.overtimeHours ?? 0,
      data.overtimeRate ?? existingRecord.overtimeRate ?? 0,
    );

    // Update salary record
    const updatedRecord = await prisma.salaryRecord.update({
      where: { id },
      data: {
        bonus: data.bonus ?? existingRecord.bonus,
        deductions: data.deductions ?? existingRecord.deductions,
        allowances: data.allowances ?? existingRecord.allowances,
        overtimeHours: data.overtimeHours ?? existingRecord.overtimeHours,
        overtimeRate: data.overtimeRate ?? existingRecord.overtimeRate,
        totalSalary: calculation.netSalary,
        notes: data.notes ?? existingRecord.notes,
      },
      include: {
        employee: true,
      },
    });

    revalidatePath("/dashboard/employees");
    return { success: true, data: updatedRecord };
  } catch (error) {
    console.error("Update salary record error:", error);
    return {
      success: false,
      error: "Failed to update salary record",
    };
  }
}

export async function getSalaryRecords(filters: SalaryReportFilters = {}) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const where: any = {
      employee: {
        userId: user.id,
      },
    };

    // Apply filters
    if (filters.month) where.month = filters.month;
    if (filters.year) where.year = filters.year;
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    if (filters.department) {
      where.employee.department = filters.department;
    }

    const salaryRecords = await prisma.salaryRecord.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            department: true,
            position: true,
            basicSalary: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { employee: { name: "asc" } }],
    });

    return { success: true, data: salaryRecords };
  } catch (error) {
    console.error("Get salary records error:", error);
    return {
      success: false,
      error: "Failed to fetch salary records",
    };
  }
}

export async function generateMonthlySalaryReport(month: number, year: number) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // Get all active employees
    const employees = await prisma.employee.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    // Check for existing salary records
    const existingRecords = await prisma.salaryRecord.findMany({
      where: {
        month,
        year,
        employee: {
          userId: user.id,
        },
      },
    });
    const existingEmployeeIds = new Set(existingRecords.map((r: any) => r.employeeId));
    const employeesWithoutRecords = employees.filter((emp: any) => !existingEmployeeIds.has(emp.id));

    // Create salary records for employees without records
    const newRecords = await Promise.all(
      employeesWithoutRecords.map((employee: any) =>
        prisma.salaryRecord.create({
          data: {
            employeeId: employee.id,
            month,
            year,
            basicSalary: employee.basicSalary,
            bonus: 0,
            deductions: 0,
            allowances: 0,
            overtimeHours: 0,
            overtimeRate: 0,
            totalSalary: employee.basicSalary,
            status: "DRAFT",
          },
          include: {
            employee: true,
          },
        }),
      ),
    );

    // Get all records for the month
    const allRecords = await getSalaryRecords({ month, year });

    revalidatePath("/dashboard/employees");
    return {
      success: true,
      data: allRecords.data,
      newRecordsCount: newRecords.length,
    };
  } catch (error) {
    console.error("Generate monthly salary report error:", error);
    return {
      success: false,
      error: "Failed to generate salary report",
    };
  }
}

export async function approveSalaryRecord(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const updatedRecord = await prisma.salaryRecord.update({
      where: {
        id,
        employee: {
          userId: user.id,
        },
      },
      data: {
        status: "APPROVED",
        processedAt: new Date(),
      },
      include: {
        employee: true,
      },
    });

    revalidatePath("/dashboard/employees");
    return { success: true, data: updatedRecord };
  } catch (error) {
    console.error("Approve salary record error:", error);
    return {
      success: false,
      error: "Failed to approve salary record",
    };
  }
}

export async function deleteSalaryRecord(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    await prisma.salaryRecord.delete({
      where: {
        id,
        employee: {
          userId: user.id,
        },
      },
    });

    revalidatePath("/dashboard/employees");
    return { success: true };
  } catch (error) {
    console.error("Delete salary record error:", error);
    return {
      success: false,
      error: "Failed to delete salary record",
    };
  }
}

// Additional utility functions
export async function getAllEmployees() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Authentication required");
    }

    const employees = await prisma.employee.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        basicSalary: true,
        department: true,
        position: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return employees;
  } catch (error) {
    console.error("Get all employees error:", error);
    throw new Error("Failed to fetch employees");
  }
}

export async function getSalaryRecordsWithFilters(
  filters: SalaryReportFilters = {},
): Promise<SalaryRecordWithEmployee[]> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Authentication required");
    }

    const where: any = {
      employee: {
        userId: user.id,
      },
    };

    // Apply filters
    if (filters.month) where.month = filters.month;
    if (filters.year) where.year = filters.year;
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    if (filters.department) {
      where.employee = {
        ...where.employee,
        department: {
          contains: filters.department,
          mode: "insensitive",
        },
      };
    }

    const salaryRecords = await prisma.salaryRecord.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            department: true,
            position: true,
            basicSalary: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    // Calculate computed fields
    const recordsWithCalculations = salaryRecords.map((record: any) => {
      const calculation = calculateSalary(
        record.basicSalary,
        record.bonus,
        record.deductions,
        record.allowances,
        record.overtimeHours || 0,
        record.overtimeRate || 0,
      );

      return {
        ...record,
        grossSalary: calculation.grossSalary,
        totalDeductions: calculation.totalDeductions,
        netSalary: calculation.netSalary,
        overtimePay: calculation.overtimePay,
      };
    });

    return recordsWithCalculations;
  } catch (error) {
    console.error("Get salary records with filters error:", error);
    throw new Error("Failed to fetch salary records");
  }
}
