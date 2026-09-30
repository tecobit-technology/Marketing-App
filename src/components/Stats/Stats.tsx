"use client";

const clinics = [
  "EverSmile Dental",
  "PearlCare Dental",
  "BrightDent Clinic",
  "SmilePoint Dental",
  "OralCare Plus",
  "Prime Dental Care",
  "WhiteOak Dental",
  "DentalNest",
];

export default function Stats() {
  return (
    <section className="overflow-hidden border-y border-border-default bg-brand-primary text-white py-[38px]">
      <div className="mx-auto flex max-w-[1340px] items-center gap-10 px-6 lg:px-10">
        <p className="shrink-0 whitespace-nowrap text-lg font-semibold text-white">
          Trusted by 500+ dental clinics across South Asia
        </p>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee items-center gap-x-14">
            {[...clinics, ...clinics].map((clinic, index) => (
              <p
                key={`${clinic}-${index}`}
                className="shrink-0 whitespace-nowrap text-sm font-semibold text-white"
              >
                {clinic}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}