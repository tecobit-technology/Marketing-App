import Link from 'next/link';

const features = [
  {
    emoji: '🦷',
    title: 'Patient Management',
    description:
      'Complete patient profiles with medical history, allergies, treatment records, documents, and X-rays — all in one place. Add family members, track referrals, and never lose a record.',
    checks: ['Smart patient search', 'Family linking', 'Document vault', 'X-ray uploads'],
    reverse: false,
    href: '/product/features/patient-management',
  },
  {
    emoji: '📅',
    title: 'Appointment & Queue Management',
    description:
      'Drag-and-drop scheduling, automated SMS/email reminders, waitlist management, and a live queue display for your reception — reducing no-shows by up to 40%.',
    checks: [
      'Drag-and-drop calendar',
      'Automated reminders',
      'Live queue board',
      'No-show tracking',
    ],
    reverse: true,
    href: '/product/features/appointment-management',
  },
  {
    emoji: '📋',
    title: 'Clinical Documentation',
    description:
      'Digital treatment planning, charting, and clinical notes. Create templates, track diagnoses, and send treatment plans directly to patients from within the system.',
    checks: [
      'Digital tooth charting',
      'Treatment plan builder',
      'Clinical note templates',
      'Patient-facing plans',
    ],
    reverse: false,
    href: '/product/features/clinical-documentation',
  },
];

export default function FeaturesList() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[1340px] px-6 lg:px-10">
        <h2 className="text-3xl font-bold text-text-heading lg:text-4xl">
          Powerful Features, Built for Dental Workflows
        </h2>

        <div className="mt-8 flex flex-col gap-16 lg:gap-[72px]">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-[600px_minmax(0,1fr)] lg:gap-[112px] ${feature.reverse
                ? 'lg:grid-cols-[minmax(0,1fr)_600px] lg:[&>*:first-child]:order-2'
                : ''
                }`}
            >
              <div className="flex h-[380px] w-full items-center justify-center rounded-2xl border border-border-default bg-neutral-100">
                <p className="text-center text-lg font-semibold text-[#b2bfcc]">
                  {feature.emoji} {feature.title}
                  <br />
                  Screen Preview
                </p>
              </div>

              <div>
                <h3 className="flex items-center gap-3 text-2xl font-bold text-text-heading lg:text-[28px]">
                  <span>{feature.emoji}</span>
                  {feature.title}
                </h3>
                <p className="mt-6 max-w-[540px] text-[15px] leading-6 text-text-muted">
                  {feature.description}
                </p>

                <ul className="mt-6 flex flex-col gap-3 text-sm text-text-heading">
                  {feature.checks.map((check) => (
                    <li key={check}><span className="text-brand-primary">✓</span> &nbsp;{check}</li>
                  ))}
                </ul>

                <Link
                  href={feature.href}
                  className="group mt-8 inline-block rounded-md bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-primary-hover hover:shadow-md"
                >
                  Learn More
                  <span className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
