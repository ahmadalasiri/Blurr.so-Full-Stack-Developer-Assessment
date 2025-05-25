import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiRegisterSchema } from "@/lib/auth-validation";
import { ZodError } from "zod";

// Define UserRole enum manually since Prisma client needs regeneration
enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
}

export async function POST(req: Request) {
  try {
    const body = await req.json(); // Validate input using Zod schema
    const validatedData = apiRegisterSchema.parse(body);
    const { name, email, password } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "User with this email already exists",
          field: "email",
        },
        { status: 409 },
      );
    }

    // Hash password with higher cost for better security
    const hashedPassword = await hash(password, 12);

    // Create new user with default role
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: UserRole.USER,
        emailVerified: null, // Email verification can be added later
      },
    });

    // Log user creation for audit purposes
    console.log(`New user registered: ${email}`);

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "Account created successfully! You can now sign in.",
        user: {
          id: userWithoutPassword.id,
          name: userWithoutPassword.name,
          email: userWithoutPassword.email,
          role: userWithoutPassword.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const fieldErrors = error.errors.reduce((acc, err) => {
        const field = err.path[0];
        acc[field] = err.message;
        return acc;
      }, {} as Record<string, string>);

      return NextResponse.json(
        {
          message: "Validation error",
          errors: fieldErrors,
        },
        { status: 400 },
      );
    }

    // Handle Prisma errors
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        {
          message: "Email address is already in use",
          field: "email",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ message: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
