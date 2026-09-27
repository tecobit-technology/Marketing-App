"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  ChevronDown,
  LogOut,
  UserCircle,
} from "lucide-react";

import { ChevronDownIcon } from "@/components/ui/icons";

const products = [
  { label: "Overview", href: "/product" },
  { label: "Features", href: "/product/features" },
];

const solutions = [
  { label: "Single Clinic", href: "/solutions/single" },
  { label: "Multi-Clinic", href: "/solutions/multi" },
  { label: "Practice Managers", href: "/solutions/practice-managers" },
  { label: "Clinic Owners", href: "/solutions/clinic-owners" },
];

const resources = [
  { label: "Blog", href: "/blog" },
  { label: "Documentation", href: "/docs" },
  { label: "FAQ", href: "/faq" },
  { label: "Help Center", href: "/help" },
];

function Dropdown({
  label,
  items,
}: {
  label: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="flex items-center gap-1 transition-colors hover:text-brand-primary"
      >
        {label}
        <ChevronDownIcon className="h-3.5 w-3.5 text-current" />
      </button>

      <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
        <div className="w-64 rounded-lg border border-border-default bg-white p-2 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block rounded-md px-3 py-2 transition-colors hover:bg-brand-tint"
            >
              <span className="text-sm font-medium text-text-heading">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

type UserProfileProps = {
  onLogoutRequest: () => void;
};

function UserProfile({ onLogoutRequest }: UserProfileProps) {
  const { data: session, status } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="hidden h-10 w-28 animate-pulse rounded-lg bg-neutral-100 md:block" />
    );
  }

  if (!session?.user) {
    return (
      <>
        <Link
          href="/login"
          className="hidden rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-heading transition-colors hover:bg-neutral-50 md:inline-flex"
        >
          Login
        </Link>

        <Link
          href="/signup"
          className="hidden rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover md:inline-flex"
        >
          Sign Up
        </Link>
      </>
    );
  }

  const displayName = session.user.name || "User";
  const email = session.user.email || "";

  const initial = (
    displayName.charAt(0) ||
    email.charAt(0) ||
    "U"
  ).toUpperCase();

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setProfileOpen((open) => !open)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-neutral-50"
        aria-expanded={profileOpen}
        aria-haspopup="menu"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
          {initial}
        </div>

        <div className="max-w-[130px] text-left">
          <p className="truncate text-sm font-semibold text-text-heading">
            {displayName}
          </p>

          <p className="truncate text-xs text-text-body">
            {email}
          </p>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-text-body transition-transform ${
            profileOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {profileOpen && (
        <div
          className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-border-default bg-white shadow-lg"
          role="menu"
        >
          <div className="border-b border-neutral-100 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                {initial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-heading">
                  {displayName}
                </p>

                <p className="truncate text-xs text-text-body">
                  {email}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <Link
              href="/demo"
              onClick={() => setProfileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-body transition-colors hover:bg-neutral-100"
              role="menuitem"
            >
              <UserCircle className="h-4 w-4" />
              My Account
            </Link>

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                onLogoutRequest();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { data: session, status } = useSession();

  const displayName = session?.user?.name || "User";
  const email = session?.user?.email || "";

  const initial = (
    displayName.charAt(0) ||
    email.charAt(0) ||
    "U"
  ).toUpperCase();

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

  const handleLogoutRequest = () => {
    setShowLogoutModal(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border-default bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link
            href="/"
            className="text-xl font-bold text-brand-primary"
          >
            mysaas
          </Link>

          <nav className="hidden items-center gap-[31px] text-sm text-text-heading md:flex">
            <Dropdown label="Product" items={products} />

            <Dropdown label="Solutions" items={solutions} />

            <Link
              href="/product/pricing"
              className="transition-colors hover:text-brand-primary"
            >
              Pricing
            </Link>

            <Dropdown label="Resources" items={resources} />

            <Link
              href="/company"
              className="transition-colors hover:text-brand-primary"
            >
              Company
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <UserProfile onLogoutRequest={handleLogoutRequest} />

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-text-heading transition-colors hover:bg-neutral-100 md:hidden"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
              onClick={() =>
                setMobileMenuOpen((open) => !open)
              }
            >
              {mobileMenuOpen ? (
                <span aria-hidden="true">✕</span>
              ) : (
                <span aria-hidden="true">☰</span>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border-default bg-white md:hidden">
            <div className="mx-auto max-w-7xl space-y-4 px-6 py-5">
              <div className="space-y-2">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 text-left text-sm font-medium text-text-heading transition-colors hover:bg-neutral-100"
                  onClick={() =>
                    setMobileProductsOpen((open) => !open)
                  }
                >
                  <span>Product</span>
                  <span className="text-xs">
                    {mobileProductsOpen ? "−" : "+"}
                  </span>
                </button>

                {mobileProductsOpen && (
                  <div className="space-y-1 rounded-xl bg-white p-2">
                    {products.map((product) => (
                      <Link
                        key={product.label}
                        href={product.href}
                        className="block rounded-lg px-4 py-2 text-sm text-text-heading transition-colors hover:bg-neutral-100"
                      >
                        {product.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 text-left text-sm font-medium text-text-heading transition-colors hover:bg-neutral-100"
                  onClick={() =>
                    setMobileSolutionsOpen((open) => !open)
                  }
                >
                  <span>Solutions</span>
                  <span className="text-xs">
                    {mobileSolutionsOpen ? "−" : "+"}
                  </span>
                </button>

                {mobileSolutionsOpen && (
                  <div className="space-y-1 rounded-xl bg-white p-2">
                    {solutions.map((solution) => (
                      <Link
                        key={solution.label}
                        href={solution.href}
                        className="block rounded-lg px-4 py-2 text-sm text-text-heading transition-colors hover:bg-neutral-100"
                      >
                        {solution.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 text-left text-sm font-medium text-text-heading transition-colors hover:bg-neutral-100"
                  onClick={() =>
                    setMobileResourcesOpen((open) => !open)
                  }
                >
                  <span>Resources</span>
                  <span className="text-xs">
                    {mobileResourcesOpen ? "−" : "+"}
                  </span>
                </button>

                {mobileResourcesOpen && (
                  <div className="space-y-1 rounded-xl bg-white p-2">
                    {resources.map((resource) => (
                      <Link
                        key={resource.label}
                        href={resource.href}
                        className="block rounded-lg px-4 py-2 text-sm text-text-heading transition-colors hover:bg-neutral-100"
                      >
                        {resource.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1 border-t border-neutral-200 pt-4">
                <Link
                  href="/product/pricing"
                  className="block rounded-xl px-4 py-3 text-sm text-text-heading transition-colors hover:bg-neutral-100"
                >
                  Pricing
                </Link>

                <Link
                  href="/company"
                  className="block rounded-xl px-4 py-3 text-sm text-text-heading transition-colors hover:bg-neutral-100"
                >
                  Company
                </Link>
              </div>

              <div className="border-t border-neutral-200 pt-4">
                {status === "loading" ? (
                  <div className="h-12 animate-pulse rounded-xl bg-neutral-100" />
                ) : session?.user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                        {initial}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-heading">
                          {displayName}
                        </p>

                        <p className="truncate text-xs text-text-body">
                          {email}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/demo"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-text-heading transition-colors hover:bg-neutral-100"
                    >
                      <UserCircle className="h-4 w-4" />
                      My Account
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogoutRequest();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      className="rounded-lg border border-border-default px-4 py-3 text-center text-sm font-medium text-text-heading transition-colors hover:bg-neutral-50"
                    >
                      Login
                    </Link>

                    <Link
                      href="/signup"
                      className="rounded-lg bg-brand-primary px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !loggingOut
            ) {
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