import Link from "next/link";

const tabs = [
  {
    label: "Appointment Workspace",
    href: "/product/features/appointment-management",
  },
  { label: "Queue Board", href: "/product/features/queue-management" },
  {
    label: "Clinical Encounter",
    href: "/product/features/clinical-documentation",
  },
  { label: "Patient Registry", href: "/product/features/patient-management" },
];

export default function ProductPreview() {
  return (
    <section className="bg-neutral-50 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-neutral-800 lg:text-4xl">
            See the Platform in Action
          </h2>

          <p className="mx-auto max-w-2xl text-base leading-7 text-neutral-500">
            Explore the tools that help your dental practice manage patients,
            appointments, clinical workflows, and daily operations.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-6 border-b border-neutral-200">
          {tabs.map((tab, index) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                index === 0
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-neutral-500 hover:border-brand-primary hover:text-brand-primary"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
          <img
            src="/images/appointments.png"
            alt="mySaaS Appointment Workspace"
            className="block h-auto w-full"
          />
        </div>

        <div className="mt-8 text-center">
          <a
            href="#gallery"
            className="text-sm font-medium text-brand-primary transition-colors hover:text-brand-primary-hover"
          >
            View Full Screenshot Gallery →
          </a>
        </div>
      </div>
    </section>
  );
}