import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Define UserRole to match Prisma schema
const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
} as const;

type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Extend the built-in session types
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

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true, // Trust all hosts for deployment
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("Missing credentials");
            return null;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(credentials.email as string)) {
            console.error("Invalid email format");
            return null;
          }

          const user = await prisma.user.findUnique({
            where: {
              email: (credentials.email as string).toLowerCase(),
            },
          });

          if (!user || !user.password) {
            console.error("User not found or no password");
            return null;
          }

          const isPasswordValid = await compare(credentials.password as string, user.password);

          if (!isPasswordValid) {
            console.error("Invalid password");
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
            image: user.image,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      try {
        if (token.sub && session.user) {
          session.user.id = token.sub;
          session.user.role = token.role as UserRole;
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id;
          token.role = user.role;
        }
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl });

      // Always redirect to dashboard after successful login
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`;
      }

      // Handle relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Handle callback URLs on the same origin
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Default redirect to dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  events: {
    async signIn({ user }) {
      // Log successful sign-ins
      console.log(`User ${user.email} signed in successfully`);
    },
  },
  debug: process.env.NODE_ENV === "development",
});
