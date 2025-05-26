"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn as nextAuthSignIn, useSession } from "next-auth/react";
import { loginSchema, type LoginInput } from "@/lib/auth-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if the user just registered
  const registered = searchParams.get("registered");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Setup form validation with react-hook-form and Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  // Redirect authenticated users
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);
  // Don't render the login form for authenticated users
  if (status === "authenticated") {
    return null;
  }
  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    try {
      const result = await nextAuthSignIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (!result) {
        setError("root", { message: "Authentication failed. Please try again." });
        return;
      }

      if (result.error) {
        // Handle specific authentication errors
        if (result.error === "CredentialsSignin") {
          setError("root", { message: "Invalid email or password" });
        } else {
          setError("root", { message: "Authentication failed. Please try again." });
        }
        return;
      }

      // Successful login - force redirect using window.location
      console.log("Login successful, redirecting to:", callbackUrl);

      // Force a full page reload to ensure proper authentication state
      window.location.replace(callbackUrl);
    } catch (error) {
      console.error("Login error:", error);
      setError("root", { message: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {errors.root && (
              <Alert variant="destructive">
                <AlertDescription>{errors.root.message}</AlertDescription>
              </Alert>
            )}
            {registered && (
              <Alert>
                <AlertDescription>Registration successful! You can now log in.</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="name@example.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="text-primary hover:underline"
            >
              Register
            </a>
          </p>
        </CardFooter>
      </Card>{" "}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <p>Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
