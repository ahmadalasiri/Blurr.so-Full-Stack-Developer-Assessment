/**
 * Extract intent from user message
 */
export function extractIntent(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Task-related intents
  if (lowerMessage.includes("task") || lowerMessage.includes("assignment")) {
    if (lowerMessage.includes("my") || lowerMessage.includes("assigned to me")) {
      return "show_my_tasks";
    }
    if (lowerMessage.includes("create") || lowerMessage.includes("new")) {
      return "create_task";
    }
    if (lowerMessage.includes("status") || lowerMessage.includes("progress")) {
      return "task_status";
    }
    return "task_general";
  }

  // Project-related intents
  if (lowerMessage.includes("project")) {
    if (lowerMessage.includes("status") || lowerMessage.includes("progress")) {
      return "project_status";
    }
    if (lowerMessage.includes("create") || lowerMessage.includes("new")) {
      return "create_project";
    }
    return "project_general";
  }

  // Employee-related intents
  if (
    lowerMessage.includes("employee") ||
    lowerMessage.includes("staff") ||
    lowerMessage.includes("find") ||
    lowerMessage.includes("who")
  ) {
    return "employee_info";
  }

  // Navigation intents
  if (
    lowerMessage.includes("how") ||
    lowerMessage.includes("where") ||
    lowerMessage.includes("navigate") ||
    lowerMessage.includes("go to")
  ) {
    return "navigation_help";
  }

  // Salary-related intents
  if (lowerMessage.includes("salary") || lowerMessage.includes("pay") || lowerMessage.includes("wage")) {
    return "salary_info";
  }

  // General help
  if (lowerMessage.includes("help") || lowerMessage.includes("what can you do")) {
    return "general_help";
  }

  return "general";
}

/**
 * Extract entities from user message (names, dates, etc.)
 */
export function extractEntities(message: string): Record<string, string[]> {
  const entities: Record<string, string[]> = {
    names: [],
    dates: [],
    numbers: [],
    priorities: [],
    statuses: [],
  };

  // Extract potential names (capitalized words)
  const namePattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const nameMatches = message.match(namePattern);
  if (nameMatches) {
    entities.names = nameMatches.filter(
      (name) => !["Task", "Project", "Employee", "Status", "Priority"].includes(name),
    );
  }

  // Extract dates
  const datePattern = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g;
  const dateMatches = message.match(datePattern);
  if (dateMatches) {
    entities.dates = dateMatches;
  }

  // Extract numbers
  const numberPattern = /\b\d+\b/g;
  const numberMatches = message.match(numberPattern);
  if (numberMatches) {
    entities.numbers = numberMatches;
  }

  // Extract priorities
  const priorities = ["low", "medium", "high", "urgent"];
  entities.priorities = priorities.filter((priority) => message.toLowerCase().includes(priority));

  // Extract statuses
  const statuses = ["todo", "in progress", "in review", "testing", "done", "cancelled"];
  entities.statuses = statuses.filter((status) => message.toLowerCase().includes(status));

  return entities;
}
