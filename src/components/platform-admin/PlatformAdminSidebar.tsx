"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  ShoppingBag,
  CalendarCheck,
  UserPlus,
  Contact,
  Building2,
  CreditCard,
  DollarSign,
  Package,
  Settings,
  ChevronDown,
  Menu,
  X,
  HelpCircle,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/platform-admin",
    icon: LayoutDashboard,
  },
  {
    name: "Sales",
    href: "#",
    icon: ShoppingBag,
    children: [
      {
        name: "Demo Requests",
        href: "/platform-admin/demos",
        icon: CalendarCheck,
      },
      {
        name: "Leads",
        href: "/platform-admin/leads",
        icon: UserPlus,
      },
      {
        name: "Contacts",
        href: "/platform-admin/contacts",
        icon: Contact,
      },
    ],
  },
  {
    name: "Clinics",
    href: "/platform-admin/clinics",
    icon: Building2,
  },
  {
    name: "Subscriptions",
    href: "/platform-admin/subscriptions",
    icon: CreditCard,
  },
  {
    name: "Payments",
    href: "/platform-admin/payments",
    icon: DollarSign,
  },
  {
    name: "Plans",
    href: "/platform-admin/plans",
    icon: Package,
  },
  {
    name: "Settings",
    href: "/platform-admin/settings",
    icon: Settings,
  },
];

