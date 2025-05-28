# REST Client Testing for HR Management System

This folder contains `.http` files for testing API endpoints using VS Code's REST Client extension. These files simulate traditional REST API endpoints for comprehensive testing of the HR Management System.

## 📁 File Structure

```
rest-client/
├── README.md              # This file - setup and usage guide
├── auth.http             # Authentication endpoints
├── chatbot.http          # AI chatbot API endpoints
├── employees.http        # Employee management endpoints
├── projects.http         # Project management endpoints
├── tasks.http           # Task management endpoints
├── salary.http          # Salary and payroll endpoints
└── comprehensive-tests.http  # Complete API testing workflow
```

## 🔧 Setup

### 1. Install REST Client Extension

Install the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension in VS Code.

### 2. Environment Variables

Create a `.env` file in the project root with:

```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=your-database-url
```

### 3. Start the Development Server

```bash
npm run dev
```

## 🚀 Usage

1. **Open any `.http` file** in VS Code
2. **Click "Send Request"** above any HTTP request
3. **View responses** in the VS Code output panel
4. **Modify variables** at the top of each file as needed

### Common Variables

Each file includes these variables that you can customize:

- `@baseUrl` - API base URL (default: http://localhost:3000)
- `@contentType` - Content type header (default: application/json)
- `@userEmail` - Test user email
- `@authToken` - Authentication token (obtain from login request)

## 📊 API Endpoints Overview

### Authentication (`auth.http`)

- User registration and login
- NextAuth.js provider authentication
- Session management
- CSRF protection

### Chatbot (`chatbot.http`)

- AI chat conversations
- Message history
- Context-aware responses

### Employees (`employees.http`)

- CRUD operations for employee records
- Employee search and filtering
- Department management
- Employee statistics

### Projects (`projects.http`)

- Project lifecycle management
- Team assignment
- Budget tracking
- Project analytics

### Tasks (`tasks.http`)

- Task creation and assignment
- Time tracking
- Task dependencies
- Progress monitoring

### Salary (`salary.http`)

- Salary records management
- Bonus and benefits tracking
- Salary reviews and approvals
- Payroll reports

## ⚠️ Important Notes

### Server Actions vs REST APIs

This Next.js application primarily uses **Server Actions** instead of traditional REST API routes:

#### What are Server Actions?

Server Actions are server-side functions that can be called directly from React components. They provide:

- **Type Safety**: Full TypeScript support end-to-end
- **Better Performance**: No separate API calls needed
- **Built-in Security**: CSRF protection and secure by default
- **Simplified Code**: Direct function calls instead of fetch requests

#### REST Client Purpose

These `.http` files are for:

- **Testing and Development**: Simulating how traditional REST endpoints would work
- **API Documentation**: Understanding the data structures and operations
- **Integration Testing**: Verifying business logic with various scenarios
- **Learning**: Understanding the application's capabilities

#### Actual Implementation

The real application uses Server Actions located in:

- `src/lib/employee-actions.ts` - Employee operations
- `src/lib/project-actions.ts` - Project operations
- `src/lib/salary-actions.ts` - Salary operations
- `src/app/api/` - Limited traditional API routes (auth, chatbot)

### Error Handling

Each `.http` file includes error test cases:

- **Validation Errors**: Missing required fields, invalid data types
- **Authentication Errors**: Unauthorized access, expired tokens
- **Business Logic Errors**: Invalid operations, constraint violations
- **Not Found Errors**: Non-existent resources

## 🧪 Testing Scenarios

### 1. Authentication Flow

```http
# 1. Register new user
POST {{baseUrl}}/api/register

# 2. Login to get token
POST {{baseUrl}}/api/login

# 3. Use token for authenticated requests
GET {{baseUrl}}/api/employees
Authorization: Bearer {{authToken}}
```

### 2. Employee Management

```http
# 1. Create employee
POST {{baseUrl}}/api/employees

# 2. Get employee details
GET {{baseUrl}}/api/employees/{{employeeId}}

# 3. Update employee
PUT {{baseUrl}}/api/employees/{{employeeId}}

# 4. Delete employee
DELETE {{baseUrl}}/api/employees/{{employeeId}}
```

### 3. Project Workflow

```http
# 1. Create project
POST {{baseUrl}}/api/projects

# 2. Assign employees
POST {{baseUrl}}/api/projects/{{projectId}}/employees

# 3. Create tasks
POST {{baseUrl}}/api/tasks

# 4. Track progress
PATCH {{baseUrl}}/api/tasks/{{taskId}}/status
```

## 🔍 Response Examples

### Successful Response

```json
{
  "success": true,
  "data": {
    "id": "emp_01",
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format"
    }
  }
}
```

## 🛠️ Development Tips

1. **Use Variables**: Modify the variables at the top of each file for your test data
2. **Sequential Testing**: Some tests depend on previous requests (like login → authenticated requests)
3. **Error Testing**: Don't forget to test error scenarios to ensure proper validation
4. **Real Data**: Use realistic test data that matches your application's schema

## 📚 Additional Resources

- [REST Client Extension Documentation](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [NextAuth.js Documentation](https://next-auth.js.org/)

## 🤝 Contributing

When adding new endpoints:

1. Follow the existing naming conventions
2. Include comprehensive error test cases
3. Add clear comments explaining the purpose
4. Update this README with new endpoint descriptions
5. Reference the corresponding Server Action in comments
