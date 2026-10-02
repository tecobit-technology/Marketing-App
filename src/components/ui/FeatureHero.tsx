import Link from "next/link";
import Image from "next/image";
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface FeatureHeroProps {
  breadcrumb: BreadcrumbItem[];
  activeTab: string;
  title: string;
  description: string;
  screenshotLabel: string;
}

const tabs = [
  { label: "Patient Management", href: "/product/features/patient-management" },
  { label: "Appointments", href: "/product/features/appointment-management" },
  { label: "Queue", href: "/product/features/queue-management" },
  { label: "Clinical Docs", href: "/product/features/clinical-documentation" },
  { label: "Treatment Plans", href: "/product/features/treatment-planning" },
  { label: "Staff", href: "/product/features/staff-management" },
  { label: "Reports", href: "/product/features/reports-analytics" },
  { label: "Multi-Clinic", href: "/product/features/multi-clinic-management" },
  { label: "Security", href: "/product/features/security" },
];

export default function FeatureHero({
  breadcrumb,
  activeTab,
  title,
  description,
  screenshotLabel,
}: FeatureHeroProps) {
  return (
    <section className="bg-secondary-100 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-8 text-sm text-text-muted">
          {breadcrumb.map((item, i) => (
            <span key={item.label}>
              {i > 0 && <span className="mx-2">/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-neutral-700">
                  {item.label}
                </Link>
              ) : (
                <span className="text-neutral-700">{item.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="mb-12 flex flex-wrap gap-6 border-b border-neutral-200">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`pb-3 text-sm font-medium transition-colors ${
                tab.href === activeTab
                  ? "border-b-2 border-brand-primary text-brand-primary"
                  : "text-text-muted hover:text-neutral-700"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-start gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-xl flex-col items-start gap-6">
            <h1 className="text-4xl font-bold leading-tight text-text-heading lg:text-5xl">
              {title}
            </h1>
            <p className="text-lg text-text-muted">{description}</p>
            <div className="flex items-center gap-4">
              <Link
                href="/demo"
                className="rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover"
              >
                Book Demo
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-text-heading transition-colors hover:bg-neutral-50"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-2xl">
            {/* macOS Browser Header */}
            <div className="flex h-12 items-center gap-3 border-b border-neutral-200 bg-[#f5f5f5] px-4">
              {/* Traffic Lights */}
              <div className="flex shrink-0 items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-[#e0443e] bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full border border-[#dea123] bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full border border-[#24a13c] bg-[#28c840]" />
              </div>

              {/* Browser Navigation */}
              <div className="flex items-center gap-3 text-neutral-500">
                <span className="text-lg leading-none">‹</span>
                <span className="text-lg leading-none">›</span>
              </div>

              {/* Address Bar */}
              <div className="flex h-7 min-w-0 flex-1 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-xs text-neutral-500">
                <svg
                  className="h-3 w-3 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                <span className="truncate">
                  app.saasdental.com/appointments
                </span>
              </div>

              {/* Browser Menu */}
              <div className="shrink-0 text-sm text-neutral-500">•••</div>
            </div>

            {/* Browser Content / Screenshot */}
            <div className="w-full bg-white">
              <Image
                src="/images/appointments.png"
                alt={screenshotLabel}
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
