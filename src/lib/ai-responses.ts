import { prisma } from "./prisma";
import { extractIntent, extractEntities } from "./chatbot-utils";

interface User {
  id: string;
  name?: string;
  email?: string;
}

/**
 * Generate AI response based on user message and context
 */
export async function generateAIResponse(message: string, user?: User | null): Promise<string> {
  const intent = extractIntent(message);
  const entities = extractEntities(message);

  try {
    switch (intent) {
      case "show_my_tasks":
        return await handleMyTasksQuery(user);

      case "task_status":
        return await handleTaskStatusQuery(message, entities);

      case "create_task":
        return handleCreateTaskHelp();

      case "project_status":
        return await handleProjectStatusQuery(message, entities);

      case "create_project":
        return handleCreateProjectHelp();

      case "employee_info":
        return await handleEmployeeQuery(message, entities);

      case "navigation_help":
        return handleNavigationHelp(message);

      case "salary_info":
        return handleSalaryHelp();

      case "general_help":
        return handleGeneralHelp();
      default:
        return handleGeneralResponse();
    }
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I encountered an error while processing your request. Please try again or contact support.";
  }
}

/**
 * Handle queries about user's tasks
 */
async function handleMyTasksQuery(user?: User | null): Promise<string> {
  if (!user?.id) {
    return "I'd be happy to help you with your tasks! However, I need you to be logged in to access your personal task information. Please make sure you're signed in to your account.";
  }

  try {
    // Get user's assigned tasks
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: user.id,
        status: {
          not: "DONE",
        },
      },
      include: {
        project: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    if (tasks.length === 0) {
      return "You don't have any active tasks assigned to you right now. You can check the project boards to see available tasks or ask your project manager for new assignments.";
    }

    let response = `You have ${tasks.length} active task${tasks.length > 1 ? "s" : ""}:\n\n`;

    tasks.forEach((task, index) => {
      const priority = task.priority.toLowerCase();
      const status = task.status.replace(/_/g, " ").toLowerCase();
      response += `${index + 1}. **${task.title}** (${priority} priority)\n`;
      response += `   Project: ${task.project?.title || "N/A"}\n`;
      response += `   Status: ${status}\n`;
      if (task.dueDate) {
        response += `   Due: ${new Date(task.dueDate).toLocaleDateString()}\n`;
      }
      response += "\n";
    });

    response += "Would you like more details about any specific task?";
    return response;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return "I couldn't retrieve your tasks at the moment. Please try again later.";
  }
}

/**
 * Handle task status queries
 */
async function handleTaskStatusQuery(message: string, entities: Record<string, string[]>): Promise<string> {
  try {
    // If entities contain names, search for tasks by name
    if (entities.names.length > 0) {
      const taskName = entities.names.join(" ");
      const tasks = await prisma.task.findMany({
        where: {
          title: {
            contains: taskName,
          },
        },
        include: {
          project: {
            select: {
              title: true,
            },
          },
          assignee: {
            select: {
              name: true,
            },
          },
        },
        take: 5,
      });

      if (tasks.length === 0) {
        return `I couldn't find any tasks matching "${taskName}". You can try searching with different keywords or check the full task list in the projects section.`;
      }

      let response = `I found ${tasks.length} task${tasks.length > 1 ? "s" : ""} matching "${taskName}":\n\n`;

      tasks.forEach((task, index) => {
        const status = task.status.replace(/_/g, " ").toLowerCase();
        response += `${index + 1}. **${task.title}**\n`;
        response += `   Status: ${status}\n`;
        response += `   Project: ${task.project?.title || "N/A"}\n`;
        response += `   Assigned to: ${task.assignee?.name || "Unassigned"}\n\n`;
      });

      return response;
    }

    return "I can help you check task status! Please provide the task name or be more specific about which task you're asking about. For example: 'What's the status of the user authentication task?'";
  } catch (error) {
    console.error("Error fetching task status:", error);
    return "I couldn't retrieve task status information at the moment. Please try again later.";
  }
}

/**
 * Handle project status queries
 */
