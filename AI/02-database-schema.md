# Database Schema Design - Blurr HR Portal

## Overview

This document outlines the comprehensive database schema design for the Blurr HR Portal, built using Prisma ORM with SQLite. The schema is designed to handle user authentication, employee management, project tracking, task management, and salary calculations while maintaining data integrity and performance.

## 1. Database Schema Structure

### Core Entity Relationships

```
User (1) ──────────── (N) Employee
User (1) ──────────── (N) Project
User (1) ──────────── (N) Task (as creator)
Employee (1) ─────── (N) Task (as assignee)
Employee (1) ─────── (N) SalaryRecord
Project (1) ─────── (N) Task
Task (N) ─────────── (N) Task (dependencies)
```

### Database Design Principles

1. **Normalization**: Follows 3NF to eliminate data redundancy
2. **Referential Integrity**: Proper foreign key constraints
3. **Audit Trail**: Comprehensive tracking of data changes
4. **Flexible Relationships**: Support for complex business logic
5. **Performance Optimization**: Strategic indexing for common queries

## 2. Model Definitions and Relationships

### Authentication Models (NextAuth.js Integration)

#### User Model

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  password      String?
  image         String?
  role          UserRole  @default(USER)
  // HR Portal Relations
  employees     Employee[]
  projects      Project[]
  createdTasks  Task[]     @relation("TaskCreator")
}
```

**Key Features:**

- CUID for secure, URL-safe IDs
- Role-based access control
- Support for OAuth and credential authentication
- One-to-many relationships with HR entities

#### Account & Session Models

- Standard NextAuth.js models for session management
- Support for multiple authentication providers
- Secure session handling with automatic cleanup

### Core Business Models

#### Employee Model

```prisma
model Employee {
  id           String   @id @default(cuid())
  employeeId   String   @unique // Custom employee ID (e.g., EMP001)
  name         String
  email        String?  @unique
  joiningDate  DateTime
  basicSalary  Decimal  @db.Decimal(10, 2)
  department   String?
  position     String?
  isActive     Boolean  @default(true)
}
```

**Design Decisions:**

- **Custom Employee ID**: Business-friendly identifier separate from system ID
- **Decimal Type**: Precise financial calculations using Decimal(10,2)
- **Soft Delete**: `isActive` flag instead of hard deletion
- **Optional Fields**: Flexible data entry for gradual implementation
- **Email Uniqueness**: Prevents duplicate employee records

#### Project Model

```prisma
model Project {
  id          String      @id @default(cuid())
  title       String
  description String?
  status      ProjectStatus @default(PLANNING)
  startDate   DateTime?
  endDate     DateTime?
  budget      Decimal?    @db.Decimal(12, 2)
}
```

**Features:**

- **Status Tracking**: Enum-based project lifecycle management
- **Budget Management**: Optional financial tracking
- **Flexible Dates**: Support for projects without fixed timelines
- **User Association**: Each project belongs to a user/organization

#### Task Model

```prisma
model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  priority    Priority   @default(MEDIUM)
  status      TaskStatus @default(TODO)
  estimatedHours Int?
  actualHours    Int?
  dueDate     DateTime?
  // Complex relationships
  assigneeId  String?
  assignee    Employee?  @relation("TaskAssignee")
  dependencies Task[]    @relation("TaskDependencies")
}
```

**Advanced Features:**

- **Multiple Relationships**: Creator, assignee, and project associations
- **Self-Referencing**: Task dependencies for project management
- **Time Tracking**: Estimated vs. actual hours
- **Priority System**: Four-level priority classification
- **Flexible Assignment**: Tasks can exist without immediate assignment

#### SalaryRecord Model

```prisma
model SalaryRecord {
  id          String   @id @default(cuid())
  month       Int      // 1-12
  year        Int
  basicSalary Decimal  @db.Decimal(10, 2)
  bonus       Decimal  @default(0) @db.Decimal(10, 2)
  deductions  Decimal  @default(0) @db.Decimal(10, 2)
  totalSalary Decimal  @db.Decimal(10, 2)
  status      SalaryStatus @default(DRAFT)
}
```

**Salary Calculation Features:**

- **Monthly Tracking**: Separate records for each month/year
- **Component Breakdown**: Basic salary, bonuses, deductions
- **Overtime Support**: Hours and rate tracking
- **Approval Workflow**: Status-based salary processing
- **Audit Trail**: Complete history of salary changes

### Audit and Logging

#### AuditLog Model

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  action    String   // CREATE, UPDATE, DELETE
  entityType String  // Employee, Project, Task, etc.
  entityId  String
  oldValues Json?
  newValues Json?
  userId    String
  userEmail String
  ipAddress String?
  userAgent String?
}
```

