
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";

export default function AdminHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logoutDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showLogoutModal) return;

    logoutDialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        setShowLogoutModal(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = logoutDialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showLogoutModal]);

  const getPageTitle = () => {
    if (pathname === "/admin") {
      return "Dashboard";
    }

    const segment = pathname.split("/").filter(Boolean).pop();

    if (segment) {
      return segment
        .split("-")
        .map(
          (word) =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
    }

    return "Admin Panel";
  };

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "No email";
  const userRole = session?.user?.role || "User";

  const roleLabel =
    userRole.charAt(0).toUpperCase() + userRole.slice(1);

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((name) => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      await signOut({
        callbackUrl: "/login",
      });
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-border-default bg-white px-4 md:px-8">
      {/* Page Title */}
      <div className="flex flex-1 items-center gap-4">
        <h1 className="pl-12 text-xl font-semibold text-text-heading md:pl-0">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-neutral-100 hover:text-text-heading focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
          aria-label="Notifications"
        >
          <Bell size={19} strokeWidth={2} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-accent ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-border-default sm:block" />

        {/* Profile */}
        {status === "loading" ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-neutral-200" />

            <div className="hidden space-y-1 sm:block">
              <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
              <div className="h-2.5 w-16 animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setIsProfileOpen((current) => !current)
              }
              className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
              aria-expanded={isProfileOpen}
              aria-haspopup="menu"
            >
              {/* Avatar */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white shadow-sm">
                {initials || "U"}
              </div>

              {/* User Info */}
              <div className="hidden min-w-0 text-left sm:block">
                <p className="max-w-32 truncate text-sm font-semibold text-text-heading">
                  {userName}
                </p>

                <p className="text-[11px] text-text-muted">
                  {roleLabel}
                </p>
              </div>

              <ChevronDown
                size={16}
                className={`hidden text-text-muted transition-transform sm:block ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {isProfileOpen && (
              <>
                {/* Click outside */}
                <button
                  type="button"
                  aria-label="Close profile menu"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setIsProfileOpen(false)}
                />

                <div
                  className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-xl border border-border-default bg-white shadow-xl"
                  role="menu"
                >
                  {/* User Information */}
                  <div className="border-b border-border-default bg-neutral-50 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">
                        {initials || "U"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-heading">
                          {userName}
                        </p>

                        <p className="truncate text-xs text-text-muted">
                          {userEmail}
                        </p>

                        <span className="mt-1 inline-flex rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-medium text-brand-primary">
                          {roleLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <Link
                      href="/admin/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-body transition-colors hover:bg-neutral-100 hover:text-text-heading"
                      role="menuitem"
                    >
                      <UserRound
                        size={17}
                        className="text-text-muted"
                      />

                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/admin/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-body transition-colors hover:bg-neutral-100 hover:text-text-heading"
                      role="menuitem"
                    >
                      <Settings
                        size={17}
                        className="text-text-muted"
                      />

                      <span>Settings</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-border-default p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      role="menuitem"
                    >
                      <LogOut size={17} />

                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isLoggingOut) {
              setShowLogoutModal(false);
            }
          }}
        >
          <div
            ref={logoutDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            aria-describedby="logout-modal-message"
            tabIndex={-1}
            className="w-full max-w-sm rounded-xl border border-border-default bg-white p-6 shadow-xl outline-none"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <LogOut size={22} className="text-red-600" />
              </div>

              <p
                id="logout-modal-title"
                className="mt-4 text-lg font-semibold text-text-heading"
              >
                Sign out?
              </p>

              <p
                id="logout-modal-message"
                className="mt-1.5 text-sm text-text-muted"
              >
                Are you sure you want to sign out of your account?
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="rounded-lg border border-border-default px-4 py-2.5 text-sm font-medium text-text-body transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={16} />

                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
