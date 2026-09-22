"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/verify-signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to verify your email.",
        );
        return;
      }

      router.push("/login?verified=true");
    } catch {
      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold">
            Verify your email
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            We sent a 6-digit verification code to
          </p>

          <p className="mt-1 font-medium">
            {email}
          </p>
        </div>

        <form
          onSubmit={handleVerify}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="otp"
              className="mb-2 block text-sm font-medium"
            >
              Verification code
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6),
                )
              }
              placeholder="000000"
              className="w-full rounded-xl border px-4 py-3 text-center text-2xl tracking-[0.5em]"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-4 py-3 font-medium disabled:opacity-50"
          >
            {loading
              ? "Verifying..."
              : "Verify email"}
          </button>
        </form>
      </div>
    </main>
  );
}