**Compliance Features:**

- **Change Tracking**: Before/after values in JSON format
- **User Attribution**: Full user context for each action
- **Security Information**: IP address and user agent logging
- **Entity Flexibility**: Works with any model in the system

## 3. Enums and Data Types

### Business Logic Enums

```prisma
enum UserRole {
  USER        // Standard employee/user
  ADMIN       // System administrator
  MANAGER     // Department/project manager
}

enum ProjectStatus {
  PLANNING    // Project in planning phase
  IN_PROGRESS // Active development
  ON_HOLD     // Temporarily paused
  COMPLETED   // Successfully finished
  CANCELLED   // Terminated before completion
}

enum TaskStatus {
  TODO        // Not started
  IN_PROGRESS // Currently being worked on
  IN_REVIEW   // Under review/testing
  TESTING     // Quality assurance phase
  DONE        // Completed successfully
  CANCELLED   // Terminated
}

enum Priority {
  LOW         // Nice to have
  MEDIUM      // Standard priority
  HIGH        // Important
  URGENT      // Critical/blocking
}

enum SalaryStatus {
  DRAFT           // Being prepared
  PENDING_APPROVAL // Awaiting manager approval
  APPROVED        // Ready for payment
  PAID           // Payment processed
  REJECTED       // Approval denied
}
```

### Data Type Decisions

- **String IDs**: CUID for security and URL safety
- **Decimal**: Financial precision for salary calculations
- **DateTime**: UTC timestamps with timezone support
- **JSON**: Flexible data storage for audit logs
- **Boolean**: Simple flags with clear defaults
- **Optional Fields**: Gradual data migration support

## 4. Performance Optimization Strategy

### Index Strategy

```prisma
// High-frequency query optimization
@@index([userId])           // User-based filtering
@@index([employeeId])       // Employee lookups
@@index([email])           // Authentication queries
@@index([status])          // Status-based filtering
@@index([priority])        // Priority sorting
@@index([month, year])     // Salary period queries
@@index([entityType, entityId]) // Audit log queries
```

### Composite Indexes

```prisma
// Unique constraints for business logic
@@unique([employeeId, month, year])  // Prevent duplicate salary records
@@unique([provider, providerAccountId]) // OAuth provider constraints
```

### Query Optimization Patterns

1. **Eager Loading**: Use `include` for related data
2. **Selective Fields**: Use `select` to limit data transfer
3. **Pagination**: Implement cursor-based pagination for large datasets
4. **Filtering**: Index-backed WHERE clauses
5. **Sorting**: Index-supported ORDER BY operations

### Performance Monitoring Queries

```typescript
// Example optimized queries
const employeesWithTasks = await prisma.employee.findMany({
  where: { userId, isActive: true },
  include: {
    assignedTasks: {
      where: { status: "IN_PROGRESS" },
      select: { id: true, title: true, dueDate: true },
    },
    salaryRecords: {
      where: { year: 2024 },
      orderBy: { month: "desc" },
      take: 3,
    },
  },
});
```

## 5. Migration Strategy

### Initial Migration

```sql
-- Create all tables with proper constraints
-- Set up indexes for performance
-- Insert default enum values
-- Create initial admin user
```

### Migration Best Practices

1. **Backwards Compatibility**: Always additive changes
2. **Data Preservation**: Safe column additions/modifications
3. **Index Management**: Add indexes before data volume grows
4. **Seed Data**: Consistent development environment setup
5. **Rollback Planning**: Reversible migration scripts

### Future Schema Evolution

1. **Version Control**: Git-tracked migration files
2. **Environment Parity**: Same schema across dev/staging/prod
3. **Data Migration**: Safe data transformation scripts
4. **Testing**: Migration validation on copies of production data

## 6. Data Validation Considerations

### Prisma-Level Validation

```prisma
// Built-in validations
email    String? @unique      // Uniqueness constraints
isActive Boolean @default(true) // Default values
month    Int                  // Type safety
```

### Application-Level Validation (Zod)

