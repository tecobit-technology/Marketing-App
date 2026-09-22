"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, useSession } from "next-auth/react";
import { FAQItem } from "@/components/ui/FAQAccordion";

const demoFaqs: FAQItem[] = [
  {
    question: "How long does the demo take?",
    answer:
      "Our demos are designed to be concise and focused — typically lasting about 30 minutes. We respect your time and cover only what matters most to your practice.",
  },
  {
    question: "Is the demo free?",
    answer:
      "Yes, absolutely. There is no cost or obligation. It is simply a chance for you to see how mysaas works for your clinic.",
  },
  {
    question: "Do I need to prepare anything beforehand?",
    answer:
      "No preparation is needed. We will tailor the walkthrough to your practice, but you are welcome to jot down any specific questions you have in advance.",
  },
  {
    question: "Can other members of my team join the call?",
    answer:
      "Of course. We encourage key stakeholders to attend so everyone can see how the platform fits into your workflow.",
  },
];

const whyBookItems = [
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
          stroke="#0D7A97"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="7"
          r="4"
          stroke="#0D7A97"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Tailored to Your Clinic",
    description:
      "We walk through the modules most relevant to your practice.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          stroke="#0D7A97"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Ask Anything",
    description:
      "Get direct answers from a product specialist, live.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#0D7A97"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="12 6 12 12 16 14"
          stroke="#0D7A97"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Just 30 Minutes",
    description:
      "A focused session that respects your schedule.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6-8 10-8 10z"
          stroke="#0D7A97"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="9 12 11 14 15 10"
          stroke="#0D7A97"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "No Pressure",
    description:
      "See the platform with zero obligation to buy.",
  },
];

const whatToExpectSteps = [
  {
    number: 1,
    title: "Book a Time",
    description:
      "Pick a slot that works for you — no back-and-forth emails.",
  },
  {
    number: 2,
    title: "Live Walkthrough",
    description:
      "A 30-minute session focused on your clinic's workflow.",
  },
  {
    number: 3,
    title: "Tailored Recommendation",
    description:
      "Leave with a clear picture of the right plan for your practice.",
  },
];

const testimonials = [
  {
    stars: 5,
    quote:
      "Check-in used to take five minutes per patient. Now it takes thirty seconds.",
    name: "Dr. Anjali Shrestha",
    role: "Owner, SmileCare Clinic",
  },
  {
    stars: 5,
    quote:
      "Check-in used to take five minutes per patient. Now it takes thirty seconds.",
    name: "Dr. Anjali Shrestha",
    role: "Owner, SmileCare Clinic",
  },
];

const PENDING_DEMO_KEY = "pending-demo-request";

type DemoFormData = {
  name: string;
  email: string;
  company: string;
  phone: string;
  clinicSize: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
};

const EMPTY_DEMO_FORM: DemoFormData = {
  name: "",
  email: "",
  company: "",
  phone: "",
  clinicSize: "",
  preferredDate: "",
  preferredTime: "",
  notes: "",
};