export default function PlatformAdminSidebar() {
  const pathname = usePathname();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["Sales"]),
  );

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }

      return newSet;
    });
  };

  const isActive = (href: string) => {
    if (href === "#") return false;

    return pathname === href;
  };

  const isSectionActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (!item.children) return false;

    return item.children.some((child) => pathname === child.href);
  };

 const handleLogout = async () => {
  try {
    setLoggingOut(true);

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
      throw new Error("Failed to initialize logout.");
    }

    const csrfData = await csrfResponse.json();

    const body = new URLSearchParams({
      csrfToken: csrfData.csrfToken,
      callbackUrl: "/platform-admin/login",
      json: "true",
    });

    const logoutResponse = await fetch(
      "/api/platform-admin/auth/signout",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );

    if (!logoutResponse.ok) {
      throw new Error("Platform Admin logout failed.");
    }

    window.location.href = "/platform-admin/login";
  } catch (error) {
    console.error("Logout error:", error);
    setLoggingOut(false);
    setShowLogoutModal(false);
  }
};

  return (
    <>
      {/* Mobile Trigger */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-border-default bg-white text-text-heading shadow-sm transition hover:bg-neutral-50 md:hidden"
        aria-label="Toggle navigation"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-border-default bg-bg-sidebar transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[72px] items-center border-b border-border-default px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-sm font-bold text-white shadow-sm">
              M
            </div>

            <div className="leading-none">
              <p className="text-[15px] font-semibold tracking-tight text-text-heading">
                mysaas
              </p>

              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">
                Platform Admin
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {/* Overview */}
          <div className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Overview
            </p>

            <ul className="space-y-1">
              {NAV_ITEMS.filter((item) => item.name === "Dashboard").map(
                (item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`group flex h-10 items-center rounded-xl px-3 text-sm font-medium transition-all ${
                          active
                            ? "bg-brand-primary text-white shadow-sm"
                            : "text-text-body hover:bg-neutral-100 hover:text-text-heading"
                        }`}
                      >
                        <Icon
                          size={18}
                          strokeWidth={active ? 2.2 : 1.9}
                          className="mr-3 shrink-0"
                        />

                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                },
              )}
            </ul>
          </div>

          {/* Management */}
          <div className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Management
            </p>

            <ul className="space-y-1">
              {NAV_ITEMS.filter(
                (item) =>
                  item.name !== "Dashboard" &&
                  item.name !== "Payments" &&
                  item.name !== "Plans" &&
                  item.name !== "Settings",
              ).map((item) => {
                const Icon = item.icon;

                if (item.children) {
                  const isExpanded = expandedSections.has(item.name);
                  const sectionActive = isSectionActive(item);

                  return (
                    <li key={item.name}>
                      <button
                        type="button"
                        onClick={() => toggleSection(item.name)}
                        className={`group flex h-10 w-full items-center justify-between rounded-xl px-3 text-sm font-medium transition-all ${
                          sectionActive
                            ? "bg-neutral-100 text-text-heading"
                            : "text-text-body hover:bg-neutral-100 hover:text-text-heading"
                        }`}
                      >
                        <span className="flex items-center">
                          <Icon
                            size={18}
                            strokeWidth={sectionActive ? 2.2 : 1.9}
                            className={`mr-3 shrink-0 ${
                              sectionActive
                                ? "text-brand-primary"
                                : "text-text-muted"
                            }`}
                          />

                          <span>{item.name}</span>
                        </span>

                        <ChevronDown
                          size={15}
                          strokeWidth={2}
                          className={`text-text-muted transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`grid transition-all duration-200 ${
                          isExpanded
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <ul className="relative ml-[22px] mt-1 space-y-1 border-l border-border-default pl-3">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              const active = isActive(child.href);

                              return (
                                <li key={child.name}>
                                  <Link
                                    href={child.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`group flex h-9 items-center rounded-lg px-3 text-[13px] font-medium transition-all ${
                                      active
                                        ? "bg-brand-primary text-white shadow-sm"
                                        : "text-text-muted hover:bg-neutral-100 hover:text-text-heading"
                                    }`}
                                  >
                                    <ChildIcon
                                      size={15}
                                      strokeWidth={active ? 2.2 : 1.8}
                                      className="mr-2.5 shrink-0"
                                    />

                                    <span>{child.name}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`group flex h-10 items-center rounded-xl px-3 text-sm font-medium transition-all ${
                        isActive(item.href)
                          ? "bg-brand-primary text-white shadow-sm"
                          : "text-text-body hover:bg-neutral-100 hover:text-text-heading"
                      }`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={isActive(item.href) ? 2.2 : 1.9}
                        className="mr-3 shrink-0"
                      />

                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Finance */}
          <div className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Finance
            </p>

            <ul className="space-y-1">
              {NAV_ITEMS.filter(
                (item) => item.name === "Payments" || item.name === "Plans",
              ).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`group flex h-10 items-center rounded-xl px-3 text-sm font-medium transition-all ${
                        active
                          ? "bg-brand-primary text-white shadow-sm"
                          : "text-text-body hover:bg-neutral-100 hover:text-text-heading"
                      }`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={active ? 2.2 : 1.9}
                        className="mr-3 shrink-0"
                      />

                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* System */}
          <div>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              System
            </p>

            <ul className="space-y-1">
              {NAV_ITEMS.filter((item) => item.name === "Settings").map(
                (item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`group flex h-10 items-center rounded-xl px-3 text-sm font-medium transition-all ${
                          active
                            ? "bg-brand-primary text-white shadow-sm"
                            : "text-text-body hover:bg-neutral-100 hover:text-text-heading"
                        }`}
                      >
                        <Icon
                          size={18}
                          strokeWidth={active ? 2.2 : 1.9}
                          className="mr-3 shrink-0"
                        />

                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                },
              )}
            </ul>
          </div>
        </nav>

        {/* Bottom Area */}
        <div className="border-t border-border-default p-3">
          {/* Help */}
          <Link
            href="/platform-admin/help"
            onClick={() => setIsMobileOpen(false)}
            className="mb-2 flex h-9 items-center rounded-lg px-3 text-[13px] font-medium text-text-muted transition-colors hover:bg-neutral-100 hover:text-text-heading"
          >
            <HelpCircle size={16} className="mr-3" strokeWidth={1.9} />
            Help & Support
          </Link>

          {/* Admin Profile */}
          <div className="flex items-center rounded-xl border border-border-default bg-white p-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-xs font-bold text-white">
              PA
            </div>

            <div className="ml-3 min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-text-heading">
                Platform Admin
              </p>

              <p className="mt-0.5 truncate text-[11px] text-text-muted">
                admin@mysaas.com
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="ml-2 flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-neutral-100 hover:text-text-heading"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={15} strokeWidth={1.9} />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
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
