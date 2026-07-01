import prisma from "@/lib/prisma";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";



export const authOptions: import("next-auth").NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.VERCEL === "1" || process.env.NODE_ENV === "production",
  adapter: PrismaAdapter(prisma) as import("next-auth/adapters").Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          });

          if (!user) {
            throw new Error("Invalid email or password.");
          }

          // Verify password using bcrypt
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          
          if (!isPasswordValid) {
            throw new Error("Invalid email or password.");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId
          };
        } catch (error: any) {
          console.error("Authentication Error:", error);
          if (error.message === "Invalid email or password.") {
            throw error;
          }
          throw new Error("An unexpected error occurred. Please try again later.");
        }
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
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string | null;
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
