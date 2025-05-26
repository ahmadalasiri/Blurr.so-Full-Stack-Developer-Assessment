# UI/UX Design System - Blurr HR Portal

## Overview

This document outlines the comprehensive UI/UX design system for the Blurr HR Portal dashboard components. The design emphasizes modern, accessible, and responsive interfaces that provide clear data visualization and intuitive user interactions.

## 1. Dashboard Layout Architecture

### Master Layout Structure

```
Dashboard Container
├── Header Section (Greeting + Quick Actions)
├── Statistics Grid (4-column responsive)
├── Detailed Overview Cards (2-column grid)
└── Quick Actions Panel
```

### Responsive Breakpoints

- **Large screens (lg: ≥1024px)**: 4-column grid for stats, 2-column for overview
- **Medium screens (md: ≥768px)**: 2-column grid for stats, stacked overview
- **Small screens (≥640px)**: Single column layout with optimized spacing

### Container Specifications

```typescript
// Main container styling
className="container p-6 space-y-8"

// Grid system
- Statistics: "grid gap-4 md:grid-cols-2 lg:grid-cols-4"
- Overview: "grid gap-6 md:grid-cols-2"
- Quick Actions: "grid gap-4 md:grid-cols-3"
```

## 2. Header Components

### Welcome Header

**Purpose**: Personalized greeting with contextual information and primary actions

**Structure**:
```typescript
interface HeaderProps {
  userName: string;
  primaryAction: "New Project";
  secondaryAction: "Add Employee";
}
```

**Design Elements**:
- **Typography**: H1 with `text-3xl font-bold tracking-tight`
- **Layout**: Flex with responsive column/row switching
- **Colors**: Primary text with muted description
- **Actions**: Button group with primary and outline variants

**Accessibility**:
- Semantic heading structure (h1)
- Descriptive button labels with icons
- Focus management for keyboard navigation

### Action Button Group

**Primary Button**:
```typescript
<Button asChild>
  <Link href="/dashboard/projects/new">
    <Plus className="mr-2 h-4 w-4" />
    New Project
  </Link>
</Button>
```

**Secondary Button**:
```typescript
<Button variant="outline" asChild>
  <Link href="/dashboard/employees/new">
    <Users className="mr-2 h-4 w-4" />
    Add Employee
  </Link>
</Button>
```

## 3. Statistics Display Components

### Stat Card Architecture

**Base Structure**:
```typescript
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}
```

**Visual Hierarchy**:
1. **Icon** (top-right, muted color)
2. **Value** (large, bold typography)
3. **Subtitle** (small, muted description)
4. **Trend indicator** (optional, contextual color)

### Four Core Statistics

#### 1. Total Projects Card
```typescript
{
  title: "Total Projects",
  icon: FolderOpen,
  value: totalProjects,
  subtitle: `${activeProjects} active, ${completedProjects} completed`,
  color: "default"
}
```

#### 2. Active Employees Card
```typescript
{
  title: "Active Employees", 
  icon: Users,
  value: totalActive,
  subtitle: `${recentJoins} joined this month`,
  color: "success"
}
```

#### 3. Task Progress Card
```typescript
{
  title: "Task Progress",
  icon: CheckCircle,
  value: `${completionPercentage}%`,
  progressBar: {
    value: completionPercentage,
    total: totalTasks
  },
  color: "progress"
}
```

#### 4. Average Salary Card
```typescript
{
  title: "Average Salary",
  icon: DollarSign,
  value: `$${averageSalary.toLocaleString()}`,
  subtitle: `Across ${totalActive} employees`,
  color: "financial"
}
```

### Card Styling Specifications

**Container**:
```css
.stat-card {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--border));
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

**Header**:
```css
.card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5rem;
}
```

**Typography**:
- Title: `text-sm font-medium`
- Value: `text-2xl font-bold`
- Subtitle: `text-xs text-muted-foreground`

## 4. Navigation Elements Design

### Breadcrumb Navigation

**Implementation**:
```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

// Example structure
[
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/dashboard/projects" },
  { label: "Project Name", current: true }
]
```

### Tab Navigation

**Design Pattern**:
```typescript
interface TabConfig {
  label: string;
  value: string;
  icon?: LucideIcon;
  badge?: number;
}

// Example tabs for project views
const projectTabs = [
  { label: "Overview", value: "overview", icon: BarChart3 },
  { label: "Kanban", value: "kanban", icon: Columns },
  { label: "Backlog", value: "backlog", icon: List, badge: pendingTasks }
];
```

### Sidebar Navigation

**Structure**:
```typescript
interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  children?: NavItem[];
}
```

## 5. Employee Overview Components

### Employee Stats Display

**Card Layout**:
```typescript
interface EmployeeStatsProps {
  totalEmployees: number;
  totalActive: number;
  totalInactive: number;
  recentJoins: number;
  averageSalary: number;
}
```

**Visual Elements**:
- **Status Badges**: Color-coded employee status indicators
- **Progress Indicators**: Visual representation of active vs total
- **Trend Arrows**: Month-over-month changes

### Employee Status Badges

**Active Status**:
```typescript
<Badge 
  variant="outline" 
  className="bg-green-50 text-green-700"
