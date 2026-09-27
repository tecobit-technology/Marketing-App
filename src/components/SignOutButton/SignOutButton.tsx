"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await signOut({
        callbackUrl: "/",
      });
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowLogoutModal(true)}
        className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-heading transition-colors hover:bg-neutral-100"
      >
        Sign out
      </button>

      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loggingOut) {
              setShowLogoutModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            className="w-full max-w-sm rounded-xl border border-border-default bg-white p-6 shadow-xl"
          >
            <div className="flex justify-center">
              <p
                id="logout-modal-title"
                className="text-center text-lg leading-6 text-text-heading"
              >
                Are you sure you want to logout?
              </p>
            </div>

            <div className="mt-6 flex justify-center gap-12">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="rounded-md border border-border-default px-4 py-2 text-sm font-medium text-text-body transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={16} />

                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}