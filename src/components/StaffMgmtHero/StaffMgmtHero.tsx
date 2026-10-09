import Link from "next/link";
import Image from "next/image";
const tabs = [
  { label: "Patient Management", href: "/product/features/patient-management" },
  { label: "Appointments", href: "/product/features/appointment-management" },
  { label: "Queue", href: "/product/features/queue-management" },
  { label: "Clinical Docs", href: "/product/features/clinical-documentation" },
  { label: "Treatment Plans", href: "/product/features/treatment-planning" },
  { label: "Staff", href: "/product/features/staff-management", active: true },
  { label: "Reports", href: "/product/features/reports-analytics" },
  { label: "Multi-Clinic", href: "/product/features/multi-clinic-management" },
  { label: "Security", href: "/product/features/security" },
];

export default function StaffMgmtHero() {
  return (
    <section className="bg-secondary-100 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-8 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-700">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/product" className="hover:text-neutral-700">
            Product
          </Link>
          <span className="mx-2">/</span>
          <Link href="/product/features" className="hover:text-neutral-700">
            Features
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-700">Staff Management</span>
        </nav>

        <div className="mb-12 flex flex-wrap gap-6 border-b border-neutral-200">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`pb-3 text-sm font-medium transition-colors ${
                tab.active
                  ? "border-b-2 border-brand-primary text-brand-primary"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-start gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-xl flex-col items-start gap-6">
            <h1 className="text-4xl font-bold leading-tight text-neutral-900 lg:text-5xl">
              Every Team Member, Every Permission, Under Control
            </h1>
            <p className="text-lg text-neutral-500">
              Define roles, assign access, and manage your clinic staff —
              whether you have one location or twenty.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/demo"
                className="rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover"
              >
                Book Demo
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          {/* Right - Staff Management Screenshot */}
          <div className="w-full min-w-0 lg:max-w-xl">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
              {/* Browser Header */}
              <div className="flex h-12 items-center gap-3 border-b border-neutral-200 bg-[#f5f5f5] px-4">
                <div className="flex shrink-0 items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>

                <div className="flex h-7 min-w-0 flex-1 items-center justify-center rounded-md border border-neutral-200 bg-white px-3 text-xs text-neutral-500">
                  <span className="truncate">app.saasdental.com/staff</span>
                </div>

                <span className="shrink-0 text-sm text-neutral-500">•••</span>
              </div>

              {/* Screenshot */}
              <Image
                src="/images/staff.png"
                alt="SaaS Dental staff management dashboard"
                width={1200}
                height={800}
                priority
                sizes="(max-width: 1024px) 100vw, 600px"
                className="block h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