async function handleProjectStatusQuery(message: string, entities: Record<string, string[]>): Promise<string> {
  try {
    if (entities.names.length > 0) {
      const projectName = entities.names.join(" ");
      const projects = await prisma.project.findMany({
        where: {
          title: {
            contains: projectName,
          },
        },
        include: {
          tasks: {
            select: {
              status: true,
            },
          },
        },
        take: 3,
      });

      if (projects.length === 0) {
        return `I couldn't find any projects matching "${projectName}". Please check the project name or browse the projects section for the full list.`;
      }

      let response = `Here's the status for project${projects.length > 1 ? "s" : ""} matching "${projectName}":\n\n`;

      projects.forEach((project, index) => {
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter((task) => task.status === "DONE").length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        response += `${index + 1}. **${project.title}**\n`;
        response += `   Status: ${project.status.replace(/_/g, " ").toLowerCase()}\n`;
        response += `   Progress: ${completedTasks}/${totalTasks} tasks completed (${progress}%)\n`;
        if (project.endDate) {
          response += `   End Date: ${new Date(project.endDate).toLocaleDateString()}\n`;
        }
        response += "\n";
      });

      return response;
    }

    // Show general project overview
    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    });

    if (projects.length === 0) {
      return "There are no projects in the system yet. You can create a new project from the Projects section.";
    }

    let response = "Here's an overview of recent projects:\n\n";

    projects.forEach((project, index) => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter((task) => task.status === "DONE").length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      response += `${index + 1}. **${project.title}**\n`;
      response += `   Status: ${project.status.replace(/_/g, " ").toLowerCase()}\n`;
      response += `   Progress: ${progress}% complete (${completedTasks}/${totalTasks} tasks)\n\n`;
    });

    return response;
  } catch (error) {
    console.error("Error fetching project status:", error);
    return "I couldn't retrieve project information at the moment. Please try again later.";
  }
}

/**
 * Handle employee information queries
 */
async function handleEmployeeQuery(message: string, entities: Record<string, string[]>): Promise<string> {
  try {
    if (entities.names.length > 0) {
      const employeeName = entities.names.join(" ");
      const employees = await prisma.employee.findMany({
        where: {
          name: {
            contains: employeeName,
          },
        },
        take: 5,
      });

      if (employees.length === 0) {
        return `I couldn't find any employees matching "${employeeName}". Please check the spelling or try searching with a different name.`;
      }

      let response = `I found ${employees.length} employee${
        employees.length > 1 ? "s" : ""
      } matching "${employeeName}":\n\n`;

      employees.forEach((employee, index) => {
        response += `${index + 1}. **${employee.name}**\n`;
        response += `   Employee ID: ${employee.employeeId}\n`;
        response += `   Department: ${employee.department || "N/A"}\n`;
        response += `   Position: ${employee.position || "N/A"}\n`;
        response += `   Joined: ${new Date(employee.joiningDate).toLocaleDateString()}\n\n`;
      });

      return response;
    }

    return "I can help you find employee information! Please provide the employee's name. For example: 'Find employee John Smith' or 'Who is Sarah Johnson?'";
  } catch (error) {
    console.error("Error fetching employee information:", error);
    return "I couldn't retrieve employee information at the moment. Please try again later.";
  }
}

/**
 * Handle navigation help
 */
function handleNavigationHelp(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("create") && lowerMessage.includes("task")) {
    return "To create a new task:\n\n1. Go to the Projects section from the sidebar\n2. Select the project you want to add a task to\n3. Click the 'Create Task' button or the '+' button in any status column on the Kanban board\n4. Fill in the task details (title, description, priority, etc.)\n5. Click 'Create Task' to save\n\nYou can also create tasks directly from the Kanban board by clicking the '+' button in the appropriate status column.";
  }

  if (lowerMessage.includes("create") && lowerMessage.includes("project")) {
    return "To create a new project:\n\n1. Navigate to the Projects section from the sidebar\n2. Click the 'Create Project' button\n3. Fill in the project details (title, description, dates, budget)\n4. Set the project status\n5. Click 'Create Project' to save\n\nOnce created, you can add tasks to your project and assign team members.";
  }

  if (lowerMessage.includes("salary") || lowerMessage.includes("pay")) {
    return "To access salary information:\n\n1. Go to the Salary section from the sidebar\n2. You can view monthly salary reports\n3. Use the month selector to view different periods\n4. The table shows basic salary, bonuses, deductions, and net payable amounts\n\nNote: Salary information is typically restricted based on your role and permissions.";
  }

  if (lowerMessage.includes("employee")) {
    return "To manage employees:\n\n1. Go to the Employees section from the sidebar\n2. View the list of all employees\n3. Click 'Add Employee' to register new team members\n4. Click on an employee's name to view their details\n5. Use the edit button to update employee information\n\nYou can also search and filter employees using the search functionality.";
  }

  if (lowerMessage.includes("kanban") || lowerMessage.includes("board")) {
    return "To use the Kanban board:\n\n1. Go to Projects and select a project\n2. The Kanban board shows tasks in different status columns\n3. Drag and drop tasks between columns to update their status\n4. Click on a task card to view details\n5. Use the '+' button in each column to create new tasks\n6. Use the dropdown menu on task cards for more options\n\nThe board automatically saves status changes when you drag tasks between columns.";
  }

  return "I can help you navigate the HR Portal! Here are the main sections:\n\n• **Dashboard**: Overview and quick stats\n• **Employees**: Manage employee information\n• **Projects**: View and manage projects with Kanban boards\n• **Salary**: Access salary reports and calculations\n\nWhat specific area would you like help with? You can ask things like:\n- 'How do I create a new task?'\n- 'Where can I see salary information?'\n- 'How do I add a new employee?'";
}