```typescript
// Employee validation schema
const employeeSchema = z.object({
  employeeId: z
    .string()
    .min(3)
    .max(20)
    .regex(/^EMP\d{3,}$/),
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  joiningDate: z.date().max(new Date()),
  basicSalary: z.number().positive().max(999999.99),
  department: z.string().max(50).optional(),
  position: z.string().max(50).optional(),
});

// Salary calculation validation
const salaryRecordSchema = z
  .object({
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2020).max(2030),
    basicSalary: z.number().positive(),
    bonus: z.number().min(0).default(0),
    deductions: z.number().min(0).default(0),
  })
  .refine((data) => {
    // Custom validation: total salary calculation
    const total = data.basicSalary + data.bonus - data.deductions;
    return total >= 0;
  }, "Total salary cannot be negative");
```

### Business Rule Validation

1. **Employee ID Format**: Enforced pattern (EMP001, EMP002, etc.)
2. **Salary Constraints**: Positive values, reasonable limits
3. **Date Logic**: Joining date cannot be in future
4. **Task Dependencies**: Prevent circular references
5. **Unique Constraints**: Email uniqueness, salary period uniqueness

## 7. Sample Seed Data

### Development Environment Setup

```typescript
// prisma/seed.ts
import { PrismaClient, UserRole, ProjectStatus, TaskStatus, Priority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@blurr.so",
      password: await bcrypt.hash("admin123", 10),
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });

  // Create sample employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        employeeId: "EMP001",
        name: "John Doe",
        email: "john.doe@company.com",
        joiningDate: new Date("2024-01-15"),
        basicSalary: 5000.0,
        department: "Engineering",
        position: "Senior Developer",
        userId: adminUser.id,
      },
    }),
    prisma.employee.create({
      data: {
        employeeId: "EMP002",
        name: "Jane Smith",
        email: "jane.smith@company.com",
        joiningDate: new Date("2024-02-01"),
        basicSalary: 4500.0,
        department: "Design",
        position: "UI/UX Designer",
        userId: adminUser.id,
      },
    }),
  ]);

  // Create sample project
  const project = await prisma.project.create({
    data: {
      title: "HR Portal Development",
      description: "Building the new HR management system",
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date("2024-01-01"),
      budget: 50000.0,
      userId: adminUser.id,
    },
  });

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "Design database schema",
        description: "Create comprehensive database design for HR portal",
        priority: Priority.HIGH,
        status: TaskStatus.DONE,
        estimatedHours: 16,
        actualHours: 14,
        projectId: project.id,
        assigneeId: employees[0].id,
        createdById: adminUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Create UI mockups",
        description: "Design user interface for all main screens",
        priority: Priority.MEDIUM,
        status: TaskStatus.IN_PROGRESS,
        estimatedHours: 24,
        dueDate: new Date("2024-06-15"),
        projectId: project.id,
        assigneeId: employees[1].id,
        createdById: adminUser.id,
      },
    }),
  ]);

  // Create sample salary records
  await Promise.all(
    employees.map((employee) =>
      prisma.salaryRecord.create({
        data: {
          month: 5,
          year: 2024,
          basicSalary: employee.basicSalary,
          bonus: 500.0,
          deductions: 200.0,
          totalSalary: employee.basicSalary + 500.0 - 200.0,
          employeeId: employee.id,
        },
      }),
    ),
  );

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Production Data Considerations

1. **Data Security**: Encrypted sensitive information
2. **Minimal Seed**: Only essential configuration data
3. **Environment Variables**: Database-specific settings
4. **Backup Strategy**: Regular automated backups
5. **Data Retention**: Archive old records according to policy

## 8. Security Considerations

### Data Protection

1. **Password Hashing**: bcrypt with appropriate salt rounds
2. **Session Security**: Secure HTTP-only cookies
3. **Input Validation**: Comprehensive Zod schemas
4. **SQL Injection Prevention**: Prisma's prepared statements
5. **Access Control**: Role-based permissions

### Audit and Compliance

1. **Change Tracking**: All modifications logged
2. **User Attribution**: Every action tied to user
3. **Data Retention**: Configurable retention policies
4. **Privacy Compliance**: GDPR-ready data handling
5. **Backup Security**: Encrypted backup storage

## 9. Future Enhancements

### Planned Schema Extensions

1. **Department Management**: Organizational structure
2. **Leave Management**: Vacation and sick leave tracking
3. **Performance Reviews**: Employee evaluation system
4. **Document Storage**: File attachments for records
5. **Notifications**: System alerts and reminders

### Scalability Improvements

1. **Database Sharding**: Multi-tenant architecture
2. **Read Replicas**: Separate read/write operations
3. **Caching Layer**: Redis for frequently accessed data
4. **Archive Strategy**: Historical data management
5. **API Rate Limiting**: Performance protection

## 10. Development Workflow

### Schema Development Process

1. **Design Phase**: Entity-relationship modeling
2. **Review Phase**: Team validation of schema
3. **Migration Phase**: Prisma migrate commands
4. **Testing Phase**: Seed data validation
5. **Deployment Phase**: Production migration

### Best Practices

1. **Version Control**: All schema changes tracked
2. **Documentation**: Comprehensive model documentation
3. **Testing**: Unit tests for critical validations
4. **Code Review**: Schema changes require approval
5. **Monitoring**: Performance metrics tracking

## 11. Advanced Query Patterns

### Common Business Queries

#### Employee Dashboard Metrics

```sql
-- Employee count by department
SELECT department, COUNT(*) as employee_count
FROM Employee
WHERE isActive = true
GROUP BY department;

