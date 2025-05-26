import { PrismaClient, Priority, ProjectStatus, TaskStatus, SalaryStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.salaryRecord.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleared existing data");

  // Create demo users
  const hashedPassword = await bcrypt.hash("12345678", 12);

  const demoUser = await prisma.user.create({
    data: {
      name: "Demo Admin",
      email: "admin@blurr.so",
      password: hashedPassword,
    },
  });

  const demoUser2 = await prisma.user.create({
    data: {
      name: "HR Manager",
      email: "hr@blurr.so",
      password: hashedPassword,
    },
  });

  console.log("👤 Created demo users");

  // Create employees for demo user
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        employeeId: "EMP001",
        name: "John Smith",
        email: "john.smith@company.com",
        joiningDate: new Date("2023-01-15"),
        basicSalary: 75000,
        department: "Engineering",
        position: "Senior Software Engineer",
        userId: demoUser.id,
      },
    }),
    prisma.employee.create({
      data: {
        employeeId: "EMP002",
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        joiningDate: new Date("2023-03-20"),
        basicSalary: 65000,
        department: "Design",
        position: "UI/UX Designer",
        userId: demoUser.id,
      },
    }),
    prisma.employee.create({
      data: {
        employeeId: "EMP003",
        name: "Michael Brown",
        email: "michael.brown@company.com",
        joiningDate: new Date("2023-05-10"),
        basicSalary: 80000,
        department: "Engineering",
        position: "Full Stack Developer",
        userId: demoUser.id,
      },
    }),
    prisma.employee.create({
      data: {
        employeeId: "EMP004",
        name: "Emily Davis",
        email: "emily.davis@company.com",
        joiningDate: new Date("2023-07-01"),
        basicSalary: 55000,
        department: "Marketing",
        position: "Digital Marketing Specialist",
        userId: demoUser.id,
      },
    }),
    prisma.employee.create({
      data: {
        employeeId: "EMP005",
        name: "David Wilson",
        email: "david.wilson@company.com",
        joiningDate: new Date("2023-09-15"),
        basicSalary: 90000,
        department: "Engineering",
        position: "Technical Lead",
        userId: demoUser.id,
      },
    }),
    prisma.employee.create({
      data: {
        employeeId: "EMP006",
        name: "Lisa Anderson",
        email: "lisa.anderson@company.com",
        joiningDate: new Date("2023-11-20"),
        basicSalary: 60000,
        department: "HR",
        position: "HR Specialist",
        userId: demoUser.id,
      },
    }),
    prisma.employee.create({
      data: {
        employeeId: "EMP007",
        name: "Robert Taylor",
        email: "robert.taylor@company.com",
        joiningDate: new Date("2024-01-08"),
        basicSalary: 70000,
        department: "Sales",
        position: "Sales Manager",
        userId: demoUser.id,
      },
    }),
    prisma.employee.create({
      data: {
        employeeId: "EMP008",
        name: "Jennifer Martinez",
        email: "jennifer.martinez@company.com",
        joiningDate: new Date("2024-03-12"),
        basicSalary: 58000,
        department: "Design",
        position: "Graphic Designer",
        userId: demoUser.id,
      },
    }),
  ]);

  console.log("👥 Created employees");

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: "E-commerce Platform Redesign",
        description: "Complete redesign of the company e-commerce platform with modern UI/UX and improved performance.",
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-06-30"),
        userId: demoUser.id,
      },
    }),
    prisma.project.create({
      data: {
        title: "Mobile App Development",
        description: "Development of a new mobile application for iOS and Android platforms.",
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        startDate: new Date("2024-02-15"),
        endDate: new Date("2024-08-15"),
        userId: demoUser.id,
      },
    }),
    prisma.project.create({
      data: {
        title: "Customer Portal Enhancement",
        description: "Enhancing the existing customer portal with new features and improved user experience.",
        status: ProjectStatus.COMPLETED,
        priority: Priority.MEDIUM,
        startDate: new Date("2023-10-01"),
        endDate: new Date("2024-01-31"),
        userId: demoUser.id,
      },
    }),
    prisma.project.create({
      data: {
        title: "Data Analytics Dashboard",
        description: "Building a comprehensive analytics dashboard for business intelligence.",
        status: ProjectStatus.PLANNING,
        priority: Priority.LOW,
        startDate: new Date("2024-04-01"),
        endDate: new Date("2024-10-31"),
        userId: demoUser.id,
      },
    }),
    prisma.project.create({
      data: {
        title: "Security Audit & Implementation",
        description: "Comprehensive security audit and implementation of enhanced security measures.",
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.URGENT,
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-05-31"),
        userId: demoUser.id,
      },
    }),
  ]);

  console.log("📋 Created projects");

  // Create tasks distributed across different statuses
  const tasks = await Promise.all([
    // TODO tasks
    prisma.task.create({
      data: {
        title: "Design homepage mockups",
        description: "Create wireframes and mockups for the new homepage design",
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        projectId: projects[0].id,
        assigneeId: employees[1].id, // Sarah Johnson (Designer)
        createdById: demoUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Setup development environment",
        description: "Configure development environment for the mobile app project",
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        projectId: projects[1].id,
        assigneeId: employees[2].id, // Michael Brown
        createdById: demoUser.id,
      },
    }),

    // IN_PROGRESS tasks
    prisma.task.create({
      data: {
        title: "Implement user authentication",
        description: "Develop secure user authentication system with JWT tokens",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        projectId: projects[0].id,
        assigneeId: employees[0].id, // John Smith
        createdById: demoUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Database schema optimization",
        description: "Optimize database queries and implement indexing strategies",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        projectId: projects[1].id,
        assigneeId: employees[4].id, // David Wilson
        createdById: demoUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Security vulnerability assessment",
        description: "Conduct thorough security assessment of current systems",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.URGENT,
        projectId: projects[4].id,
        assigneeId: employees[0].id, // John Smith
        createdById: demoUser.id,
      },
    }),

    // IN_REVIEW tasks
    prisma.task.create({
      data: {
        title: "Payment gateway integration",
        description: "Integrate Stripe payment gateway with proper error handling",
        status: TaskStatus.IN_REVIEW,
        priority: Priority.HIGH,
        projectId: projects[0].id,
        assigneeId: employees[2].id, // Michael Brown
        createdById: demoUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "API documentation",
        description: "Create comprehensive API documentation using Swagger",
        status: TaskStatus.IN_REVIEW,
        priority: Priority.LOW,
        projectId: projects[1].id,
        assigneeId: employees[4].id, // David Wilson
        createdById: demoUser.id,
      },
    }),

    // TESTING tasks
    prisma.task.create({
      data: {
        title: "Unit test coverage",
        description: "Achieve 80% unit test coverage for critical components",
        status: TaskStatus.TESTING,
        priority: Priority.MEDIUM,
        projectId: projects[0].id,
        assigneeId: employees[0].id, // John Smith
        createdById: demoUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Performance optimization",
        description: "Optimize application performance and reduce load times",
        status: TaskStatus.TESTING,
        priority: Priority.HIGH,
        projectId: projects[1].id,
        assigneeId: employees[2].id, // Michael Brown
        createdById: demoUser.id,
      },
    }),

    // DONE tasks
    prisma.task.create({
      data: {
        title: "User registration flow",
        description: "Implement complete user registration with email verification",
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        projectId: projects[2].id,
        assigneeId: employees[0].id, // John Smith
        createdById: demoUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Dashboard analytics widgets",
        description: "Create interactive widgets for the analytics dashboard",
        status: TaskStatus.DONE,
        priority: Priority.MEDIUM,
        projectId: projects[2].id,
        assigneeId: employees[1].id, // Sarah Johnson
        createdById: demoUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Customer feedback system",
        description: "Implement customer feedback collection and management system",
        status: TaskStatus.DONE,
        priority: Priority.LOW,
        projectId: projects[2].id,
        assigneeId: employees[2].id, // Michael Brown
        createdById: demoUser.id,
      },
    }),

    // CANCELLED task
    prisma.task.create({
      data: {
        title: "Legacy system migration",
        description: "Migrate data from legacy system (cancelled due to scope changes)",
        status: TaskStatus.CANCELLED,
        priority: Priority.LOW,
        projectId: projects[3].id,
        assigneeId: employees[4].id, // David Wilson
        createdById: demoUser.id,
      },
    }),
  ]);

  console.log("📝 Created tasks");

  // Create salary records for different months
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Create salary records for the last 3 months for all employees
  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const targetDate = new Date(currentYear, currentMonth - 1 - monthOffset, 1);
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();

    for (const employee of employees) {
      // Add some variation to bonuses and deductions
      const bonus = Math.floor(Math.random() * 5000) + (monthOffset === 0 ? 2000 : 0); // Higher bonus for current month
      const deductions = Math.floor(Math.random() * 1000) + 500;
      const totalSalary = employee.basicSalary + bonus - deductions;

      // Vary status - most recent month has DRAFT, previous months are PAID
      const status =
        monthOffset === 0 ? (Math.random() > 0.5 ? SalaryStatus.DRAFT : SalaryStatus.APPROVED) : SalaryStatus.PAID;

      await prisma.salaryRecord.create({
        data: {
          employeeId: employee.id,
          month,
          year,
          basicSalary: employee.basicSalary,
          bonus,
          deductions,
          totalSalary,
          status,
          notes: `Salary record for ${employee.name} - ${month}/${year}`,
        },
      });
    }
  }

  console.log("💰 Created salary records");

  // Create additional employees for the second user
  await Promise.all([
    prisma.employee.create({
      data: {
        employeeId: "HR001",
        name: "Alice Cooper",
        email: "alice.cooper@company.com",
        joiningDate: new Date("2023-02-01"),
        basicSalary: 65000,
        department: "HR",
        position: "HR Manager",
        userId: demoUser2.id,
      },
    }),
    prisma.employee.create({
      data: {
        employeeId: "HR002",
        name: "Bob Wilson",
        email: "bob.wilson@company.com",
        joiningDate: new Date("2023-04-15"),
        basicSalary: 55000,
        department: "HR",
        position: "Recruiter",
        userId: demoUser2.id,
      },
    }),
  ]);

  console.log("👥 Created employees for second user");

  console.log("✅ Seed completed successfully!");
  console.log("");
  console.log("🔐 Demo Accounts:");
  console.log("   Email: admin@blurr.so");
  console.log("   Password: 12345678");
  console.log("");
  console.log("   Email: hr@blurr.so");
  console.log("   Password: 12345678");
  console.log("");
  console.log("📊 Demo Data Created:");
  console.log(`   - ${employees.length + 2} Employees`);
  console.log(`   - ${projects.length} Projects`);
  console.log(`   - ${tasks.length} Tasks`);
  console.log(`   - ${employees.length * 3} Salary Records`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
