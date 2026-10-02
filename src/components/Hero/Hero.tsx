import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-neutral-50 py-16 lg:py-[83px]">
      <div className="mx-auto grid max-w-[1340px] grid-cols-1 items-center gap-14 px-6 lg:grid-cols-[minmax(0,1fr)_650px] lg:px-10">
        {/* Left Content */}
        <div className="relative z-10">
          <span className="inline-flex items-center rounded-full bg-brand-tint px-4 py-1.5 text-xs font-semibold text-brand-primary">
            Cloud-Native · HIPAA-Ready
          </span>

          <h1 className="mt-7 max-w-[650px] text-4xl font-bold leading-[1.08] tracking-tight text-text-heading lg:text-[51px]">
            The Modern Dental Practice
            <br />
            Management Platform
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted lg:text-lg">
            Everything your clinic needs — patient records, scheduling,
            clinical notes, staff management, and analytics — unified in one
            beautiful dashboard.
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
            ✓ No credit card required &nbsp;&nbsp; ✓ 30-day free trial
            &nbsp;&nbsp; ✓ Cancel anytime
          </p>
        </div>

        {/* Right Visual */}
        <div className="relative">
          {/* Unsplash Dental Clinic Image */}
          {/* <div className="relative h-[500px] w-full overflow-hidden rounded-[28px]">
            <Image
              src="https://plus.unsplash.com/premium_photo-1681967039743-37dc3a27f4ce?auto=format&fit=crop&w=1600&q=90"
              alt="Modern dental clinic"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 650px"
              className="object-cover"
            />

            
            <div className="absolute inset-0 bg-black/5" />
          </div> */}

          {/* Floating Mac Window */}
          <div className="hero-dashboard-float relative z-10 w-[110%] lg:-left-10">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.22)]">

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
                  app.saasdental.com
                </span>
              </div>

              {/* Browser Menu */}
              <div className="shrink-0 text-sm text-neutral-500">•••</div>
            </div>

              {/* Dashboard */}
              <div className="bg-white">
                <Image
                  src="/images/dashboard.png"
                  alt="SaaS Dental dashboard"
                  width={1440}
                  height={900}
                  priority
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>

            {/* Mac Bottom Shadow / Depth */}
            <div className="mx-auto h-2 w-[92%] rounded-b-full bg-neutral-300/60 blur-[2px]" />
          </div>
        </div>
      </div>

      {/* Space for Floating Dashboard */}
      <div className="h-14 lg:h-20" />
    </section>
  );
}