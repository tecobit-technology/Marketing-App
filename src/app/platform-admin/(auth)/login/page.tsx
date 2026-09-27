"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function PlatformAdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      /*
       * Get the CSRF token from the Platform Admin
       * NextAuth endpoint, not the normal mySaaS endpoint.
       */
      const csrfResponse = await fetch(
        "/api/platform-admin/auth/csrf",
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!csrfResponse.ok) {
        throw new Error("Failed to initialize Platform Admin authentication.");
      }

      const csrfData = await csrfResponse.json();

      /*
       * Submit credentials directly to the Platform Admin
       * NextAuth credentials callback.
       */
      const body = new URLSearchParams({
        csrfToken: csrfData.csrfToken,
        email: email.trim().toLowerCase(),
        password,
        rememberMe: String(rememberMe),
        callbackUrl: "/platform-admin",
        json: "true",
      });

      const loginResponse = await fetch(
        "/api/platform-admin/auth/callback/credentials",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        },
      );

      /*
       * NextAuth normally redirects after a successful credentials
       * login. We only need to verify that the request succeeded.
       */
      if (
        !loginResponse.ok &&
        loginResponse.status !== 302 &&
        loginResponse.status !== 303
      ) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push("/platform-admin");
      router.refresh();
    } catch (error) {
      console.error("Platform admin login error:", error);

      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-page px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-border-default shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-12 w-12 rounded-lg bg-brand-logo flex items-center justify-center text-white font-bold text-xl">
                M
              </div>

              <div className="text-left">
                <h1 className="text-2xl font-bold text-text-heading">
                  mysaas
                </h1>

                <p className="text-xs text-text-muted">
                  Platform Admin
                </p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-text-heading">
              Sign in to Platform Admin
            </h2>

            <p className="text-sm text-text-muted mt-1">
              Manage your dental SaaS platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-heading mb-1.5"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-md border border-border-default px-3 py-2 text-sm text-text-heading placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                placeholder="admin@mysaas.com"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-heading mb-1.5"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-md border border-border-default px-3 py-2 text-sm text-text-heading placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  className="h-4 w-4 rounded border-border-default text-brand-primary focus:ring-brand-primary"
                  disabled={loading}
                />

                <span className="text-sm text-text-body">
                  Remember me
                </span>
              </label>

              <Link
                href="/platform-admin/forgot-password"
                className="text-sm text-brand-primary hover:text-brand-primary-hover"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2"
              >
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary-hover shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-default" />
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-text-muted">
                Or
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/admin"
              className="text-sm text-text-muted hover:text-brand-primary transition-colors"
            >
              ← Back to Clinic Admin
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          © 2026 mysaas. All rights reserved.
        </p>
      </div>
    </div>
  );
}