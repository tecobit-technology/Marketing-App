"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const tabs = [
  {
    label: "Appointment Workspace",
    href: "/product/features/appointment-management",
    image: "/images/appointments.png",
    description: "Manage appointments, schedules, and your daily calendar.",
  },
  {
    label: "Queue Board",
    href: "/product/features/queue-management",
    image: "/images/queue.png",
    description: "Track waiting patients and manage the live clinic queue.",
  },
  {
    label: "Clinical Encounter",
    href: "/product/features/clinical-documentation",
    image: "/images/documents.png",
    description: "Access treatment plans, clinical notes, and patient records.",
  },
  {
    label: "Patient Registry",
    href: "/product/features/patient-management",
    image: "/images/patients.png",
    description: "Keep patient profiles and medical histories organized.",
  },
];

const INTERVAL = 4000;

export default function ProductPreview() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = () => {
    setActive((current) => (current + 1) % tabs.length);
  };

  const previous = () => {
    setActive((current) => (current - 1 + tabs.length) % tabs.length);
  };

  useEffect(() => {
    if (paused) return;

    const timer = setInterval(() => {
      setActive((current) => (current + 1) % tabs.length);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [paused]);

  const current = tabs[active];

  return (
    <section className="overflow-hidden bg-neutral-50 px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-flex rounded-full bg-brand-tint px-4 py-1.5 text-xs font-semibold text-brand-primary">
            Explore mySaaS Dental
          </span>

          <h2 className="text-3xl font-bold text-neutral-800 lg:text-4xl">
            See the Platform in Action
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
            Discover a smarter way to manage your dental practice, from patient
            records to everyday clinical workflows.
          </p>
        </div>

        {/* Carousel */}
        <div className="group">
          {/* Tabs */}
          <div className="mb-8 overflow-x-auto">
            <div className="mx-auto flex w-max min-w-full justify-start gap-2 border-b border-neutral-200 sm:w-fit sm:min-w-0 sm:justify-center">
              {tabs.map((tab, index) => (
                <button
                  key={tab.label}
                  type="button"
                  aria-pressed={active === index}
                  onClick={() => setActive(index)}
                  className={`relative whitespace-nowrap px-4 py-4 text-sm font-semibold transition-colors duration-300 ${
                    active === index
                      ? "text-brand-primary"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {tab.label}
                  {active === index && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Image frame */}
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-neutral-200/50">
            {/* Browser header */}
            <div className="flex h-12 items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>

              <span className="hidden text-xs text-neutral-400 sm:block">
                mySaaS Dental / {current.label}
              </span>

              <span className="rounded-md border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600">
                Product Preview
              </span>
            </div>

            {/* Carousel viewport */}
            <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden bg-neutral-100 p-3 sm:min-h-[400px] sm:p-6 lg:min-h-[560px] lg:p-8">
              {tabs.map((tab, index) => (
                <div
                  key={tab.image}
                  aria-hidden={active !== index}
                  className={`absolute inset-3 flex items-center justify-center transition-all duration-700 ease-in-out sm:inset-6 lg:inset-8 ${
                    active === index
                      ? "translate-x-0 scale-100 opacity-100"
                      : index === (active + 1) % tabs.length
                        ? "translate-x-8 scale-[0.98] opacity-0"
                        : "-translate-x-8 scale-[0.98] opacity-0"
                  }`}
                >
                  <div className="relative w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-md">
                    <Image
                      src={tab.image}
                      alt={tab.label}
                      width={1440}
                      height={900}
                      priority={index === 0}
                      className={`h-auto w-full object-contain ${
                        active === index ? "animate-product-zoom" : ""
                      }`}
                    />
                  </div>
                </div>
              ))}

              {/* Previous */}
              <button
                type="button"
                onClick={previous}
                aria-label="Previous screenshot"
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-700 shadow-md transition-all hover:scale-110 hover:bg-white sm:left-5 sm:h-12 sm:w-12"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path
                    d="m15 18-6-6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Next */}
              <button
                type="button"
                onClick={next}
                aria-label="Next screenshot"
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-700 shadow-md transition-all hover:scale-110 hover:bg-white sm:right-5 sm:h-12 sm:w-12"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path
                    d="m9 18 6-6-6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full bg-neutral-100">
              <div
                key={`${active}-${paused}`}
                className={`h-full rounded-r-full bg-brand-primary ${
                  paused
                    ? ""
                    : "animate-[carousel-progress_4000ms_linear_forwards]"
                }`}
                style={{
                  width: paused ? "0%" : undefined,
                }}
              />
            </div>
          </div>

          {/* Details and navigation */}
          <div className="mt-7 flex flex-col items-center justify-between gap-5 sm:flex-row">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-neutral-800">
                {current.label}
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                {current.description}
              </p>
            </div>

            <Link
              href={current.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-primary-hover hover:shadow-md"
            >
              Explore Feature
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Dots and pause */}
          <div className="mt-7 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              {tabs.map((tab, index) => (
                <button
                  key={tab.label}
                  type="button"
                  aria-label={`Show ${tab.label}`}
                  aria-current={active === index ? "true" : undefined}
                  onClick={() => setActive(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    active === index
                      ? "w-8 bg-brand-primary"
                      : "w-2 bg-neutral-300 hover:bg-neutral-500"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? "Resume carousel" : "Pause carousel"}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-100"
            >
              {paused ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M7 5h4v14H7zm6 0h4v14h-4z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes carousel-progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .group * {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}
