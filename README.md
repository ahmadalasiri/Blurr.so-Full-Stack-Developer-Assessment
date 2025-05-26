# Blurr HR Portal - Technical Assessment

A comprehensive Human Resources Portal built with modern web technologies to demonstrate full-stack development capabilities. This application provides employee management, project tracking, task management with Kanban boards, salary calculations, and an AI-powered chatbot assistant.

## 🚀 Features

### 🔐 Authentication & Security

- **NextAuth.js Integration**: Secure credential-based authentication
- **Role-Based Access Control**: USER, ADMIN, MANAGER permissions
- **Route Protection**: Middleware-based access control
- **Session Management**: JWT-based sessions with secure cookies

### 👥 Employee Management

- **Complete CRUD Operations**: Create, read, update, and delete employees
- **Employee Profiles**: Comprehensive employee information management
- **Department & Position Tracking**: Organizational structure support
- **Active/Inactive Status**: Employee lifecycle management
- **Search & Filtering**: Advanced employee discovery

### 📊 Project & Task Management

- **Project Lifecycle**: Complete project management from planning to completion
- **Kanban Board**: Visual task management with drag-and-drop functionality
- **Task Backlog**: Comprehensive task listing with advanced filtering
- **Priority Management**: LOW, MEDIUM, HIGH, URGENT priority levels
- **Status Tracking**: Todo → In Progress → Review → Testing → Done workflow
- **Employee Assignment**: Task delegation and workload distribution

### 💰 Salary Management

- **Monthly Calculations**: Automated salary computations
- **Bonus & Deductions**: Flexible compensation adjustments
- **Salary History**: Complete compensation tracking
- **Payable Amount Calculation**: Net salary determination

### 🤖 AI Chatbot Assistant

- **Intelligent Help**: Context-aware assistance for HR tasks
- **Data Integration**: Real-time access to employee and project information
- **Navigation Assistance**: Guided workflows and feature explanations
- **Query Processing**: Natural language understanding for HR queries

### 📈 Dashboard & Analytics

- **Real-time Statistics**: Project, employee, and task metrics
- **Progress Tracking**: Visual progress indicators and completion rates
- **Quick Actions**: Streamlined access to common tasks
- **Responsive Design**: Optimized for desktop, tablet, and mobile

## 🛠 Tech Stack

### Frontend

- **React 18+** with TypeScript (Strict Mode)
- **Next.js 15** with App Router
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** component library
- **React Hook Form** with Zod validation
- **Lucide React** for icons

### Backend

- **Next.js Server Actions** for backend logic
- **NextAuth.js** for authentication
- **Prisma ORM** with SQLite database
- **TypeScript** for end-to-end type safety

### Development Tools

- **ESLint** for code quality
- **Prettier** for code formatting
- **TypeScript** for static type checking
- **Prisma Studio** for database management

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Git** for version control

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd blurr-hr-portal
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # Authentication
   NEXTAUTH_SECRET="your-secure-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize the database:**

   ```bash
   # Run migrations
   npx prisma migrate dev --name init

   # Generate Prisma client
   npx prisma generate

   # (Optional) Seed with sample data
   npx prisma db seed
   ```

5. **Start the development server:**

   ```bash
   npm run dev
   ```

6. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/            # Authentication pages
│   ├── register/
│   └── api/              # API routes
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── dashboard/       # Dashboard-specific components
│   ├── employees/       # Employee management components
│   ├── projects/        # Project management components
│   ├── tasks/           # Task management components
│   ├── salary/          # Salary management components
│   └── chatbot/         # AI chatbot components
├── lib/                 # Utility functions and configurations
│   ├── *-actions.ts     # Server Actions
│   ├── *-validation.ts  # Zod schemas
│   └── utils.ts         # Helper functions
├── auth.ts              # NextAuth.js configuration
└── middleware.ts        # Route protection middleware

prisma/
├── schema.prisma        # Database schema
├── migrations/          # Database migrations
└── dev.db              # SQLite database file

