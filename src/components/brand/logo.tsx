import type { SVGProps } from "react";

interface LogoMarkProps extends Omit<SVGProps<SVGSVGElement>, "role"> {
  size?: number;
}

/**
 * ProofFolio AI mark: a monoline "P" (portfolio) inside a bordered frame,
 * with a teal proof/check badge standing in for "AI proposes, you validate."
 */
export function LogoMark({ size = 28, className, ...props }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="9"
        fill="currentColor"
        fillOpacity={0.06}
        stroke="currentColor"
        strokeOpacity={0.55}
        strokeWidth={1.5}
      />
      <path
        d="M12 9.5V22.5M12 9.5H17.4C19.8853 9.5 21.9 11.32 21.9 13.5C21.9 15.68 19.8853 17.5 17.4 17.5H12"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="23" cy="23" r="6.25" style={{ fill: "var(--pf-teal)" }} />
      <path
        d="M20.1 23.05L22.05 25L25.75 20.9"
        stroke="#04101f"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoWordmark({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label="ProofFolio AI"
      className={`inline-flex items-center gap-2.5 ${className ?? ""}`}
    >
      <LogoMark size={size + 8} aria-hidden="true" />
      <span
        className="inline-flex items-baseline gap-1.5 font-black leading-none tracking-tight"
        style={{ fontSize: size }}
        aria-hidden="true"
      >
        <span>ProofFolio</span>
        <span
          className="rounded-full border px-1.5 py-0.5 font-black uppercase leading-none"
          style={{
            fontSize: "0.5em",
            letterSpacing: "0.16em",
            borderColor: "var(--line)",
            color: "var(--pf-blue)",
          }}
        >
          AI
        </span>
      </span>
    </span>
  );
}

export function Logo({
  variant = "wordmark",
  size = 20,
  className,
}: {
  variant?: "wordmark" | "mark";
  size?: number;
  className?: string;
}) {
  if (variant === "mark") {
    return (
      <span role="img" aria-label="ProofFolio AI" className={className}>
        <LogoMark size={size} aria-hidden="true" />
      </span>
    );
  }
  return <LogoWordmark size={size} className={className} />;
}