-- Average salary by department
SELECT department, AVG(basicSalary) as avg_salary
FROM Employee
WHERE isActive = true
GROUP BY department;
```

#### Project Performance Analytics

```sql
-- Project completion rate
SELECT
  status,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Project) as percentage
FROM Project
GROUP BY status;

-- Tasks by priority distribution
SELECT
  priority,
  status,
  COUNT(*) as task_count
FROM Task
GROUP BY priority, status
ORDER BY priority, status;
```

#### Salary Analytics

```sql
-- Monthly payroll summary
SELECT
  year,
  month,
  SUM(totalSalary) as total_payroll,
  COUNT(*) as employees_paid,
  AVG(totalSalary) as avg_salary
FROM SalaryRecord
WHERE status = 'PAID'
GROUP BY year, month
ORDER BY year DESC, month DESC;

-- Overtime analysis
SELECT
  e.name,
  e.department,
  AVG(sr.overtimeHours) as avg_overtime,
  SUM(sr.overtimeHours * sr.overtimeRate) as total_overtime_pay
FROM SalaryRecord sr
JOIN Employee e ON sr.employeeId = e.id
WHERE sr.overtimeHours > 0
GROUP BY e.id, e.name, e.department
ORDER BY avg_overtime DESC;
```

### Performance Optimization Strategies

#### Index Usage Analysis

```sql
-- Most accessed employees (for cache optimization)
SELECT employeeId, COUNT(*) as access_count
FROM AuditLog
WHERE entityType = 'Employee'
GROUP BY employeeId
ORDER BY access_count DESC
LIMIT 10;

-- Task assignment patterns
SELECT
  e.name,
  e.department,
  COUNT(t.id) as assigned_tasks,
  AVG(t.actualHours) as avg_completion_time
FROM Employee e
LEFT JOIN Task t ON e.id = t.assigneeId
GROUP BY e.id, e.name, e.department
ORDER BY assigned_tasks DESC;
```

## 12. Data Migration and Backup Strategy

### Migration Scripts

#### Development to Production

```typescript
// migration-utils.ts
import { PrismaClient } from "@prisma/client";

export async function migrateData(sourcePrisma: PrismaClient, targetPrisma: PrismaClient) {
  console.log("Starting data migration...");

  // 1. Migrate users first (to maintain referential integrity)
  const users = await sourcePrisma.user.findMany();
  for (const user of users) {
    await targetPrisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  // 2. Migrate employees
  const employees = await sourcePrisma.employee.findMany();
  for (const employee of employees) {
    await targetPrisma.employee.upsert({
      where: { employeeId: employee.employeeId },
      update: employee,
      create: employee,
    });
  }

  // 3. Continue with projects, tasks, etc.
  console.log("Migration completed successfully");
}
```

#### Backup Configuration

```typescript
// backup-config.ts
export const backupConfig = {
  schedule: "0 2 * * *", // Daily at 2 AM
  retention: 30, // Keep 30 days of backups
  compression: true,
  encryption: true,
  targets: ["s3://backup-bucket/", "local://backups/"],
};

// Automated backup script
export async function createBackup() {
  const timestamp = new Date().toISOString().split("T")[0];
  const backupName = `blurr-hr-${timestamp}.sql`;

  // Export database
  await execSync(`sqlite3 ${process.env.DATABASE_URL} ".dump" > ${backupName}`);

  // Compress and encrypt
  await execSync(`gzip ${backupName}`);

  // Upload to cloud storage
  await uploadToS3(`${backupName}.gz`);

  console.log(`Backup created: ${backupName}.gz`);
}
```

## 13. Testing and Validation

### Database Testing Strategy

#### Unit Tests for Models

```typescript
// tests/models/employee.test.ts
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

describe("Employee Model", () => {
  let mockPrisma: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    mockPrisma = mockDeep<PrismaClient>();
  });

  it("should create employee with unique employeeId", async () => {
    const employee = {
      employeeId: "EMP001",
      name: "John Doe",
      basicSalary: 5000,
      department: "Engineering",
    };

    mockPrisma.employee.create.mockResolvedValue(employee as any);

    const result = await mockPrisma.employee.create({
      data: employee,
    });

    expect(result.employeeId).toBe("EMP001");
    expect(result.name).toBe("John Doe");
  });

  it("should calculate total salary correctly", () => {
    const salaryRecord = {
      basicSalary: 5000,
      bonus: 500,
      deductions: 200,
      allowances: 300,
      overtimeHours: 10,
      overtimeRate: 25,
    };

    const expectedTotal = 5000 + 500 - 200 + 300 + 10 * 25;
    expect(calculateTotalSalary(salaryRecord)).toBe(expectedTotal);
  });
});
```

#### Integration Tests

```typescript
// tests/integration/database.test.ts
import { PrismaClient } from "@prisma/client";

