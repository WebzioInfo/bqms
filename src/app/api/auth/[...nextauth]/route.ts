import prisma from "@/lib/prisma";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";



export const authOptions: import("next-auth").NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user) {
          throw new Error("Invalid email or password.");
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("Account is temporarily locked due to multiple failed login attempts. Please try again later.");
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
        
        if (!isPasswordValid) {
          // Increment failed attempts
          const newFailedAttempts = user.failedLoginAttempts + 1;
          const lockedUntil = newFailedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // Lock for 15 minutes
          
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: newFailedAttempts, lockedUntil }
          });
          
          if (lockedUntil) {
            throw new Error("Account locked due to too many failed attempts.");
          }
          throw new Error("Invalid email or password.");
        }

        // Success - reset attempts and update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login" // Error code passed in query string as ?error=
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export async function GET(req: Request, props: { params: Promise<any> }) {
  const { params } = props;
  return handler(req, { params: await params });
}

export async function POST(req: Request, props: { params: Promise<any> }) {
  const { params } = props;
  return handler(req, { params: await params });
}
