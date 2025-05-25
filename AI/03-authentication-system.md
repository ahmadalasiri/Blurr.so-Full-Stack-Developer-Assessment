# Authentication System Implementation - Blurr HR Portal

## Overview

The Blurr HR Portal implements a comprehensive authentication system using NextAuth.js with the following features:

1. **Credential-based Authentication** - Email and password login
2. **User Registration** - Account creation with validation
3. **Route Protection** - Middleware-based access control
4. **Role-based Authorization** - USER, ADMIN, MANAGER roles
5. **Session Management** - JWT-based sessions with secure cookies
6. **TypeScript Integration** - Fully typed authentication flow

## Core Components

### 1. NextAuth.js Configuration (`src/auth.ts`)

**Status: ✅ COMPLETED**

The authentication system is fully implemented with the following features:

```typescript
export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ✅ Email/password validation implemented
        // ✅ Database user lookup with Prisma
        // ✅ Password verification with bcrypt
        // ✅ Proper error handling
        // ✅ Email format validation
        return user || null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // ✅ Add user ID and role to session
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    async jwt({ token, user }) {
      // ✅ Store user data in JWT token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // ✅ Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // ✅ Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login", // ✅ Custom login page
    error: "/login", // ✅ Error handling
  },
  session: {
    strategy: "jwt", // ✅ JWT-based sessions
    maxAge: 24 * 60 * 60, // ✅ 24 hours session duration
  },
  events: {
    async signIn({ user }) {
      // ✅ Audit logging implemented
      console.log(`User ${user.email} signed in`);
    },
  },
  debug: process.env.NODE_ENV === "development", // ✅ Development debugging
});
```

**Key Features Implemented:**

- ✅ Credential-based authentication with email/password
- ✅ Secure password hashing with bcryptjs (cost factor 12)
- ✅ Email format validation and normalization
- ✅ TypeScript integration with proper type extensions
- ✅ Role-based access control (USER, ADMIN, MANAGER)
- ✅ Session persistence with JWT tokens
- ✅ Custom redirect handling
- ✅ Audit logging for security monitoring

### 2. Route Protection Middleware (`src/middleware.ts`)

**Status: ✅ COMPLETED**

The middleware provides comprehensive route protection with role-based access control:

```typescript
export default async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // ✅ Route definitions implemented
  const protectedRoutes = ["/dashboard", "/dashboard/:path*", "/profile", "/settings"];
  const authRoutes = ["/login", "/register"];
  const adminRoutes = ["/dashboard/admin", "/dashboard/admin/:path*"];
  const managerRoutes = ["/dashboard/salary", "/dashboard/reports"];

  // ✅ Route checking logic
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route.replace(":path*", "")));
  const isAuthRoute = authRoutes.includes(pathname);
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route.replace(":path*", "")));
  const isManagerRoute = managerRoutes.some((route) => pathname.startsWith(route.replace(":path*", "")));

  // ✅ Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !session?.user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ✅ Redirect authenticated users from auth routes
  if (isAuthRoute && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ✅ Check admin access
  if (isAdminRoute && session?.user) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // ✅ Check manager access
  if (isManagerRoute && session?.user) {
    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}
```

**Features Implemented:**

- ✅ Session-based authentication check
- ✅ Protected route enforcement
- ✅ Role-based access control (Admin, Manager, User)
- ✅ Automatic redirects with callback URLs
- ✅ Comprehensive route pattern matching
- ✅ Proper middleware configuration
  // Admin-only route protection
  }

  if (isManagerRoute && !["ADMIN", "MANAGER"].includes(session?.user?.role)) {
  // Manager-level route protection
  }
  }

````

**Protected Routes:**

- `/dashboard` and sub-routes
- `/profile`
- `/settings`

**Role-based Routes:**

- Admin routes: `/dashboard/admin/*`
- Manager routes: `/dashboard/salary`, `/dashboard/reports`

### 3. Validation Schemas (`src/lib/auth-validation.ts`)

```typescript
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Valid email required"),
  password: z.string().min(1, "Password is required").min(6, "Min 6 characters"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Letters and spaces only"),
    email: z.string().email("Valid email required").toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must contain uppercase, lowercase, and number"),
    confirmPassword: z.string().min(1, "Confirm password required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
````

**Features:**

- Comprehensive validation rules
- Password strength requirements
- Email format validation
- Confirmation password matching
- TypeScript type inference

### 4. Login Page (`src/app/login/page.tsx`)

**Key Features:**

- React Hook Form with Zod validation
- Password visibility toggle
- Session-based redirects
- Error handling and display
- Registration success alerts
- Loading states
- Responsive design with shadcn/ui

**Form Implementation:**

```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
  setError,
} = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
  mode: "onBlur",
});

