import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import { loginSchema } from "@/lib/auth-validation";
import { ZodError } from "zod";
import { AuthError } from "next-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input using Zod schema
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    // Attempt to sign in using NextAuth
    const result = await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });

    // If we get here, the sign-in was successful
    return NextResponse.json({
      message: "Login successful",
      success: true,
    });
  } catch (error) {
    console.error("Login error:", error);

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

    // Handle NextAuth errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
        default:
          return NextResponse.json({ message: "Authentication failed" }, { status: 401 });
      }
    }

    // Handle other errors
    return NextResponse.json({ message: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
