import Link from 'next/link';

const tabs = [
  { label: 'Appointment Workspace', href: '/product/features/appointment-management' },
  { label: 'Queue Board', href: '/product/features/queue-management' },
  { label: 'Clinical Encounter', href: '/product/features/clinical-documentation' },
  { label: 'Patient Registry', href: '/product/features/patient-management' },
];

export default function ProductPreview() {
  return (
    <section className="bg-neutral-50 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-neutral-800 lg:text-4xl">
            See the Platform in Action
          </h2>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-6 border-b border-neutral-200">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className="pb-3 text-sm font-medium text-neutral-500 transition-colors hover:border-b-2 hover:border-brand-primary hover:text-brand-primary"
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="flex h-96 items-center justify-center rounded-2xl bg-white shadow-sm">
          <span className="text-sm text-neutral-400">
            {tabs[0].label} screenshot
          </span>
        </div>

        <div className="mt-8 text-center">
          <a
            href="#gallery"
            className="text-sm font-medium text-primary-500 hover:text-primary-600"
          >
            View Full Screenshot Gallery →
          </a>
        </div>
      </div>
    </section>
  );
}