AI/                      # Technical documentation
├── 01-project-architecture.md
├── 02-database-schema.md
├── 03-authentication-system.md
├── 04-employee-management.md
├── 05-project-task-management.md
├── 06-ui-ux-design.md
└── 07-ai-chatbot-integration.md
```

## 🗄 Database Schema

### Core Models

- **User**: Authentication and session management
- **Employee**: Employee information and status
- **Project**: Project management with lifecycle tracking
- **Task**: Task management with status and priority
- **SalaryRecord**: Monthly salary calculations and history

### Key Relationships

```
User (1) ──────────── (N) Employee
User (1) ──────────── (N) Project
User (1) ──────────── (N) Task (as creator)
Employee (1) ─────── (N) Task (as assignee)
Employee (1) ─────── (N) SalaryRecord
Project (1) ─────── (N) Task
```

### Database Features

- **Referential Integrity**: Proper foreign key constraints
- **Audit Trail**: Comprehensive change tracking
- **Performance Optimization**: Strategic indexing
- **Data Validation**: Schema-level constraints

## 🎯 Key Features Deep Dive

### Dashboard Overview

- **Real-time Statistics**: Live metrics from database
- **Interactive Cards**: Click-through navigation
- **Progress Indicators**: Visual completion tracking
- **Quick Actions**: Streamlined task creation

### Employee Management

- **Smart Forms**: Real-time validation with Zod
- **Advanced Search**: Multi-field filtering capabilities
- **Bulk Operations**: Efficient multi-employee actions
- **Export Functionality**: CSV and Excel export support

### Project Management

- **Visual Kanban**: Drag-and-drop task management
- **Backlog View**: Comprehensive task listing
- **Progress Tracking**: Real-time project metrics
- **Team Collaboration**: Employee assignment and tracking

### Salary System

- **Automated Calculations**: Monthly salary processing
- **Flexible Adjustments**: Bonus and deduction support
- **Historical Tracking**: Complete salary history
- **Report Generation**: Detailed compensation reports

### AI Chatbot

- **Context-Aware**: Understanding of current user context
- **Data Integration**: Real-time database queries
- **Natural Language**: Human-like conversation interface
- **Feature Guidance**: Interactive help and tutorials

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma studio       # Open database GUI
npx prisma migrate dev  # Create and apply migration
npx prisma generate     # Regenerate Prisma client
npx prisma db push      # Push schema changes to database
npx prisma db seed      # Seed database with sample data

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # Run TypeScript checks
```

## 🛡 Security Features

### Authentication Security

- **Password Hashing**: bcrypt with cost factor 12
- **Session Security**: HTTP-only cookies with secure flags
- **CSRF Protection**: Built-in NextAuth.js protection
- **Input Validation**: Comprehensive Zod schema validation

### Access Control

- **Route Protection**: Middleware-based authentication
- **Role-Based Permissions**: Granular access control
- **Data Isolation**: User-scoped data access
- **Audit Logging**: Comprehensive activity tracking

### Data Protection

- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: React built-in sanitization
- **Input Sanitization**: Server-side validation
- **Environment Security**: Secure credential management

## 📊 Performance Optimizations

### Frontend Performance

- **Server Components**: Reduced client-side bundle
- **Code Splitting**: Lazy loading for better performance
- **Image Optimization**: Next.js automatic optimization
- **Bundle Analysis**: Optimized asset loading

### Database Performance

- **Query Optimization**: Efficient data fetching
- **Connection Pooling**: Optimized database connections
- **Indexing Strategy**: Performance-tuned queries
- **Pagination**: Efficient large dataset handling

### User Experience

- **Loading States**: Smooth user interactions
- **Optimistic Updates**: Immediate UI feedback
- **Error Boundaries**: Graceful error handling
- **Responsive Design**: Cross-device compatibility

## 🎨 Design System

### Component Architecture

- **Consistent Styling**: shadcn/ui design system
- **Responsive Layout**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance
- **Theme Support**: Light/dark mode capability

### UI Patterns

- **Card-Based Layout**: Consistent information presentation
- **Progressive Disclosure**: Hierarchical information architecture
- **Interactive Feedback**: Clear user action confirmation
- **Visual Hierarchy**: Proper typography and spacing

## 🧪 Testing Strategy

### Automated Testing

