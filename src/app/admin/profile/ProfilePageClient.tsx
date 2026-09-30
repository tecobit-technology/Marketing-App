"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, UserRound, UserRoundCog } from "lucide-react";

interface ProfilePageClientProps {
  session: {
    user: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      role?: string | null;
      clinicId?: string | null;
    };
  };
}

function formatRole(role?: string | null) {
  if (!role) return "User";

  return role
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(name?: string | null) {
  if (!name) return "U";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function ProfilePageClient({ session }: ProfilePageClientProps) {
  const user = session.user;
  const [name, setName] = useState(user.name ?? "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initials = useMemo(() => getInitials(user.name), [user.name]);
  const roleLabel = formatRole(user.role);

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Unable to update profile.");
      }

      setProfileMessage({ type: "success", text: "Profile updated successfully." });
    } catch (error) {
      setProfileMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to update profile.",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    try {
      const response = await fetch("/api/admin/profile/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Unable to change password.");
      }

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage({ type: "success", text: "Password updated successfully." });
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to change password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-default bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary text-xl font-bold text-white shadow-sm">
              {initials}
            </div>

            <div>
              <p className="text-2xl font-semibold text-text-heading">{user.name || "Clinic Admin"}</p>
              <p className="text-sm text-text-muted">{user.email || "No email available"}</p>
            </div>
          </div>

          <div className="inline-flex items-center rounded-full bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-primary">
            {roleLabel}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="rounded-2xl border border-border-default bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-text-heading">
              <UserRoundCog className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-heading">Account Summary</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border-default bg-slate-50 p-4">
              <div className="flex items-center gap-3 text-text-muted">
                <UserRound className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-[0.12em]">Full name</span>
              </div>
              <p className="mt-2 text-base font-semibold text-text-heading">{user.name || "Not provided"}</p>
            </div>

            <div className="rounded-xl border border-border-default bg-slate-50 p-4">
              <div className="flex items-center gap-3 text-text-muted">
                <Mail className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-[0.12em]">Email</span>
              </div>
              <p className="mt-2 text-base font-semibold text-text-heading">{user.email || "Not provided"}</p>
            </div>

            <div className="rounded-xl border border-border-default bg-slate-50 p-4">
              <div className="flex items-center gap-3 text-text-muted">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-[0.12em]">Role</span>
              </div>
              <p className="mt-2 text-base font-semibold text-text-heading">{roleLabel}</p>
            </div>

            <div className="rounded-xl border border-border-default bg-slate-50 p-4">
              <div className="flex items-center gap-3 text-text-muted">
                <UserRoundCog className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-[0.12em]">Clinic ID</span>
              </div>
              <p className="mt-2 break-all text-base font-semibold text-text-heading">
                {user.clinicId || "Not available"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border-default bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <UserRound className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-heading">Edit Profile</h2>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-heading">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-border-default bg-white px-4 py-3 text-sm text-text-heading outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  placeholder="Enter your full name"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading || !name.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {profileLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>

              {profileMessage && (
                <p
                  className={`text-sm ${
                    profileMessage.type === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {profileMessage.text}
                </p>
              )}
            </form>
          </div>

          <div className="rounded-2xl border border-border-default bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-heading">Change Password</h2>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-heading">Current password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                    }
                    className="w-full rounded-xl border border-border-default bg-white px-4 py-3 pr-12 text-sm text-text-heading outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted transition hover:text-text-heading"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-heading">New password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                    }
                    className="w-full rounded-xl border border-border-default bg-white px-4 py-3 pr-12 text-sm text-text-heading outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                    placeholder="Create a strong password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted transition hover:text-text-heading"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-heading">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                    }
                    className="w-full rounded-xl border border-border-default bg-white px-4 py-3 pr-12 text-sm text-text-heading outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                    placeholder="Confirm new password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted transition hover:text-text-heading"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  passwordLoading ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword
                }
                className="inline-flex items-center gap-2 rounded-xl border border-border-default bg-white px-4 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>

              {passwordMessage && (
                <p
                  className={`text-sm ${
                    passwordMessage.type === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {passwordMessage.text}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