>
  {totalActive}
</Badge>
```

**Recent Joins**:
```typescript
<Badge 
  variant="outline" 
  className="bg-blue-50 text-blue-700"
>
  {recentJoins}
</Badge>
```

### Employee List Components

**Table Structure**:
```typescript
interface EmployeeTableProps {
  employees: Employee[];
  sortBy: 'name' | 'department' | 'salary' | 'joinDate';
  sortOrder: 'asc' | 'desc';
  filters: {
    department?: string;
    status?: 'active' | 'inactive';
    salaryRange?: [number, number];
  };
}
```

**Row Actions**:
- View employee details
- Edit employee information
- Manage salary history
- Deactivate/Activate employee

## 6. Project Status Display Components

### Project Status Grid

**Card Configuration**:
```typescript
interface ProjectStatusCardProps {
  project: {
    id: string;
    name: string;
    status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';
    progress: number;
    tasksCompleted: number;
    totalTasks: number;
    dueDate: Date;
    assignees: number;
  };
}
```

**Status Color Mapping**:
```typescript
const statusColors = {
  PLANNING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200'
};
```

### Project Progress Indicators

**Progress Bar Component**:
```typescript
interface ProgressBarProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}
```

**Implementation**:
```tsx
<Progress 
  value={projectCompletion} 
  className="flex-1"
  aria-label={`${projectCompletion}% complete`}
/>
```

### Project List View

**Compact List Item**:
```typescript
interface ProjectListItemProps {
  project: Project;
  showProgress: boolean;
  showAssignees: boolean;
  actions: Array<'edit' | 'view' | 'delete' | 'duplicate'>;
}
```

## 7. Task Progress Display Components

### Task Progress Overview

**Summary Card**:
```typescript
interface TaskProgressSummary {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
}
```

**Visual Breakdown**:
- **Donut Chart**: Task status distribution
- **Progress Bar**: Overall completion percentage
- **Badge Grid**: Status count indicators

### Task Status Badges

**Status Configuration**:
```typescript
const taskStatusConfig = {
  PENDING: {
    label: 'Pending',
    variant: 'secondary',
    className: 'bg-gray-50 text-gray-700'
  },
  IN_PROGRESS: {
    label: 'In Progress', 
    variant: 'default',
    className: 'bg-blue-50 text-blue-700'
  },
  COMPLETED: {
    label: 'Completed',
    variant: 'outline',
    className: 'bg-green-50 text-green-700'
  },
  OVERDUE: {
    label: 'Overdue',
    variant: 'destructive',
    className: 'bg-red-50 text-red-700'
  }
};
```

### Task Progress Metrics

**Key Performance Indicators**:
```typescript
interface TaskMetrics {
  velocityTrend: number; // tasks completed per week
  averageCompletionTime: number; // in hours
  blockersCount: number;
  upcomingDeadlines: number;
}
```

## 8. Interactive Elements Design

### Button Variants and Usage

**Primary Actions**:
```typescript
// Create/Add actions
<Button size="default" className="gap-2">
  <Plus className="h-4 w-4" />
  Create Project
</Button>
```

**Secondary Actions**:
```typescript
// View/Navigate actions  
<Button variant="outline" size="default">
  <BarChart3 className="h-4 w-4" />
  View Details
</Button>
```

**Quick Actions Grid**:
```typescript
// Large clickable areas for common tasks
<Button 
  variant="outline" 
  className="h-20 flex-col gap-2"
  asChild
>
  <Link href="/dashboard/projects/new">
    <FolderOpen className="h-6 w-6" />
    <span>Create Project</span>
  </Link>
