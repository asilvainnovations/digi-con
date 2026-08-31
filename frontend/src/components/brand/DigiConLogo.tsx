import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function DigiConMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="DigiCon logo"
      className={cn("h-8 w-8", className)}
      data-testid="digicon-mark"
    >
      <defs>
        <linearGradient id="dc-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="45%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="19" fill="url(#dc-grad)" opacity="0.16" />
      <circle cx="24" cy="24" r="19" fill="none" stroke="url(#dc-grad)" strokeWidth="2.2" />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <circle
            key={deg}
            cx={24 + Math.cos(rad) * 19}
            cy={24 + Math.sin(rad) * 19}
            r="3.4"
            fill="url(#dc-grad)"
          />
        );
      })}
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fontFamily="Montserrat, sans-serif"
        fontWeight="800"
        fontSize="19"
        fill="url(#dc-grad)"
      >
        D
      </text>
    </svg>
  );
}

export function DigiConLogo({
  to = "/",
  compact = false,
  className,
}: {
  to?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn("flex items-center gap-2.5 transition-opacity hover:opacity-85", className)}
      data-testid="digicon-logo-link"
    >
      <DigiConMark />
      {!compact && (
        <span className="font-heading text-xl font-extrabold tracking-tight text-foreground">
          Digi<span className="text-sky">Con</span>
        </span>
      )}
    </Link>
  );
}
