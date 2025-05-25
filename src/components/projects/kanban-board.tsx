"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskStatus, TaskPriority, type Task, type User } from "@/lib/project-validation";
import { updateTaskStatus } from "@/lib/project-actions";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  employees: User[];
}

const statusColumns = [
  { status: TaskStatus.TODO, title: "To Do", color: "bg-slate-100" },
  { status: TaskStatus.IN_PROGRESS, title: "In Progress", color: "bg-blue-100" },
  { status: TaskStatus.IN_REVIEW, title: "In Review", color: "bg-yellow-100" },
  { status: TaskStatus.TESTING, title: "Testing", color: "bg-orange-100" },
  { status: TaskStatus.DONE, title: "Done", color: "bg-green-100" },
  { status: TaskStatus.CANCELLED, title: "Cancelled", color: "bg-red-100" },
];

const priorityColors = {
  [TaskPriority.LOW]: "bg-green-100 text-green-800",
  [TaskPriority.MEDIUM]: "bg-yellow-100 text-yellow-800",
  [TaskPriority.HIGH]: "bg-orange-100 text-orange-800",
  [TaskPriority.URGENT]: "bg-red-100 text-red-800",
};

interface SortableTaskCardProps {
  task: Task;
  projectId: string;
  getEmployeeName: (employeeId: string) => string;
  handleStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  isUpdating: string | null;
}

interface DroppableColumnProps {
  status: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  projectId: string;
  getEmployeeName: (employeeId: string) => string;
  handleStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  isUpdating: string | null;
}

function DroppableColumn({
  status,
  title,
  color,
  tasks,
  projectId,
  getEmployeeName,
  handleStatusChange,
  isUpdating,
}: DroppableColumnProps) {
  const router = useRouter();
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{tasks.length}</Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push(`/dashboard/projects/${projectId}/tasks/new?status=${status}`)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
          isOver ? "bg-blue-50 border-2 border-blue-200 border-dashed" : ""
        }`}
      >
        {" "}
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              projectId={projectId}
              getEmployeeName={getEmployeeName}
              handleStatusChange={handleStatusChange}
              isUpdating={isUpdating}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function SortableTaskCard({ task, projectId, getEmployeeName, handleStatusChange, isUpdating }: SortableTaskCardProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing"
      onClick={() => router.push(`/dashboard/projects/${projectId}/tasks/${task.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="sm"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statusColumns
                .filter((col) => col.status !== task.status)
                .map((col) => (
                  <DropdownMenuItem
                    key={col.status}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(task.id, col.status);
                    }}
                    disabled={isUpdating === task.id}
                  >
                    Move to {col.title}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {task.description && <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge
            className={priorityColors[task.priority as TaskPriority]}
            variant="secondary"
          >
            {task.priority}
          </Badge>
          {task.assigneeId && <span className="text-xs text-gray-500">{getEmployeeName(task.assigneeId)}</span>}
        </div>
        {task.dueDate && (
          <div className="mt-2">
            <span className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function KanbanBoard({ tasks, projectId, employees }: KanbanBoardProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setIsUpdating(taskId);
    try {
      await updateTaskStatus(taskId, newStatus);
      router.refresh();
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    // Find the task to check if status actually changed
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      handleStatusChange(taskId, newStatus);
    }

    setActiveId(null);
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || "Unassigned";
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };
  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {" "}
        {statusColumns.map((column) => (
          <DroppableColumn
            key={column.status}
            status={column.status}
            title={column.title}
            color={column.color}
            tasks={getTasksByStatus(column.status)}
            projectId={projectId}
            getEmployeeName={getEmployeeName}
            handleStatusChange={handleStatusChange}
            isUpdating={isUpdating}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <Card className="cursor-grabbing shadow-lg rotate-3 opacity-90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium line-clamp-2">{activeTask.title}</CardTitle>
              {activeTask.description && <p className="text-xs text-gray-600 line-clamp-2">{activeTask.description}</p>}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <Badge
                  className={priorityColors[activeTask.priority as TaskPriority]}
                  variant="secondary"
                >
                  {activeTask.priority}
                </Badge>
                {activeTask.assigneeId && (
                  <span className="text-xs text-gray-500">{getEmployeeName(activeTask.assigneeId)}</span>
                )}
              </div>
              {activeTask.dueDate && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">
                    Due: {new Date(activeTask.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
