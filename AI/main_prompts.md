# Main Development Prompts - Blurr HR Portal

This document contains the comprehensive list of prompts that were used to guide the development of the Blurr HR Portal using AI tools. These prompts demonstrate the AI-driven development approach required for this technical assessment.

## 1. Initial Project Architecture Planning

```
Based on the Blurr HR Portal requirements, help me create a comprehensive project architecture document. I need to build a full-stack application with:
- Frontend: React + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Next.js Server Actions
- Database: SQLite + Prisma ORM
- Authentication: NextAuth.js

The application should handle employee management, salary calculations, project/task management with Kanban boards, and an AI chatbot. Please provide:
1. Overall system architecture
2. Database design considerations
3. Component hierarchy planning
4. Data flow patterns
5. Authentication strategy

Save this analysis to AI/01-project-architecture.md
```

## 2. Database Schema Design

```
Help me design a comprehensive database schema for the Blurr HR Portal. The system needs to manage:
- Users (authentication)
- Employees (ID, Name, Joining Date, Basic Salary)
- Projects (Title, Description)
- Tasks (Title, Description, Priority, Status, Assigned Employee)
- Salary Records (Monthly calculations with bonuses/deductions)

Please provide:
1. Prisma schema with proper relationships
2. Migration strategies
3. Data validation considerations
4. Performance optimization (indexes)
5. Sample seed data

Generate the complete schema.prisma file and save analysis to AI/02-database-schema.md
```

## 3. Authentication System Implementation

```
Help me implement a complete authentication system for the Blurr HR Portal using NextAuth.js. I need:
1. Login/signup functionality
2. Session management
3. Route protection middleware
4. User registration with proper validation
5. Integration with Prisma database

Please generate:
- Complete auth.ts configuration
- Login and register pages with shadcn/ui components
- API routes for authentication
- Middleware for route protection
- TypeScript types for user sessions

Save implementation details to AI/03-authentication-system.md
```

## 4. Employee Management System

```
Create a complete employee management system for the Blurr HR Portal. I need:
1. Employee data model with TypeScript interfaces
2. Server Actions for CRUD operations
3. Employee form with validation using react-hook-form + Zod
4. Employee list/table with shadcn/ui components
5. Edit/delete functionality
6. Proper error handling and loading states

Generate:
- Employee model and validation schemas
- Server Actions (create, read, update, delete)
- Employee form component
- Employee list component
- Employee details page

Document the approach in AI/04-employee-management.md
```

## 5. Salary Management System

```
Implement a comprehensive salary management system with:
1. Monthly salary calculation logic
2. Bonus and deduction support
3. Salary table with month selection
4. Automatic payable amount calculation

Create:
- Salary calculation functions
- Monthly salary report generation
- Salary table component with filtering

Save technical approach to AI/04-employee-management.md (append)
```

## 6. Project Management System

```
Build a project management system for the Blurr HR Portal with:
1. Project CRUD operations
2. Project-task associations
3. Employee assignment to projects

Generate:
- Project data models and validation
- Project Server Actions
- Project form components
- Project list and detail views
- Project-employee relationship management

Document in AI/05-project-task-management.md
```

## 7. Task Management with Kanban Board

```
Create a comprehensive task management system featuring:
1. Task CRUD with all required fields (Title, Description, Priority, Status, Assigned Employee)
2. Kanban board using shadcn/ui components
3. Task status updates
4. Employee assignment
5. Backlog table view

Implement:
- Task data models and validation
- Task Server Actions
- Kanban board component with drag-and-drop functionality using @dnd-kit
- Task cards with proper styling
- Backlog table with sorting/filtering
- Task assignment workflow

Key requirements:
- Status columns: TODO, IN_PROGRESS, IN_REVIEW, TESTING, DONE, CANCELLED
- Priority levels: LOW, MEDIUM, HIGH, URGENT
- Drag-and-drop between status columns
- Real-time updates with optimistic UI

Save approach to AI/05-project-task-management.md (append)
```

## 8. UI/UX Design System

```
Create a comprehensive design system for the Blurr HR Portal with:
1. Consistent color scheme and typography
2. Responsive layout patterns
3. Navigation structure
4. Dashboard components

Generate:
- Main layout components
- Navigation sidebar and mobile menu
- Dashboard layout structure
- Responsive design patterns
- Employee overview components
- Project status displays

Document in AI/06-ui-ux-design.md
```

## 9. Dashboard Implementation

```
Build comprehensive dashboard components including:
1. Main dashboard with statistics
2. Employee overview widgets
3. Project status display
4. Task progress indicators
5. Quick action buttons

Create:
- Dashboard layout component
- Statistics cards with real-time data
- Navigation elements
- Interactive charts and progress bars

Add to AI/06-ui-ux-design.md
```

## 10. AI Chatbot Integration

```
Implement an AI chatbot for the Blurr HR Portal that can:
1. Answer questions about tasks and projects
2. Provide employee information
3. Help with navigation
4. Integrate with existing data

Create:
- Chat interface component with modern UI
- Message handling system
- AI response generation using pattern matching
- Context awareness for queries
- Integration with Prisma database for data queries

Features needed:
- Floating chat button
- Chat history
- Typing indicators
- Error handling
- Contextual responses based on current page

Document approach in AI/07-ai-chatbot-integration.md
```

## 11. Data Seeding and Demo Preparation

```

Create comprehensive seed data for demo purposes:

1. Sample users with different roles
2. Employee records with realistic data
3. Projects with various statuses
4. Tasks distributed across Kanban columns
5. Salary records for demonstration

Generate:

- Prisma seed script
- Demo user accounts (admin@blurr.so, 12345678)
- Sample project data
- Task assignments
- Salary calculation examples

```

## 12. Security Hardening

```

Implement security best practices:

1. Input sanitization
2. SQL injection prevention
3. XSS protection
4. CSRF protection
5. Rate limiting

Ensure:

- Secure authentication flow
- Proper session management
- Data validation at all levels
- Secure database queries
- Protection against common vulnerabilities
```
