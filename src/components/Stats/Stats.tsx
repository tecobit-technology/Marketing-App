const clinics = [
  'SmileCare',
  'TrueSmile',
  'PearlDent',
  'ClearBite',
  'OralHealth Pro',
  'DentalAxis',
  'BrightClinic',
];

export default function Stats() {
  return (
    <section className="border-y border-border-default bg-white py-[38px]">
      <div className="mx-auto flex max-w-[1340px] flex-col items-center justify-between gap-6 px-6 lg:flex-row lg:px-10">
        <p className="text-sm text-text-muted">Trusted by 500+ dental clinics across South Asia</p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm font-semibold text-neutral-400">
          {clinics.map((clinic) => (
            <p key={clinic}>{clinic}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
