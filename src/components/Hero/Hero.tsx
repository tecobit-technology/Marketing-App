import Link from 'next/link';
import DashboardPreview from '@/components/DashboardPreview/DashboardPreview';

export default function Hero() {
  return (
    <section className="bg-neutral-50 py-16 lg:py-[83px]">
      <div className="mx-auto grid max-w-[1340px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[minmax(0,1fr)_611px] lg:px-10">
        <div>
          <span className="inline-flex items-center rounded-pill bg-brand-tint px-4 py-1.5 text-xs font-semibold text-brand-primary">
            Cloud-Native · HIPAA-Ready
          </span>

          <h1 className="mt-7 max-w-[650px] text-4xl font-bold leading-tight text-text-heading lg:text-[51px]">
            The Modern Dental Practice
            <br />
            Management Platform
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted lg:text-lg">
            Everything your clinic needs — patient records, scheduling, clinical notes,
            staff management, and analytics — unified in one beautiful dashboard.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-md bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/demo"
              className="rounded-md border border-brand-primary bg-transparent px-5 py-2.5 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary/10 hover:text-brand-primary-hover"
            >
              Book a Demo
            </Link>
          </div>

          <p className="mt-6 text-[13px] text-text-muted">
            ✓ No credit card required &nbsp;&nbsp; ✓ 30-day free trial &nbsp;&nbsp; ✓ Cancel anytime
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