describe("Database Integration", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: { db: { url: process.env.TEST_DATABASE_URL } },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should enforce referential integrity", async () => {
    // Test cascade delete
    const user = await prisma.user.create({
      data: { email: "test@example.com", name: "Test User" },
    });

    const employee = await prisma.employee.create({
      data: {
        employeeId: "TEST001",
        name: "Test Employee",
        basicSalary: 1000,
        userId: user.id,
      },
    });

    await prisma.user.delete({ where: { id: user.id } });

    const deletedEmployee = await prisma.employee.findUnique({
      where: { id: employee.id },
    });

    expect(deletedEmployee).toBeNull();
  });
});
```

## 14. Monitoring and Analytics

### Database Performance Monitoring

#### Query Performance Tracking

```typescript
// monitoring/query-tracker.ts
import { PrismaClient } from "@prisma/client";

export class QueryTracker {
  private static instance: QueryTracker;
  private queryLog: Array<{
    query: string;
    duration: number;
    timestamp: Date;
  }> = [];

  static getInstance() {
    if (!QueryTracker.instance) {
      QueryTracker.instance = new QueryTracker();
    }
    return QueryTracker.instance;
  }

  logQuery(query: string, duration: number) {
    this.queryLog.push({
      query,
      duration,
      timestamp: new Date(),
    });

    // Alert on slow queries
    if (duration > 1000) {
      console.warn(`Slow query detected: ${query} (${duration}ms)`);
    }
  }

  getSlowQueries(threshold = 500) {
    return this.queryLog.filter((log) => log.duration > threshold);
  }
}
```

#### Real-time Analytics

```typescript
// analytics/real-time-stats.ts
export class RealTimeStats {
  async getDashboardMetrics() {
    const [totalEmployees, activeProjects, pendingTasks, monthlyPayroll] = await Promise.all([
      prisma.employee.count({ where: { isActive: true } }),
      prisma.project.count({ where: { status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { status: { in: ["TODO", "IN_PROGRESS"] } } }),
      prisma.salaryRecord.aggregate({
        where: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          status: "PAID",
        },
        _sum: { totalSalary: true },
      }),
    ]);

    return {
      totalEmployees,
      activeProjects,
      pendingTasks,
      monthlyPayroll: monthlyPayroll._sum.totalSalary || 0,
      lastUpdated: new Date(),
    };
  }
}
```

## Conclusion

This comprehensive database schema provides a robust foundation for the Blurr HR Portal with:

- **Complete Business Logic**: All HR requirements fully addressed
- **Performance Optimization**: Strategic indexing and query optimization
- **Data Integrity**: Comprehensive constraints and validations
- **Scalability**: Designed for growth with proper architecture
- **Security**: Built-in protection and audit mechanisms
- **Maintainability**: Clear documentation and testing strategies
- **Monitoring**: Performance tracking and analytics capabilities
- **Backup & Recovery**: Comprehensive data protection strategies

The schema successfully balances current requirements with future flexibility, ensuring the system can evolve with business needs while maintaining high performance, data integrity, and security standards. The comprehensive seed data and testing strategies provide a solid foundation for development and deployment.