export default function DemoPageContent() {
  const router = useRouter();

  const { data: session, status: sessionStatus } = useSession();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(
    null
  );

  const [formData, setFormData] =
    useState<DemoFormData>(EMPTY_DEMO_FORM);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      return;
    }

    const storedDemo =
      sessionStorage.getItem(PENDING_DEMO_KEY);

    let pendingForm: Partial<DemoFormData> = {};

    if (storedDemo) {
      try {
        pendingForm = JSON.parse(storedDemo);
      } catch {
        sessionStorage.removeItem(PENDING_DEMO_KEY);
      }
    }

    setFormData((current) => ({
      ...current,
      ...pendingForm,
      name:
        pendingForm.name ||
        session.user?.name ||
        current.name ||
        "",
      email:
        pendingForm.email ||
        session.user?.email ||
        current.email ||
        "",
    }));
  }, [
    sessionStatus,
    session?.user?.name,
    session?.user?.email,
  ]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const currentSession = await getSession();

      /*
       * USER IS NOT LOGGED IN
       *
       * Save the form temporarily and send them to login.
       */
      if (!currentSession?.user) {
        sessionStorage.setItem(
          PENDING_DEMO_KEY,
          JSON.stringify(formData)
        );

        router.push("/login?callbackUrl=/demo");
        return;
      }

      /*
       * USER IS LOGGED IN
       *
       * Submit the request.
       */
      const response = await fetch(
        "/api/platform-admin/demos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to submit demo request."
        );
      }

      sessionStorage.removeItem(PENDING_DEMO_KEY);

      setMessage(
        data.message ||
          "Demo request submitted successfully."
      );

      setFormData({
        ...EMPTY_DEMO_FORM,
        name: currentSession.user.name || "",
        email: currentSession.user.email || "",
      });
    } catch (err) {
      console.error("Demo request error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-secondary-100">
      {/* Page Title */}
      <section className="px-6 pt-10 pb-4">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-xl font-medium text-primary-500">
            Demo
          </h1>
        </div>
      </section>

      {/* Hero Section */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-20">
            {/* Left Content */}
            <div className="flex-1">
              <h2 className="mb-5 text-[38px] font-extrabold leading-[118%] text-text-heading">
                See mysaas in Action
              </h2>

              <p className="mb-8 max-w-[480px] text-base leading-[150%] text-text-body">
                Book a 30-minute walkthrough with our team.
                We&apos;ll show you exactly how mysaas fits your
                clinic — no generic pitch, just your workflow.
              </p>

              <ul className="flex flex-col gap-5">
                <li className="flex items-center gap-3">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 4.5L6.75 12.75L3 9"
                      stroke="#0D7A97"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span className="text-sm leading-[140%] text-text-body">
                    Personalized walkthrough of your use case
                  </span>
                </li>

                <li className="flex items-center gap-3">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 4.5L6.75 12.75L3 9"
                      stroke="#0D7A97"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span className="text-sm leading-[140%] text-text-body">
                    Live Q&amp;A with a product specialist
                  </span>
                </li>

                <li className="flex items-center gap-3">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 4.5L6.75 12.75L3 9"
                      stroke="#0D7A97"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span className="text-sm leading-[140%] text-text-body">
                    No obligation, no pressure
                  </span>
                </li>
              </ul>
            </div>

            {/* Right Form Card */}
            <div className="w-full max-w-[440px] rounded-2xl border border-neutral-200 bg-white p-8">
              <h3 className="mb-6 text-lg font-bold text-text-heading">
                Schedule Your Demo
              </h3>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="name"
                    className="text-[13px] font-semibold text-text-heading"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Dr. Jane Smith"
                    required
                    className="rounded-lg border border-neutral-200 bg-secondary-100 px-3.5 py-3 text-sm text-text-heading placeholder:text-text-disabled outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Work Email */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="text-[13px] font-semibold text-text-heading"
                  >
                    Work Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@brightside.com"
                    required
                    className="rounded-lg border border-neutral-200 bg-secondary-100 px-3.5 py-3 text-sm text-text-heading placeholder:text-text-disabled outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Clinic Name */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="company"
                    className="text-[13px] font-semibold text-text-heading"
                  >
                    Clinic Name
                  </label>

                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Brightside Dental"
                    required
                    className="rounded-lg border border-neutral-200 bg-secondary-100 px-3.5 py-3 text-sm text-text-heading placeholder:text-text-disabled outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="phone"
                    className="text-[13px] font-semibold text-text-heading"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    required
                    className="rounded-lg border border-neutral-200 bg-secondary-100 px-3.5 py-3 text-sm text-text-heading placeholder:text-text-disabled outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Clinic Size */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="clinicSize"
                    className="text-[13px] font-semibold text-text-heading"
                  >
                    Clinic Size
                  </label>

                  <input
                    id="clinicSize"
                    name="clinicSize"
                    type="text"
                    value={formData.clinicSize}
                    onChange={handleChange}
                    placeholder="1 location · 2-5 locations · 6+ locations"
                    required
                    className="rounded-lg border border-neutral-200 bg-secondary-100 px-3.5 py-3 text-sm text-text-heading placeholder:text-text-disabled outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Preferred Date */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="preferredDate"
                    className="text-[13px] font-semibold text-text-heading"
                  >
                    Preferred Date
                  </label>

                  <input
                    id="preferredDate"
                    name="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    min={new Date()
                      .toISOString()
                      .split("T")[0]}
                    required
                    className="rounded-lg border border-neutral-200 bg-secondary-100 px-3.5 py-3 text-sm text-text-heading outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Preferred Time */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="preferredTime"
                    className="text-[13px] font-semibold text-text-heading"
                  >
                    Preferred Time
                  </label>

                  <input
                    id="preferredTime"
                    name="preferredTime"
                    type="time"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    required
                    className="rounded-lg border border-neutral-200 bg-secondary-100 px-3.5 py-3 text-sm text-text-heading outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                {/* Success */}
                {message && (
                  <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600">
                    {message}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-lg bg-primary-500 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Submitting..."
                    : "Schedule Demo"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Why Book a Demo */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-text-heading">
            Why Book a Demo
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyBookItems.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-2.5 rounded-[14px] border border-neutral-200 bg-white p-[22px_20px]"
              >
                <div className="mb-1">{item.icon}</div>

                <h3 className="text-sm font-semibold text-text-heading">
                  {item.title}
                </h3>

                <p className="text-[13px] leading-[145%] text-text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-text-heading">
            What to Expect
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {whatToExpectSteps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col items-start gap-2"
              >
                <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">
                  {step.number}
                </div>

                <h3 className="text-sm font-semibold text-text-heading">
                  {step.title}
                </h3>

                <p className="text-[13px] leading-[145%] text-text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Clinics Say After Their Demo */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-text-heading">
            What Clinics Say After Their Demo
          </h2>

          <div className="mx-auto grid max-w-[860px] grid-cols-1 gap-5 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="flex gap-0.5">
                  {Array.from({
                    length: testimonial.stars,
                  }).map((_, i) => (
                    <svg
                      key={i}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="#F04E28"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 1l2.2 4.5 5 .7-3.6 3.5.85 4.95L8 12.25 3.55 14.65l.85-4.95L.8 6.2l5-.7L8 1z" />
                    </svg>
                  ))}
                </div>

                <p className="text-sm leading-[150%] text-text-body">
                  {testimonial.quote}
                </p>

                <div className="mt-1 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                        stroke="#8E95B0"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <circle
                        cx="12"
                        cy="7"
                        r="4"
                        stroke="#8E95B0"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-text-heading">
                      {testimonial.name}
                    </p>

                    <p className="text-xs text-text-muted">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-text-heading">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {demoFaqs.map((item, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div
                  key={item.question}
                  className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaqIndex(
                        isOpen ? null : index
                      )
                    }
                    className="flex w-full items-center justify-between px-5 py-[18px] text-left text-sm text-text-heading transition-colors hover:text-primary-600"
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>

                    <span
                      className={`ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-lg font-light transition-transform duration-300 ${
                        isOpen
                          ? "rotate-45 bg-primary-100 text-primary-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      +
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-neutral-100 px-5 py-4 text-sm leading-relaxed text-text-muted">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}