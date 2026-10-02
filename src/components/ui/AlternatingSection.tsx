import Image from 'next/image';

interface Section {
  title: string;
  description: string;
  bullets: string[];
  image: string;
  reversed: boolean;
}

interface AlternatingSectionProps {
  sections: Section[];
}

export default function AlternatingSection({
  sections,
}: AlternatingSectionProps) {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        {sections.map((section) => (
          <div
            key={section.title}
            className={`flex flex-col items-center gap-12 py-16 lg:flex-row ${
              section.reversed ? 'lg:flex-row-reverse' : ''
            }`}
          >
            {/* Browser Screenshot */}
            <div className="flex w-full flex-1 items-center justify-center">
              <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
                
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
                  <div className="shrink-0 text-sm text-neutral-500">
                    •••
                  </div>
                </div>

                {/* Actual Screenshot */}
                <div className="relative w-full bg-white">
                  <Image
                    src={section.image}
                    alt={section.title}
                    width={1200}
                    height={800}
                    sizes="(max-width: 1024px) 100vw, 576px"
                    className="block h-auto w-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex w-full flex-1 flex-col items-start gap-6">
              <h3 className="text-2xl font-bold text-text-heading">
                {section.title}
              </h3>

              <p className="text-base leading-relaxed text-text-muted">
                {section.description}
              </p>

              <ul className="space-y-2">
                {section.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center gap-2 text-sm text-text-body"
                  >
                    <span className="text-brand-primary">✓</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}