import React from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
}

export default function StatusBadge({
  status,
  variant,
}: StatusBadgeProps) {
  let mappedVariant = variant;

  if (!mappedVariant) {
    const s = status.toLowerCase().trim();

    // Green
    if (
      s.includes("paid") ||
      s.includes("completed") ||
      s.includes("in room") ||
      s.includes("confirmed") ||
      s.includes("active")
    ) {
      mappedVariant = "success";
    }

    // Yellow
    else if (
      s.includes("pending") ||
      s.includes("waiting") ||
      s.includes("outstanding") ||
      s.includes("requested")
    ) {
      mappedVariant = "warning";
    }

    // Red
    else if (
      s.includes("cancelled") ||
      s.includes("canceled") ||
      s.includes("no show") ||
      s.includes("overdue") ||
      s.includes("inactive")
    ) {
      mappedVariant = "error";
    }

    // Blue
    else if (
      s.includes("scheduled") ||
      s.includes("contacted")
    ) {
      mappedVariant = "info";
    }

    // Gray
    else {
      mappedVariant = "neutral";
    }
  }

  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap";

  const variantStyles: Record<BadgeVariant, string> = {
    success: "bg-success-100 text-success-500",
    warning: "bg-warning-100 text-warning-500",
    error: "bg-error-100 text-error-500",
    info: "bg-info-100 text-info-500",
    neutral: "bg-neutral-100 text-text-body",
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[mappedVariant]}`}
    >
      {status}
    </span>
  );
}