- **TypeScript**: Compile-time error detection
- **ESLint**: Code quality enforcement
- **Prisma**: Database schema validation
- **Form Validation**: Client and server-side validation

### Manual Testing

- **Cross-Browser**: Chrome, Firefox, Safari, Edge
- **Responsive Design**: Desktop, tablet, mobile
- **Accessibility**: Screen reader and keyboard navigation
- **User Workflows**: End-to-end feature testing

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**: Set production environment variables
2. **Database Migration**: Run production migrations
3. **Build Optimization**: Production build with optimizations
4. **Vercel Deployment**: Single-command deployment

### Environment Variables (Production)

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

## 📖 API Documentation

### Authentication Endpoints

- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `POST /api/register` - User registration

### Server Actions

- **Employee Actions**: CRUD operations for employee management
- **Project Actions**: Project lifecycle management
- **Task Actions**: Task management and Kanban operations
- **Salary Actions**: Salary calculation and history
- **Chatbot Actions**: AI assistant interactions

## 🤝 Contributing

### Development Guidelines

1. **Code Quality**: Follow ESLint and TypeScript standards
2. **Component Design**: Use shadcn/ui patterns
3. **Database Changes**: Always create migrations
4. **Testing**: Test all new features thoroughly
5. **Documentation**: Update relevant documentation

### Git Workflow

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Set up a PostgreSQL database:**

   ```bash
   # Option 1: Vercel Postgres
   # Create database in Vercel dashboard

   # Option 2: Supabase (Free tier)
   # Sign up at supabase.com and create a project

   # Option 3: PlanetScale
   # Sign up at planetscale.com and create a database
   ```

2. **Deploy to Vercel:**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

3. **Configure environment variables in Vercel:**

   ```env
   DATABASE_URL="postgresql://username:password@host:port/database"
   AUTH_SECRET="your-secure-random-secret-key"
   NEXTAUTH_URL="https://your-app.vercel.app"
   ```

4. **Run database migrations:**

   ```bash
   # After deployment, run migrations
   npx prisma migrate deploy

   # Seed the database (optional)
   npm run db:seed
   ```

### Manual Deployment

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Set up production database:**

   - Configure PostgreSQL instance
   - Update DATABASE_URL in environment variables
   - Run migrations: `npx prisma migrate deploy`

3. **Start the production server:**
   ```bash
   npm start
   ```

### Environment Variables

Required environment variables for production:

```env
# Database (PostgreSQL for production)
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
AUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-domain.com"

# Optional: For internal networking
NEXTAUTH_URL_INTERNAL="http://localhost:3000"
```

### Database Migration Notes

- **Development**: Uses SQLite (`dev.db`)
- **Production**: Requires PostgreSQL for Vercel deployment
- **Migration**: Run `prisma migrate deploy` after deployment
- **Seeding**: Use `npm run db:seed` to populate with test data

### Post-Deployment Setup

1. **Test login with seeded accounts:**

   ```
   Admin: admin@blurr.so / admin123
   Manager: manager@blurr.so / manager123
   User: user@blurr.so / user123
   ```

2. **Monitor application:**

   - Check Vercel dashboard for deployment status
   - Monitor database connections
   - Verify authentication flows

3. **Custom domain (optional):**
   - Configure custom domain in Vercel dashboard
   - Update NEXTAUTH_URL environment variable

## 🤝 Contributing

### Development Workflow

1. Create feature branch from main
2. Implement changes with tests
3. Update documentation if needed
4. Create pull request with description
5. Review and merge after approval

## 📝 License

This project is part of a technical assessment for Blurr.so and is intended for evaluation purposes.

## 🔗 References

### Technical Documentation

- [Project Architecture](./AI/01-project-architecture.md)
- [Database Schema](./AI/02-database-schema.md)
- [Authentication System](./AI/03-authentication-system.md)
- [Employee Management](./AI/04-employee-management.md)
- [Project & Task Management](./AI/05-project-task-management.md)
- [UI/UX Design System](./AI/06-ui-ux-design.md)
- [AI Chatbot Integration](./AI/07-ai-chatbot-integration.md)

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Built with ❤️ using modern web technologies for efficient HR management.**
