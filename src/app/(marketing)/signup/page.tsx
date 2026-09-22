"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Building2,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import { z } from "zod";

const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),

    clinicName: z
      .string()
      .trim()
      .min(2, "Clinic name must be at least 2 characters")
      .max(150, "Clinic name is too long"),

    email: z
      .string()
      .trim()
      .email("Enter a valid email"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /[A-Z]/,
        "Password must contain at least one uppercase letter",
      )
      .regex(
        /[a-z]/,
        "Password must contain at least one lowercase letter",
      )
      .regex(
        /[0-9]/,
        "Password must contain at least one number",
      )
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one symbol",
      ),

    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );

type FormData = z.infer<typeof signupSchema>;

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c7 0 10 8 10 8a18.2 18.2 0 0 1-3 4.4" />
      <path d="M6.6 6.6C3.7 8.5 2 12 2 12s3 8 10 8a9.8 9.8 0 0 0 3.4-.6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M11.5 3.5L5.5 10L2.5 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.79-.07-1.55-.2-2.28H12v4.32h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.43Z"
      />
      <path
        fill="#34A853"
        d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.6Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.69A5.84 5.84 0 0 1 6.23 12c0-.59.1-1.16.31-1.69V7.78H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.22l3.24-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.28c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.36 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 8 9.46 6.28 12 6.28Z"
      />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    name: "",
    clinicName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      // -----------------------------------------------
      // Client-side validation
      // -----------------------------------------------

      const parsed = signupSchema.safeParse(form);

      if (!parsed.success) {
        setError(
          parsed.error.issues[0]?.message ??
            "Please check your information.",
        );
        return;
      }

      // -----------------------------------------------
      // Create clinic + owner
      // -----------------------------------------------

      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsed.data),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ??
            "Unable to create your clinic account. Please try again.",
        );
        return;
      }

      // -----------------------------------------------
      // Automatically sign in
      // -----------------------------------------------

      const loginResult = await signIn(
        "credentials",
        {
          email: parsed.data.email,
          password: parsed.data.password,
          redirect: false,
        },
      );

      if (loginResult?.error) {
        router.push("/login");
        return;
      }

      // -----------------------------------------------
      // Owner dashboard
      // -----------------------------------------------

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("SIGNUP_ERROR:", error);

      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");
    setIsGoogleLoading(true);

    try {
      await signIn("google", {
        callbackUrl: "/demo",
      });
    } catch (error) {
      console.error("GOOGLE_SIGNUP_ERROR:", error);
      setError(
        "Unable to continue with Google. Please try again.",
      );
      setIsGoogleLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-secondary-100">
      {/* =================================================
          HERO / SIGNUP SECTION
      ================================================= */}

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-6xl">
          {/* Back */}
          <Link
            href="/"
            className="text-sm font-medium text-brand-primary hover:underline"
          >
            ← Back to Home
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:items-start">
            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div className="pt-4">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-primary">
                Free Trial
              </p>

              <h1 className="text-4xl font-extrabold leading-tight text-text-heading sm:text-5xl">
                Start Your Free Trial
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-text-body">
                Get 30 days of full access to your dental
                clinic management platform. No credit card
                required.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Full access to every module",
                  "Set up your clinic in minutes",
                  "Add dentists, managers, and receptionists",
                  "Manage patients and appointments",
                  "No credit card required",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-brand-primary">
                      <CheckIcon />
                    </span>

                    <span className="text-sm text-text-body">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Trial information */}
              <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6">
                <p className="text-sm font-semibold text-text-heading">
                  What happens after signup?
                </p>

                <div className="mt-4 space-y-3 text-sm text-text-body">
                  <p>
                    <span className="font-semibold">
                      1.
                    </span>{" "}
                    Your clinic is created.
                  </p>

                  <p>
                    <span className="font-semibold">
                      2.
                    </span>{" "}
                    You become the clinic owner.
                  </p>

                  <p>
                    <span className="font-semibold">
                      3.
                    </span>{" "}
                    You are automatically signed in.
                  </p>

                  <p>
                    <span className="font-semibold">
                      4.
                    </span>{" "}
                    You can start managing your clinic.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT SIDE - FORM
            ================================================= */}

            <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-text-heading">
                Create Your Clinic Account
              </h2>

              <p className="mt-2 text-sm text-text-muted">
                You will become the owner of this clinic.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5"
              >
                {/* =================================================
                    OWNER NAME
                ================================================= */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-text-heading"
                  >
                    Owner Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      strokeWidth={1.8}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                      aria-hidden="true"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Dr. Jane Smith"
                      autoComplete="name"
                      disabled={isSubmitting || isGoogleLoading}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm text-text-heading outline-none transition placeholder:text-text-disabled focus:border-brand-primary focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* =================================================
                    CLINIC NAME
                ================================================= */}

                <div>
                  <label
                    htmlFor="clinicName"
                    className="mb-1.5 block text-sm font-medium text-text-heading"
                  >
                    Clinic Name
                  </label>

                  <div className="relative">
                    <Building2
                      size={18}
                      strokeWidth={1.8}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                      aria-hidden="true"
                    />

                    <input
                      id="clinicName"
                      name="clinicName"
                      type="text"
                      value={form.clinicName}
                      onChange={handleChange}
                      placeholder="Smile Dental Clinic"
                      autoComplete="organization"
                      disabled={isSubmitting || isGoogleLoading}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm text-text-heading outline-none transition placeholder:text-text-disabled focus:border-brand-primary focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* =================================================
                    EMAIL
                ================================================= */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-text-heading"
                  >
                    Work Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      strokeWidth={1.8}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                      aria-hidden="true"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="owner@yourclinic.com"
                      autoComplete="email"
                      disabled={isSubmitting || isGoogleLoading}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm text-text-heading outline-none transition placeholder:text-text-disabled focus:border-brand-primary focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* =================================================
                    PASSWORD
                ================================================= */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium text-text-heading"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      strokeWidth={1.8}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                      aria-hidden="true"
                    />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      disabled={isSubmitting || isGoogleLoading}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-12 text-sm text-text-heading outline-none transition placeholder:text-text-disabled focus:border-brand-primary focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev,
                        )
                      }
                      disabled={
                        isSubmitting ||
                        isGoogleLoading
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted transition hover:text-text-heading disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <EyeIcon
                        open={showPassword}
                      />
                    </button>
                  </div>

                  <p className="mt-1.5 text-xs text-text-muted">
                    Minimum 8 characters with uppercase,
                    lowercase, number, and symbol.
                  </p>
                </div>

                {/* =================================================
                    CONFIRM PASSWORD
                ================================================= */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-sm font-medium text-text-heading"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      strokeWidth={1.8}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                      aria-hidden="true"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      disabled={isSubmitting || isGoogleLoading}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-12 text-sm text-text-heading outline-none transition placeholder:text-text-disabled focus:border-brand-primary focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev,
                        )
                      }
                      disabled={
                        isSubmitting ||
                        isGoogleLoading
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted transition hover:text-text-heading disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <EyeIcon
                        open={
                          showConfirmPassword
                        }
                      />
                    </button>
                  </div>
                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                  >
                    {error}
                  </div>
                )}

                {/* =================================================
                    SUBMIT
                ================================================= */}

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isGoogleLoading
                  }
                  className="w-full rounded-xl bg-brand-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Creating Clinic..."
                    : "Start Free Trial"}
                </button>
              </form>

              {/* =================================================
                  GOOGLE SIGN UP
              ================================================= */}

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-neutral-200" />

                <span className="text-xs font-medium text-text-muted">
                  OR
                </span>

                <div className="h-px flex-1 bg-neutral-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={
                  isSubmitting ||
                  isGoogleLoading
                }
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-6 py-3.5 text-sm font-semibold text-text-heading transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <GoogleIcon />

                {isGoogleLoading
                  ? "Connecting to Google..."
                  : "Continue with Google"}
              </button>

              <p className="mt-5 text-center text-xs text-text-muted">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-brand-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
