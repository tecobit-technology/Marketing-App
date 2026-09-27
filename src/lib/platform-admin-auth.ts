import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const ADMIN_SESSION_MAX_AGE = 24 * 60 * 60;
const ADMIN_REMEMBER_ME_MAX_AGE = 30 * 24 * 60 * 60;

export const platformAdminAuthOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: ADMIN_SESSION_MAX_AGE,
  },

  secret:
    process.env.PLATFORM_ADMIN_NEXTAUTH_SECRET ||
    process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/platform-admin/login",
  },

  cookies: {
    sessionToken: {
      name: "mysaas-platform-admin.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },

    csrfToken: {
      name: "mysaas-platform-admin.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },

    callbackUrl: {
      name: "mysaas-platform-admin.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    CredentialsProvider({
      name: "Platform Admin",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
        rememberMe: {
          label: "Remember Me",
          type: "text",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;
        const rememberMe = credentials.rememberMe === "true";

        const adminEmail =
          process.env.PLATFORM_ADMIN_EMAIL?.toLowerCase().trim();

        const adminPassword = process.env.PLATFORM_ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          console.error(
            "Platform admin credentials are not configured.",
          );
          return null;
        }

        if (email !== adminEmail || password !== adminPassword) {
          return null;
        }

        return {
          id: "platform-admin",
          email: adminEmail,
          name: "Platform Admin",
          role: "platform_admin",
          platformRole: "super_admin",
          clinicId: null,
          rememberMe,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.platformRole = user.platformRole;
        token.clinicId = user.clinicId ?? null;

        const rememberMe = (
          user as {
            rememberMe?: boolean;
          }
        ).rememberMe;

        token.rememberMe = rememberMe;

        if (rememberMe) {
          token.exp =
            Math.floor(Date.now() / 1000) +
            ADMIN_REMEMBER_ME_MAX_AGE;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;

        session.user.platformRole = token.platformRole as
          | "super_admin"
          | "support"
          | undefined;

        session.user.clinicId = token.clinicId as
          | string
          | null;
      }

      return session;
    },
  },
};