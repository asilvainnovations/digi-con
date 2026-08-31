import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Official DigiCon circular mark — the authoritative brand asset, never redrawn. */
export function DigiConMark({
  className,
  glow = false,
}: {
  className?: string;
  glow?: boolean;
}) {
  return (
    <img
      src="/icon-192.png"
      alt=""
      aria-hidden
      width={40}
      height={40}
      className={cn(
        "h-9 w-9 shrink-0 select-none",
        glow && "drop-shadow-[0_0_14px_rgba(56,189,248,0.45)]",
        className,
      )}
      data-testid="digicon-mark"
    />
  );
}

export function DigiConLogo({
  to = "/",
  compact = false,
  className,
  markClassName,
}: {
  to?: string;
  compact?: boolean;
  className?: string;
  markClassName?: string;
}) {
  return (
    <Link
      to={to}
      aria-label="DigiCon home"
      className={cn(
        "flex items-center gap-2.5 rounded-lg transition-opacity duration-200 hover:opacity-85",
        className,
      )}
      data-testid="digicon-logo-link"
    >
      <DigiConMark className={markClassName} />
      {!compact && (
        <span className="font-heading text-xl font-extrabold tracking-tight text-foreground">
          Digi<span className="text-sky">Con</span>
        </span>
      )}
    </Link>
  );
}
