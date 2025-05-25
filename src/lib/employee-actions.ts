"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeFilterSchema,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
  type EmployeeFilter,
} from "@/lib/employee-validation";
import { Prisma } from "@prisma/client";

// Use Prisma types directly instead of creating our own
// Prisma already defines these types in its generated client
// We'll use proper type assertions in the functions

// Types for return values
type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
};

// Helper function to get current user
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

// Create Employee
export async function createEmployee(input: CreateEmployeeInput): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    // Validate input
    const validatedData = createEmployeeSchema.parse(input);

    // Check if employee ID already exists for this user
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        userId: user.id,
      },
    });

    if (existingEmployee) {
      return {
        success: false,
        error: "Employee ID already exists",
        errors: { employeeId: "Employee ID already exists" },
      };
    }

    // Check if email already exists (if provided)
    if (validatedData.email) {
      const existingEmailEmployee = await prisma.employee.findFirst({
        where: {
          email: validatedData.email,
          userId: user.id,
        },
      });

      if (existingEmailEmployee) {
        return {
          success: false,
          error: "Email already exists",
          errors: { email: "Email already exists" },
        };
      }
    }

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        ...validatedData,
        email: validatedData.email || null,
        department: validatedData.department || null,
        position: validatedData.position || null,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard/employees");

    return {
      success: true,
      data: employee,
    };
  } catch (error) {
    console.error("Create employee error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      redirect("/login");
    }

    if (error instanceof Error && error.name === "PrismaClientValidationError") {
      return {
        success: false,
        error: "Invalid data provided",
      };
    }

    return {
      success: false,
      error: "Failed to create employee. Please try again.",
    };
  }
}

// Get Employees (with filtering and pagination)
export async function getEmployees(filters: Partial<EmployeeFilter> = {}): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    // Apply default values if not provided
    const filtersWithDefaults = {
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
      ...filters,
    };

    // Validate filters
    const validatedFilters = employeeFilterSchema.parse(filtersWithDefaults);
    const { search, department, isActive, page, limit, sortBy, sortOrder } = validatedFilters; // Build where clause
    const where = {
      userId: user.id,
      ...(isActive !== undefined && { isActive }),
      ...(department && { department }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { employeeId: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { position: { contains: search, mode: "insensitive" } },
        ],
      }),
    } as const;

    // Get total count for pagination
    const totalCount = await prisma.employee.count({ where });

    // Get employees
    const employees = await prisma.employee.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            assignedTasks: true,
            salaryRecords: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        employees,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Get employees error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      redirect("/login");
    }

    return {
      success: false,
      error: "Failed to fetch employees. Please try again.",
    };
  }
}

// Get Single Employee
export async function getEmployee(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    const employee = await prisma.employee.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        assignedTasks: {
          include: {
            project: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5, // Latest 5 tasks
        },
        salaryRecords: {
          orderBy: {
            year: "desc",
            month: "desc",
          },
          take: 12, // Latest 12 months
        },
        _count: {
          select: {
            assignedTasks: true,
            salaryRecords: true,
          },
        },
      },
    });

    if (!employee) {
      return {
        success: false,
        error: "Employee not found",
      };
    }

    return {
      success: true,
      data: employee,
    };
  } catch (error) {
    console.error("Get employee error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      redirect("/login");
    }

    return {
      success: false,
      error: "Failed to fetch employee. Please try again.",
    };
  }
}

// Update Employee
export async function updateEmployee(input: UpdateEmployeeInput): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    // Validate input
    const validatedData = updateEmployeeSchema.parse(input);
    const { id, ...updateData } = validatedData;

    // Check if employee exists and belongs to user
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingEmployee) {
      return {
        success: false,
        error: "Employee not found",
      };
    }

    // Check if employee ID already exists (if being updated)
    if (updateData.employeeId) {
      const duplicateEmployee = await prisma.employee.findFirst({
        where: {
          employeeId: updateData.employeeId,
          userId: user.id,
          NOT: { id },
        },
      });

      if (duplicateEmployee) {
        return {
          success: false,
          error: "Employee ID already exists",
          errors: { employeeId: "Employee ID already exists" },
        };
      }
    }

    // Check if email already exists (if being updated)
    if (updateData.email) {
      const duplicateEmailEmployee = await prisma.employee.findFirst({
        where: {
          email: updateData.email,
          userId: user.id,
          NOT: { id },
        },
      });

      if (duplicateEmailEmployee) {
        return {
          success: false,
          error: "Email already exists",
          errors: { email: "Email already exists" },
        };
      }
    }

    // Update employee
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...updateData,
        email: updateData.email || null,
        department: updateData.department || null,
        position: updateData.position || null,
      },
    });

    revalidatePath("/dashboard/employees");
    revalidatePath(`/dashboard/employees/${id}`);

    return {
      success: true,
      data: employee,
    };
  } catch (error) {
    console.error("Update employee error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      redirect("/login");
    }

    if (error instanceof Error && error.name === "PrismaClientValidationError") {
      return {
        success: false,
        error: "Invalid data provided",
      };
    }

    return {
      success: false,
      error: "Failed to update employee. Please try again.",
    };
  }
}

// Delete Employee (soft delete)
export async function deleteEmployee(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    // Check if employee exists and belongs to user
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingEmployee) {
      return {
        success: false,
        error: "Employee not found",
      };
    }

    // Soft delete by setting isActive to false
    await prisma.employee.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/dashboard/employees");

    return {
      success: true,
      data: { message: "Employee deleted successfully" },
    };
  } catch (error) {
    console.error("Delete employee error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      redirect("/login");
    }

    return {
      success: false,
      error: "Failed to delete employee. Please try again.",
    };
  }
}

// Restore Employee
export async function restoreEmployee(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    // Check if employee exists and belongs to user
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingEmployee) {
      return {
        success: false,
        error: "Employee not found",
      };
    }

    // Restore by setting isActive to true
    await prisma.employee.update({
      where: { id },
      data: { isActive: true },
    });

    revalidatePath("/dashboard/employees");

    return {
      success: true,
      data: { message: "Employee restored successfully" },
    };
  } catch (error) {
    console.error("Restore employee error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      redirect("/login");
    }

    return {
      success: false,
      error: "Failed to restore employee. Please try again.",
    };
  }
}

// Get Employee Statistics
export async function getEmployeeStats(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    const [totalActive, totalInactive, totalEmployees, avgSalary, recentJoins] = await Promise.all([
      prisma.employee.count({
        where: { userId: user.id, isActive: true },
      }),
      prisma.employee.count({
        where: { userId: user.id, isActive: false },
      }),
      prisma.employee.count({
        where: { userId: user.id },
      }),
      prisma.employee.aggregate({
        where: { userId: user.id, isActive: true },
        _avg: { basicSalary: true },
      }),
      prisma.employee.count({
        where: {
          userId: user.id,
          joiningDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalActive,
        totalInactive,
        totalEmployees,
        averageSalary: avgSalary._avg.basicSalary || 0,
        recentJoins,
      },
    };
  } catch (error) {
    console.error("Get employee stats error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      redirect("/login");
    }

    return {
      success: false,
      error: "Failed to fetch employee statistics.",
    };
  }
}
