"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  projectSchema,
  projectBaseSchema,
  taskSchema,
  type ProjectInput,
  type TaskInput,
  type ProjectFilters,
  type TaskFilters,
} from "@/lib/project-validation";

// Types for server actions
export interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Extended types with relations
export type ProjectWithTasks = any;
export type TaskWithProject = any;
export type TaskWithAssignee = any;

// PROJECT SERVER ACTIONS

export async function createProject(data: ProjectInput): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // Validate input
    const validatedData = projectSchema.parse(data);

    // Create project
    const project = await prisma.project.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
      include: {
        tasks: true,
      },
    });

    revalidatePath("/dashboard/projects");
    return { success: true, data: project };
  } catch (error) {
    console.error("Create project error:", error);
    return {
      success: false,
      error: "Failed to create project",
    };
  }
}

export async function updateProject(id: string, data: Partial<ProjectInput>): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // Verify project belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingProject) {
      return { success: false, error: "Project not found" };
    } // Validate input
    const validatedData = projectBaseSchema.partial().parse(data);

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: validatedData,
      include: {
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                employeeId: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${id}`);
    return { success: true, data: updatedProject };
  } catch (error) {
    console.error("Update project error:", error);
    return {
      success: false,
      error: "Failed to update project",
    };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // Verify project belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingProject) {
      return { success: false, error: "Project not found" };
    }

    // Delete project (tasks will be deleted via cascade)
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (error) {
    console.error("Delete project error:", error);
    return {
      success: false,
      error: "Failed to delete project",
    };
  }
}

export async function getProjects(filters: ProjectFilters = {}): Promise<ProjectWithTasks[]> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Authentication required");
    }

    const where: any = {
      userId: user.id,
    };

    // Apply filters
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters.status) where.status = filters.status;
    if (filters.startDateFrom || filters.startDateTo) {
      where.startDate = {};
      if (filters.startDateFrom) where.startDate.gte = filters.startDateFrom;
      if (filters.startDateTo) where.startDate.lte = filters.startDateTo;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                employeeId: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return projects;
  } catch (error) {
    console.error("Get projects error:", error);
    throw new Error("Failed to fetch projects");
  }
}

export async function getProjectById(id: string): Promise<ProjectWithTasks | null> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Authentication required");
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                employeeId: true,
                department: true,
                position: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return project;
  } catch (error) {
    console.error("Get project by ID error:", error);
    throw new Error("Failed to fetch project");
  }
}

export async function getProjectStats(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const [totalProjects, activeProjects, completedProjects, totalTasks, pendingTasks] = await Promise.all([
      prisma.project.count({
        where: { userId: user.id },
      }),
      prisma.project.count({
        where: { userId: user.id, status: "IN_PROGRESS" },
      }),
      prisma.project.count({
        where: { userId: user.id, status: "COMPLETED" },
      }),
      prisma.task.count({
        where: {
          project: { userId: user.id },
        },
      }),
      prisma.task.count({
        where: {
          project: { userId: user.id },
          status: { in: ["TODO", "IN_PROGRESS", "IN_REVIEW", "TESTING"] },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        pendingTasks,
      },
    };
  } catch (error) {
    console.error("Get project stats error:", error);
    return {
      success: false,
      error: "Failed to fetch project statistics",
    };
  }
}

// TASK SERVER ACTIONS

export async function createTask(data: TaskInput): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Verify assignee belongs to user (if provided)
    if (data.assigneeId) {
      const employee = await prisma.employee.findFirst({
        where: {
          id: data.assigneeId,
          userId: user.id,
        },
      });

      if (!employee) {
        return { success: false, error: "Employee not found" };
      }
    }

    // Validate input
    const validatedData = taskSchema.parse(data);

    // Create task
    const task = await prisma.task.create({
      data: {
        ...validatedData,
        createdById: user.id,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${data.projectId}`);
    return { success: true, data: task };
  } catch (error) {
    console.error("Create task error:", error);
    return {
      success: false,
      error: "Failed to create task",
    };
  }
}

export async function updateTask(id: string, data: Partial<TaskInput>): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // Verify task belongs to user's project
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId: user.id,
        },
      },
      include: {
        project: true,
      },
    });

    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    // Verify assignee belongs to user (if provided)
    if (data.assigneeId) {
      const employee = await prisma.employee.findFirst({
        where: {
          id: data.assigneeId,
          userId: user.id,
        },
      });

      if (!employee) {
        return { success: false, error: "Employee not found" };
      }
    }

    // Validate input
    const validatedData = taskSchema.partial().parse(data);

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: validatedData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${existingTask.projectId}`);
    return { success: true, data: updatedTask };
  } catch (error) {
    console.error("Update task error:", error);
    return {
      success: false,
      error: "Failed to update task",
    };
  }
}

export async function deleteTask(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // Verify task belongs to user's project
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId: user.id,
        },
      },
    });

    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    // Delete task
    await prisma.task.delete({
      where: { id },
    });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${existingTask.projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Delete task error:", error);
    return {
      success: false,
      error: "Failed to delete task",
    };
  }
}

export async function getTasks(filters: TaskFilters = {}): Promise<TaskWithAssignee[]> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Authentication required");
    }

    const where: any = {
      project: {
        userId: user.id,
      },
    };

    // Apply filters
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) where.dueDate.gte = filters.dueDateFrom;
      if (filters.dueDateTo) where.dueDate.lte = filters.dueDateTo;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            department: true,
            position: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return tasks;
  } catch (error) {
    console.error("Get tasks error:", error);
    throw new Error("Failed to fetch tasks");
  }
}

export async function getTasksByProject(projectId: string): Promise<TaskWithAssignee[]> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Authentication required");
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            department: true,
            position: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return tasks;
  } catch (error) {
    console.error("Get tasks by project error:", error);
    throw new Error("Failed to fetch project tasks");
  }
}

export async function getTaskById(taskId: string): Promise<TaskWithAssignee | null> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Authentication required");
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          userId: user.id,
        },
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            department: true,
            position: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return task;
  } catch (error) {
    console.error("Get task by ID error:", error);
    throw new Error("Failed to fetch task");
  }
}

export async function updateTaskStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // Verify task belongs to user's project
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId: user.id,
        },
      },
    });

    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    // Update task status
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status: status as any },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${existingTask.projectId}`);
    return { success: true, data: updatedTask };
  } catch (error) {
    console.error("Update task status error:", error);
    return {
      success: false,
      error: "Failed to update task status",
    };
  }
}

export async function assignTaskToEmployee(taskId: string, employeeId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // Verify task belongs to user's project
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          userId: user.id,
        },
      },
    });

    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    // Verify employee belongs to user
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        userId: user.id,
      },
    });

    if (!employee) {
      return { success: false, error: "Employee not found" };
    }

    // Update task assignment
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { assigneeId: employeeId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${existingTask.projectId}`);
    return { success: true, data: updatedTask };
  } catch (error) {
    console.error("Assign task to employee error:", error);
    return {
      success: false,
      error: "Failed to assign task",
    };
  }
}

// Utility function to get all employees for task assignment
export async function getAllEmployeesForProjects() {
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

export async function getProjectEmployees(projectId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Authentication required");
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Get all active employees for the user (not just those assigned to this project)
    const employees = await prisma.employee.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        department: true,
        position: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Map to match User interface (add required fields)
    return employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      email: emp.email || "",
      role: emp.position || "Employee",
      employeeId: emp.employeeId,
      department: emp.department,
      position: emp.position,
    }));
  } catch (error) {
    console.error("Get project employees error:", error);
    throw new Error("Failed to fetch project employees");
  }
}
