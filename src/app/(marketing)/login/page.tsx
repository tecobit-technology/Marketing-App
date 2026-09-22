"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Mail, LockKeyhole } from "lucide-react";

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
        d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.92-4.18 2.92-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.75 9.75 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.85A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.85V7.63H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.37l3.24-2.52Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.12c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.83 3.2 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.38l3.24 2.52C7.31 7.84 9.46 6.12 12 6.12Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const msg = result.error.includes("Too many")
          ? result.error
          : "Invalid email or password.";

        setError(msg);
        return;
      }

      const session = await getSession();

      // ================================================
      // PATIENT
      // ================================================

      if (session?.user.role === "patient") {
        router.push("/portal");
        router.refresh();
        return;
      }

      // ================================================
      // PLATFORM ADMIN
      // ================================================

      if (session?.user.role === "platform_admin") {
        router.push("/platform-admin");
        router.refresh();
        return;
      }

      // ================================================
      // NORMAL CUSTOMER / CLINIC USER
      // ================================================
      // MVP flow: normal users go to Demo first.

      router.push("/demo");
      router.refresh();
    } catch (error) {
      console.error("LOGIN_ERROR:", error);

      setError(
        "Something went wrong while signing in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setIsGoogleLoading(true);

    try {
      await signIn("google", {
        callbackUrl: "/demo",
      });
    } catch (error) {
      console.error("GOOGLE_LOGIN_ERROR:", error);

      setError(
        "Unable to continue with Google. Please try again.",
      );

      setIsGoogleLoading(false);
    }
  }

  const busy = isSubmitting || isGoogleLoading;

  return (
    <main className="min-h-screen bg-secondary-100 px-6 py-20">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-heading">
            Sign In
          </h1>

          <p className="mt-2 text-sm text-text-muted">
            Sign in to continue to your account
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-border-default bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-text-heading"
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={busy}
                  className="w-full rounded-lg border border-border-default py-2.5 pl-11 pr-4 text-sm text-text-heading placeholder:text-text-disabled focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
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
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={busy}
                  className="w-full rounded-lg border border-border-default py-2.5 pl-11 pr-12 text-sm text-text-heading placeholder:text-text-disabled focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {/* Show / Hide Password */}
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  disabled={busy}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted transition-colors hover:text-text-heading disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {/* Forgot Password */}
              <div className="mt-1.5 flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-brand-primary transition-colors hover:text-brand-primary-hover"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border-default" />

            <span className="text-xs font-medium text-text-muted">
              OR
            </span>

            <div className="h-px flex-1 bg-border-default" />
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border-default bg-white px-4 py-2.5 text-sm font-semibold text-text-heading transition-colors hover:bg-secondary-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-primary" />
                Connecting to Google...
              </>
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          {/* Signup */}
          <div className="mt-6 border-t border-border-default pt-6 text-center text-sm">
            <p className="text-text-muted">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-brand-primary transition-colors hover:text-brand-primary-hover"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Legal */}
        <p className="mt-6 text-center text-xs text-text-muted">
          By signing in, you agree to our{" "}
          <Link
            href="/terms"
            className="text-brand-primary hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-brand-primary hover:underline"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </main>
  );
}