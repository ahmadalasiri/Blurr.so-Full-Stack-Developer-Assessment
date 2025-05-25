import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
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
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email as string)) {
          throw new Error("Invalid email format");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: (credentials.email as string).toLowerCase(),
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(credentials.password as string, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
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
      console.log(`User ${user.email} signed in`);
    },
  },
  debug: process.env.NODE_ENV === "development",
});
