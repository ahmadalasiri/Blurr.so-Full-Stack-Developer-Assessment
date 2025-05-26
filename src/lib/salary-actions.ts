"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateSalary } from "@/lib/salary-utils";
import type { Employee, SalaryRecord } from "@prisma/client";

// Extended types with relations
export type SalaryRecordWithEmployee = SalaryRecord & {
  employee: Pick<Employee, "id" | "employeeId" | "name" | "department" | "position" | "basicSalary">;
  grossSalary?: number;
  totalDeductions?: number;
  netSalary?: number;
};

export type EmployeeWithSalaryRecords = Employee & {
  salaryRecords: SalaryRecord[];
};

// Types for salary management

export interface SalaryRecordInput {
  employeeId: string;
  month: number;
  year: number;
  bonus?: number;
  deductions?: number;
  notes?: string;
}

export interface SalaryReportFilters {
  month?: number;
  year?: number;
  department?: string;
  status?: "DRAFT" | "APPROVED" | "PAID";
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
    } // Calculate salary
    const calculation = calculateSalary(employee.basicSalary, data.bonus || 0, data.deductions || 0); // Create salary record
    const salaryRecord = await prisma.salaryRecord.create({
      data: {
        employeeId: data.employeeId,
        month: data.month,
        year: data.year,
        basicSalary: employee.basicSalary,
        bonus: data.bonus || 0,
        deductions: data.deductions || 0,
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
    ); // Update salary record
    const updatedRecord = await prisma.salaryRecord.update({
      where: { id },
      data: {
        bonus: data.bonus ?? existingRecord.bonus,
        deductions: data.deductions ?? existingRecord.deductions,
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
    const where = {
      employee: {
        userId: user.id,
        ...(filters.department && {
          department: {
            contains: filters.department,
          },
        }),
      },
      ...(filters.month && { month: filters.month }),
      ...(filters.year && { year: filters.year }),
      ...(filters.employeeId && { employeeId: filters.employeeId }),
      ...(filters.status && { status: filters.status }),
    };

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
    const existingEmployeeIds = new Set(existingRecords.map((r) => r.employeeId));
    const employeesWithoutRecords = employees.filter((emp) => !existingEmployeeIds.has(emp.id));

    // Create salary records for employees without records
    const newRecords = await Promise.all(
      employeesWithoutRecords.map((employee) =>
        prisma.salaryRecord.create({
          data: {
            employeeId: employee.id,
            month,
            year,
            basicSalary: employee.basicSalary,
            bonus: 0,
            deductions: 0,
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

    const where = {
      employee: {
        userId: user.id,
        ...(filters.department && {
          department: {
            contains: filters.department,
          },
        }),
      },
      ...(filters.month && { month: filters.month }),
      ...(filters.year && { year: filters.year }),
      ...(filters.employeeId && { employeeId: filters.employeeId }),
      ...(filters.status && { status: filters.status }),
    };

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
    const recordsWithCalculations = salaryRecords.map((record) => {
      const calculation = calculateSalary(record.basicSalary, record.bonus, record.deductions);

      return {
        ...record,
        grossSalary: calculation.grossSalary,
        totalDeductions: calculation.totalDeductions,
        netSalary: calculation.netSalary,
      };
    });

    return recordsWithCalculations;
  } catch (error) {
    console.error("Get salary records with filters error:", error);
    throw new Error("Failed to fetch salary records");
  }
}

// Dashboard Statistics
export interface SalaryDashboardStats {
  totalRecords: number;
  totalPayroll: number;
  pendingApprovals: number;
  activeEmployees: number;
}

export async function getSalaryDashboardStats(month?: number, year?: number): Promise<SalaryDashboardStats> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Authentication required");
    }

    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    // Base where clause for user's employees
    const baseWhere = {
      employee: {
        userId: user.id,
      },
    };

    // Where clause for current month/year
    const monthYearWhere = {
      ...baseWhere,
      month: targetMonth,
      year: targetYear,
    };

    // Get total records for current month
    const totalRecords = await prisma.salaryRecord.count({
      where: monthYearWhere,
    });

    // Get total payroll for current month
    const payrollAggregation = await prisma.salaryRecord.aggregate({
      where: monthYearWhere,
      _sum: {
        totalSalary: true,
      },
    });

    // Get pending approvals count
    const pendingApprovals = await prisma.salaryRecord.count({
      where: {
        ...baseWhere,
        status: "DRAFT",
      },
    });

    // Get active employees (employees with at least one salary record)
    const activeEmployees = await prisma.employee.count({
      where: {
        userId: user.id,
        salaryRecords: {
          some: {},
        },
      },
    });

    return {
      totalRecords,
      totalPayroll: payrollAggregation._sum.totalSalary || 0,
      pendingApprovals,
      activeEmployees,
    };
  } catch (error) {
    console.error("Get salary dashboard stats error:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}
