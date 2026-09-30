"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  UserRoundCog,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Patients",
    href: "/admin/patients",
    icon: Users,
  },
  {
    name: "Schedule",
    href: "/admin/schedule",
    icon: CalendarDays,
  },
  {
    name: "Clinical",
    href: "/admin/clinical",
    icon: Stethoscope,
  },
  {
    name: "Staff",
    href: "/admin/staff",
    icon: UserRoundCog,
  },
  {
    name: "Billing",
    href: "/admin/billing",
    icon: CreditCard,
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userName = session?.user?.name || "Admin User";
  const userEmail = session?.user?.email || "admin@clinic.com";

  const initials = useMemo(() => {
    const name = userName.trim();

    if (!name) return "A";

    const parts = name.split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [userName]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed left-4 top-3 z-50 rounded-md border border-border-default bg-white p-2 text-text-muted shadow-sm md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle Navigation"
      >
        <Menu size={20} strokeWidth={2} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border-default bg-bg-sidebar transition-transform duration-200 ease-in-out md:static md:flex md:flex-col md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-lg md:shadow-none`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border-default bg-brand-logo px-6 text-white">
          <span className="text-xl font-bold tracking-tight">
            mysaas
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="flex flex-col gap-1.5 px-3">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-primary text-white shadow-sm"
                        : "text-text-body hover:bg-neutral-200 hover:text-text-heading"
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={2}
                      className="shrink-0"
                    />

                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="border-t border-border-default bg-white p-4 md:bg-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white shadow-sm opacity-90">
              {status === "loading" ? "..." : initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-heading">
                {status === "loading" ? "Loading..." : userName}
              </p>

              <p className="truncate text-[11px] text-text-muted">
                {status === "loading" ? "" : userEmail}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}