</Button>
```

### Form Components

**Input Field Standards**:
```typescript
interface FormFieldProps {
  label: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
}
```

**Validation States**:
- **Default**: Neutral border and background
- **Error**: Red border with error message
- **Success**: Green border for valid input
- **Focus**: Blue border with enhanced visibility

### Modal and Dialog Design

**Modal Structure**:
```typescript
interface ModalProps {
  title: string;
  description?: string;
  content: React.ReactNode;
  actions: {
    primary?: { label: string; action: () => void };
    secondary?: { label: string; action: () => void };
    cancel: { label: string; action: () => void };
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

## 9. Data Visualization Components

### Chart Color Palette

**Primary Colors**:
```css
--chart-blue: hsl(221, 83%, 53%);    /* Active/Primary data */
--chart-green: hsl(142, 71%, 45%);   /* Success/Completed */
--chart-orange: hsl(25, 95%, 53%);   /* Warning/Pending */
--chart-red: hsl(0, 84%, 60%);       /* Error/Overdue */
--chart-purple: hsl(262, 83%, 58%);  /* Special metrics */
--chart-gray: hsl(210, 11%, 71%);    /* Inactive/Disabled */
```

### Progress Visualization

**Linear Progress**:
```typescript
interface LinearProgressProps {
  value: number;
  max: number;
  segments?: Array<{
    value: number;
    color: string;
    label: string;
  }>;
}
```

**Circular Progress**:
```typescript
interface CircularProgressProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor?: string;
}
```

## 10. Responsive Design Patterns

### Mobile-First Approach

**Breakpoint Strategy**:
```css
/* Base styles for mobile */
.dashboard-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

/* Tablet and up */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Touch-Friendly Interactions

**Minimum Touch Targets**:
- Buttons: 44px × 44px minimum
- Links: 44px minimum height
- Form inputs: 48px minimum height

**Spacing Guidelines**:
- Card padding: 16px (mobile), 24px (desktop)
- Between cards: 16px (mobile), 24px (desktop)
- Section spacing: 32px (mobile), 48px (desktop)

## 11. Accessibility Standards

### WCAG 2.1 AA Compliance

**Color Contrast**:
- Normal text: 4.5:1 minimum ratio
- Large text: 3:1 minimum ratio
- Interactive elements: 3:1 minimum ratio

**Keyboard Navigation**:
- All interactive elements focusable
- Logical tab order
- Visible focus indicators
- Escape key handling for modals

**Screen Reader Support**:
```typescript
// Semantic markup example
<section aria-labelledby="stats-heading">
  <h2 id="stats-heading" className="sr-only">
    Dashboard Statistics
  </h2>
  <div role="group" aria-label="Key metrics">
    {statsCards}
  </div>
</section>
```

### ARIA Labels and Roles

**Progress Indicators**:
```typescript
<Progress 
  value={75} 
  aria-label="Project completion: 75%" 
  role="progressbar"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={75}
/>
```

**Interactive Cards**:
```typescript
<Card 
  role="button" 
  tabIndex={0}
  aria-label={`View ${projectName} project details`}
  onKeyDown={handleKeyboardInteraction}
>
```

## 12. Performance Optimization

### Component Loading Strategies

**Lazy Loading**:
```typescript
// Heavy components loaded on demand
const AdvancedChart = lazy(() => import('./AdvancedChart'));
const DetailedReport = lazy(() => import('./DetailedReport'));
```

**Skeleton Loading States**:
```typescript
interface SkeletonCardProps {
  variant: 'stat' | 'chart' | 'list';
  count?: number;
}

// Usage while data loads
{isLoading ? <SkeletonCard variant="stat" count={4} /> : <StatsGrid />}
```

### Image Optimization

**Avatar Images**:
```typescript
import Image from 'next/image';

<Image
  src={employeeAvatar}
  alt={`${employeeName} avatar`}
  width={40}
  height={40}
  className="rounded-full"
  priority={false}
/>
```

## 13. Animation and Micro-Interactions

### Transition Guidelines

**Hover States**:
```css
.interactive-card {
  transition: all 0.2s ease-in-out;
}

.interactive-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

**Loading States**:
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Page Transitions

**Smooth Navigation**:
```typescript
// Using framer-motion for page transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};
```

## 14. Dark Mode Support

### Color Scheme Variables

**CSS Custom Properties**:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
}

[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
}
```

### Component Adaptations

**Conditional Styling**:
```typescript
const cardClassName = cn(
  "border bg-card text-card-foreground",
  isDark && "border-gray-800"
);
```

## 15. Testing Considerations

### Visual Regression Testing

**Component Screenshots**:
```typescript
// Storybook stories for visual testing
export const DashboardStatsGrid = {
  args: {
    stats: mockDashboardStats,
    loading: false
  }
};

export const LoadingState = {
  args: {
    stats: null,
    loading: true
  }
};
```

### Accessibility Testing

**Automated Checks**:
- Color contrast validation
- Keyboard navigation testing
- Screen reader compatibility
- Focus management verification

**Manual Testing Scenarios**:
- High contrast mode
- Zoom levels up to 200%
- Voice control navigation
- Reduced motion preferences

## 16. Implementation Guidelines

### Component Development Workflow

1. **Design Review**: Validate design against this system
2. **Accessibility Check**: Ensure WCAG compliance
3. **Responsive Testing**: Verify all breakpoints
4. **Performance Audit**: Check loading times and bundle size
5. **User Testing**: Validate usability with real users

### Code Quality Standards

**Component Structure**:
```typescript
// Standard component template
interface ComponentProps {
  // Props definition
}

export function Component({ ...props }: ComponentProps) {
  // Hooks and state
  // Event handlers
  // Render logic
  
  return (
    <div className={cn("base-styles", className)}>
      {/* Component content */}
    </div>
  );
}

Component.displayName = "Component";
```

This comprehensive UI/UX design system provides the foundation for consistent, accessible, and performant dashboard components throughout the Blurr HR Portal application.
