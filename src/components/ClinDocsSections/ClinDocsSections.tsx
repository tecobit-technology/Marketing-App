import Image from "next/image";
const sections = [
  {
    title: "Encounter Workspace",
    description:
      "Stage-based workflow Subjective, Objective, Assessment, Plan guiding clinical input at every stage.",
    bullets: [
      "Stage-based workflow",
      "Guided clinical input",
      "Structured note format",
    ],
    image: "/images/clinical-docs.png",
    browserPath: "/clinical docs/workspace",
    reversed: false,
  },
  {
    title: "Diagnoses & Findings",
    description:
      "Standardized diagnosis codes and clinical findings linked directly to teeth, with severity and status tracking.",
    bullets: [
      "Standardized diagnosis codes",
      "Tooth-linked findings",
      "Severity & status tracking",
    ],
    image: "/images/clinical-docs.png",
    browserPath: "/clinical docs/diagnoses-findings",
    reversed: true,
  },
  {
    title: "Procedure Recording",
    description:
      "Log procedures performed, link them to the treatment plan, and record materials used.",
    bullets: [
      "Procedure logging",
      "Treatment plan linking",
      "Materials tracking",
    ],
    image: "/images/clinical-docs.png",
    browserPath: "/clinical docs/procedure-recording",
    reversed: false,
  },
];

export default function ClinDocsSections() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        {sections.map((section) => (
          <div
            key={section.title}
            className={`flex flex-col items-center gap-14 py-16 lg:flex-row ${
              section.reversed ? "lg:flex-row-reverse" : ""
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
                      {`app.saasdental.com${section.browserPath ?? "/dashboard"}`}
                    </span>
                  </div>

                  {/* Browser Menu */}
                  <div className="shrink-0 text-sm text-neutral-500">•••</div>
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

            {/* Text Content */}
            <div className="flex flex-1 flex-col items-start gap-4">
              <h3 className="text-2xl font-bold text-neutral-900">
                {section.title}
              </h3>
              <p className="text-base leading-relaxed text-neutral-500">
                {section.description}
              </p>
              <ul className="space-y-2">
                {section.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center gap-2 text-sm text-neutral-700"
                  >
                    <span className="text-primary-600">✓</span>
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
