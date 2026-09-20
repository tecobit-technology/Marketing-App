import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "./db";
import { Patient, User, PlatformAdmin } from "@/lib/models";
import { checkRateLimit } from "./rate-limit";

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// Session durations
const DEFAULT_SESSION_MAX_AGE = 24 * 60 * 60; // 1 day
const REMEMBER_ME_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: DEFAULT_SESSION_MAX_AGE,
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },

        loginType: {
          label: "Login Type",
          type: "text",
        },

        rememberMe: {
          label: "Remember Me",
          type: "text",
        },
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(
        credentials:
          | Record<"email" | "password" | "loginType" | "rememberMe", string>
          | undefined,
        _req: any,
      ): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();

        const loginType = credentials.loginType || "clinic";

        const rememberMe = credentials.rememberMe === "true";

        if (loginType !== "platform_admin" && loginType !== "clinic") {
          return null;
        }

        const rateLimit = checkRateLimit(
          `login:${email}`,
          MAX_LOGIN_ATTEMPTS,
          LOGIN_WINDOW_MS,
        );

        if (!rateLimit.allowed) {
          const minutes = Math.ceil(rateLimit.retryAfterMs / 60000);

          throw new Error(
            `Too many login attempts. Please try again in ${minutes} minute${
              minutes === 1 ? "" : "s"
            }.`,
          );
        }

        await connectToDatabase();
        // --------------------------------------------------
        // PLATFORM ADMIN
        // --------------------------------------------------
        if (loginType === "platform_admin") {
          const platformAdminEmail =
            process.env.PLATFORM_ADMIN_EMAIL?.toLowerCase().trim();

          const platformAdminPassword = process.env.PLATFORM_ADMIN_PASSWORD;

          if (
            email !== platformAdminEmail ||
            credentials.password !== platformAdminPassword
          ) {
            return null;
          }

          return {
            id: "platform-admin",
            email: platformAdminEmail,
            name: "Platform Admin",

            role: "platform_admin",

            platformRole: "super_admin",

            clinicId: null,

            rememberMe,

            passwordChangedAt: null,
          };
        }

        // --------------------------------------------------
        // CLINIC STAFF
        // --------------------------------------------------
        const user = await User.findOne({
          email,
        }).select("+passwordHash");

        if (user) {
          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash,
          );

          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,

            role: user.role,

            platformRole: undefined as string | undefined,

            clinicId: user.clinicId ? user.clinicId.toString() : null,

            rememberMe,

            passwordChangedAt: user.passwordChangedAt
              ? user.passwordChangedAt.getTime()
              : null,
          };
        }

        // --------------------------------------------------
        // PATIENT
        // --------------------------------------------------
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const patient: any = await Patient.findOne({
          email,
        });

        if (patient && patient.password) {
          const isValid = await bcrypt.compare(
            credentials.password,
            patient.password,
          );

          if (!isValid) {
            return null;
          }

          return {
            id: patient._id.toString(),
            email: patient.email,
            name: patient.fullName,

            role: "patient",

            platformRole: undefined as string | undefined,

            clinicId: patient.clinicId ? patient.clinicId.toString() : null,

            rememberMe,

            passwordChangedAt: patient.passwordChangedAt
              ? patient.passwordChangedAt.getTime()
              : null,
          };
        }

        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.clinicId = user.clinicId;
        token.platformRole = user.platformRole;
        token.passwordChangedAt = user.passwordChangedAt;

        token.rememberMe = (user as { rememberMe?: boolean }).rememberMe;
      }

      if (
        token.passwordChangedAt &&
        typeof token.iat === "number" &&
        token.iat * 1000 < (token.passwordChangedAt as number)
      ) {
        return {};
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;

        session.user.role = token.role as string;

        session.user.clinicId = token.clinicId as string | null;

        session.user.platformRole = token.platformRole as
          | "super_admin"
          | "support"
          | undefined;
      }

      return session;
    },
  },
};