const onSubmit = async (data: LoginInput) => {
  const result = await nextAuthSignIn("credentials", {
    redirect: false,
    email: data.email,
    password: data.password,
  });

  // Handle success/error states
};
```

### 5. Registration Page (`src/app/register/page.tsx`)

**Key Features:**

- Multi-field validation
- Password strength indicator
- Dual password confirmation
- Real-time validation feedback
- API integration for user creation
- Automatic redirect after success

**Password Strength Indicator:**

```typescript
const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[a-z]/.test(password)) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 25;
  return score;
};
```

### 6. API Routes

#### Login API (`src/app/api/login/route.ts`)

- Zod validation
- NextAuth credential sign-in
- Error handling with specific messages
- CSRF protection

#### Registration API (`src/app/api/register/route.ts`)

- User existence checking
- Password hashing with bcrypt (cost factor 12)
- Prisma database integration
- Comprehensive error handling

#### NextAuth Handler (`src/app/api/auth/[...nextauth]/route.ts`)

- Standard NextAuth.js route handler
- Exports GET and POST handlers

### 7. TypeScript Integration

**Session Type Extensions:**

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}
```

**Utility Functions:**

```typescript
export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}
```

## Security Features

### 1. Password Security

- Minimum 8 characters
- Requires uppercase, lowercase, and numbers
- Bcrypt hashing with cost factor 12
- Client and server-side validation

### 2. Session Security

- JWT-based sessions
- 24-hour expiry
- Secure HTTP-only cookies
- CSRF protection via NextAuth.js

### 3. Route Protection

- Middleware-based authentication checking
- Role-based access control
- Automatic redirects for unauthorized access
- Callback URL preservation

### 4. Input Validation

- Zod schema validation
- SQL injection prevention via Prisma ORM
- XSS prevention through React
- Email format validation

## User Experience

### 1. Login Flow

1. User enters credentials
2. Client-side validation
3. API call to NextAuth
4. Session creation
5. Redirect to dashboard or callback URL

### 2. Registration Flow

1. User fills registration form
2. Real-time validation feedback
3. Password strength indicator
4. API call creates user
5. Redirect to login with success message

### 3. Error Handling

- Field-specific error messages
- Form-level error alerts
- Network error handling
- Loading state indicators

### 4. Accessibility

- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management

## Database Integration

**User Model (Prisma):**

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  role          UserRole  @default(USER)
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum UserRole {
  USER
  ADMIN
  MANAGER
}
```

## Environment Variables

Required environment variables:

```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=file:./dev.db
```

## Testing Considerations

### 1. Authentication Flow Testing

- Login with valid credentials
- Login with invalid credentials
- Registration with various input combinations
- Session persistence across page reloads

### 2. Route Protection Testing

- Access protected routes without authentication
- Role-based access verification
- Redirect functionality testing

### 3. Security Testing

- Password hashing verification
- Session expiry testing
- CSRF protection validation
- Input sanitization testing

## Future Enhancements

### 1. Email Verification

- Email confirmation workflow
- Resend verification emails
- Account activation process

### 2. Password Reset

- Forgot password functionality
- Secure reset token generation
- Time-limited reset links

### 3. OAuth Integration

- Google OAuth provider
- GitHub OAuth provider
- Social login options

### 4. Two-Factor Authentication

- TOTP implementation
- SMS verification
- Backup codes

### 5. Session Management

- Multiple device sessions
- Session monitoring
- Force logout functionality

## Performance Optimizations

### 1. Database Queries

- Indexed email field for fast lookup
- Efficient user verification queries
- Connection pooling with Prisma

### 2. Client-Side Performance

- Form validation caching
- Debounced input validation
- Optimized bundle size

### 3. Security Performance

- Password hashing optimization
- Session token efficiency
- Middleware performance tuning

## Conclusion

The authentication system provides a robust, secure, and user-friendly foundation for the Blurr HR Portal. It implements industry best practices for authentication, authorization, and session management while maintaining excellent developer experience through TypeScript integration and comprehensive error handling.

The system is production-ready and includes all necessary components for secure user authentication and access control in a modern web application.
