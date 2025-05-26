# Blurr.so HR Management System

A comprehensive HR management application built with Next.js, featuring employee management, project tracking, task management, and salary processing.

## 🎥 Demo Video

https://github.com/user-attachments/assets/708a842c-1994-4f63-820f-28ece27b0810

## 🚀 Live Demo

**Deployed Application:** [https://blurr.ahmadalasiri.info/](https://blurr.ahmadalasiri.info/)

### Demo Credentials

- **Email:** admin@blurr.so
- **Password:** 12345678

## ✨ Features

- **Employee Management**: Add, edit, and manage employee records
- **Project Management**: Create and track projects with task organization
- **Task Management**: Kanban board and backlog views for task tracking
- **Salary Management**: Calculate and process employee salaries
- **Authentication**: Secure login with NextAuth.js
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui
- **AI Chatbot**: Integrated chatbot for assistance

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS, shadcn/ui
- **Deployment**: Self-hosted on Contabo VPS

## 📱 Application Sections

1. **Dashboard**: Overview with statistics and quick actions
2. **Projects**: Project management with kanban and backlog views
3. **Employees**: Employee database and management
4. **Salary**: Salary calculation and processing
5. **Settings**: User preferences and system configuration

## 📊 Database Schema

The application uses a relational database with the following main entities:

- Users (Authentication)
- Employees (HR Records)
- Projects (Project Management)
- Tasks (Task Tracking)
- Salaries (Payroll)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- SQLite

### Installation

1. Clone the repository

```bash
git clone https://github.com/ahmadalasiri/Blurr.so-Full-Stack-Developer-Assessment.git
cd blurr-hr-system
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

4. Initialize the database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. Run the development server

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (optional for chatbot)
OPENAI_API_KEY="your-openai-key"
```

## 🏗️ Deployment

The application is deployed on a Contabo VPS with:

- PM2 for process management
- Nginx as reverse proxy
- SSL certificate for HTTPS
- Automated builds and deployments

### Development Workflow:

1. Start with architecture and planning prompts
2. Implement core infrastructure (auth, database)
3. Build core features (employees, projects, tasks)
4. Add advanced features (Kanban, AI chatbot)
5. Optimize and polish for production
6. Prepare for deployment and demo

---

**Note**: This application was developed as part of a technical assessment for Blurr.so
