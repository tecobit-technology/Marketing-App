
"use client";

const clinics = [
  "SmileCare",
  "TrueSmile",
  "PearlDent",
  "ClearBite",
  "OralHealth Pro",
  "DentalAxis",
  "BrightClinic",
  "SmileHub",
  "PerfectSmile",
  "DentalCare",
  "WhitePearl",
  "HappyTeeth",
];

export default function Stats() {
  return (
    <section className="overflow-hidden border-y border-border-default bg-brand-primary py-[38px]">
      <div className="mx-auto max-w-[1340px] px-6 lg:px-10">
        {/* Heading */}
        <p className="text-center uppercase text-lg font-medium text-white">
          Trusted by 500+ dental clinics across South Asia
        </p>

        {/* Moving clinic names */}
        <div className="stats-marquee relative mt-7 overflow-hidden">
          {/* Left fade */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 from-white to-transparent" />

          {/* Right fade */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 from-white to-transparent" />

          <div className="flex w-max animate-clinic-marquee [animation-play-state:running] [.stats-marquee:hover_&]:[animation-play-state:paused]">
            {/* First copy */}
            <div className="flex shrink-0 items-center gap-x-12">
              {clinics.map((clinic) => (
                <p
                  key={`first-${clinic}`}
                  className="whitespace-nowrap text-lg font-semibold text-neutral-300"
                >
                  {clinic}
                </p>
              ))}
            </div>

            {/* Second copy */}
            <div className="flex shrink-0 items-center gap-x-12">
              {clinics.map((clinic) => (
                <p
                  key={`second-${clinic}`}
                  className="whitespace-nowrap text-lg font-semibold text-neutral-300"
                >
                  {clinic}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