/**
 * Handle task creation help
 */
function handleCreateTaskHelp(): string {
  return "I can guide you through creating a task!\n\n**To create a new task:**\n\n1. **Navigate to Projects** - Click 'Projects' in the sidebar\n2. **Select a Project** - Choose the project you want to add the task to\n3. **Create the Task** - You have two options:\n   - Click the 'Create Task' button at the top\n   - Click the '+' button in any Kanban column for the desired status\n\n4. **Fill in Details:**\n   - Task title (required)\n   - Description (optional but recommended)\n   - Priority (Low, Medium, High, Urgent)\n   - Status (Todo, In Progress, In Review, Testing, Done, Cancelled)\n   - Estimated hours\n   - Due date\n   - Assign to team member\n\n5. **Save** - Click 'Create Task'\n\nThe task will appear in the Kanban board and can be managed from there. Would you like me to help with anything specific about task creation?";
}

/**
 * Handle project creation help
 */
function handleCreateProjectHelp(): string {
  return "Here's how to create a new project:\n\n**Steps to create a project:**\n\n1. **Go to Projects Section** - Click 'Projects' in the sidebar\n2. **Click 'Create Project'** - You'll find this button at the top of the projects list\n3. **Fill in Project Details:**\n   - Project title (required)\n   - Description (optional)\n   - Status (Planning, In Progress, On Hold, Completed, Cancelled)\n   - Start date (optional)\n   - End date (optional)\n   - Budget (optional)\n\n4. **Save the Project** - Click 'Create Project'\n\nOnce created, you can:\n- Add tasks using the Kanban board\n- Assign team members to tasks\n- Track project progress\n- Update project details anytime\n\nWould you like help with any specific aspect of project management?";
}

/**
 * Handle salary information help
 */
function handleSalaryHelp(): string {
  return "I can help you understand the salary system:\n\n**Accessing Salary Information:**\n- Navigate to the 'Salary' section from the sidebar\n- Select the month you want to view\n- The table shows all employee salary details\n\n**Salary Components:**\n- **Basic Salary**: Employee's base monthly salary\n- **Bonus**: Additional compensation for the month\n- **Deductions**: Any deductions applied\n- **Payable Amount**: Final amount after bonuses and deductions\n\n**Features:**\n- Monthly salary reports\n- Automatic calculations\n- Employee-wise breakdown\n- Export capabilities\n\nNote: Access to salary information depends on your role and permissions in the system. If you can't see certain information, you may need to contact HR or your administrator.\n\nNeed help with anything specific about salary management?";
}

/**
 * Handle general help queries
 */
function handleGeneralHelp(): string {
  return "I'm your HR Portal assistant! Here's what I can help you with:\n\n**📋 Tasks & Projects**\n- Show your assigned tasks\n- Check task and project status\n- Guide you through creating tasks/projects\n- Help with Kanban board usage\n\n**👥 Employee Information**\n- Find employee details\n- Look up contact information\n- Search by name or department\n\n**💰 Salary Information**\n- Explain salary components\n- Help access salary reports\n- Guide through salary calculations\n\n**🧭 Navigation Help**\n- How to use different features\n- Where to find specific information\n- Step-by-step guidance\n\n**Example questions you can ask:**\n- 'Show me my tasks'\n- 'What's the status of Project Alpha?'\n- 'Find employee John Smith'\n- 'How do I create a new task?'\n- 'Where can I see salary information?'\n\nWhat would you like help with today?";
}

/**
 * Handle general responses for unmatched queries
 */
function handleGeneralResponse(): string {
  const responses = [
    "I understand you're asking about something, but I'm not sure how to help with that specific request. Could you please rephrase your question or ask about tasks, projects, employees, or navigation help?",

    "I'd be happy to help! I specialize in assisting with tasks, projects, employee information, and system navigation. Could you be more specific about what you need help with?",

    "I'm here to help with the HR Portal! I can assist with tasks, projects, employee information, and show you how to use different features. What would you like to know more about?",
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
