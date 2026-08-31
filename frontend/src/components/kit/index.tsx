import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GlassPanel({
  children,
  className,
  testId,
}: {
  children: ReactNode;
  className?: string;
  testId?: string;
}) {
  return (
    <section className={cn("glass rounded-xl p-5", className)} data-testid={testId}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
  testId,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  testId?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3" data-testid={testId}>
      <div>
        {eyebrow && <p className="label-caps">{eyebrow}</p>}
        <h2 className="font-heading text-lg font-bold sm:text-xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  tone = "blue",
  testId,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "blue" | "gold" | "cyan" | "danger";
  testId: string;
}) {
  const tones: Record<string, string> = {
    blue: "text-sky",
    cyan: "text-accent",
    gold: "gold-text",
    danger: "text-destructive",
  };
  return (
    <div
      className="glass rounded-xl p-4 transition-transform duration-200 hover:-translate-y-0.5"
      data-testid={testId}
    >
      <p className="label-caps">{label}</p>
      <p className={cn("metric mt-1.5 text-2xl sm:text-3xl", tones[tone])}>{value}</p>
      {hint && <p className="dense mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const STATUS_TONES: Record<string, string> = {
  New: "bg-sky/15 text-sky border-sky/30",
  Connected: "bg-accent/15 text-accent border-accent/30",
  Qualified: "bg-primary/15 text-sky border-primary/30",
  "Follow Up": "bg-gold/15 text-gold border-gold/35",
  "In Progress": "bg-primary/20 text-sky border-primary/35",
  Active: "bg-accent/20 text-accent border-accent/35",
  Partner: "bg-gold/20 text-gold border-gold/40",
  Customer: "bg-accent/20 text-accent border-accent/40",
  Prospect: "bg-sky/15 text-sky border-sky/30",
  Opportunity: "bg-gold/20 text-gold border-gold/45",
  Dormant: "bg-muted text-muted-foreground border-border",
  Pending: "bg-sky/15 text-sky border-sky/30",
  Completed: "bg-accent/20 text-accent border-accent/35",
  Overdue: "bg-destructive/20 text-destructive border-destructive/40",
};

export function StatusBadge({ status, testId }: { status: string; testId?: string }) {
  return (
    <span
      className={cn(
        "dense inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_TONES[status] ?? "bg-muted text-muted-foreground border-border",
      )}
      data-testid={testId}
    >
      {status}
    </span>
  );
}

export function LoadingState({ label = "Loading…", testId }: { label?: string; testId?: string }) {
  return (
    <div
      className="glass-soft flex items-center justify-center gap-2.5 rounded-xl p-8 text-sm text-muted-foreground"
      data-testid={testId ?? "loading-state"}
    >
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

export function ErrorState({
  label = "We couldn't load this right now.",
  testId,
}: {
  label?: string;
  testId?: string;
}) {
  return (
    <div
      className="glass-soft flex items-start gap-3 rounded-xl border-destructive/30 p-5 text-sm"
      data-testid={testId ?? "error-state"}
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="dense mt-1 text-muted-foreground">
          Your data is safe — refresh the page or try again in a moment.
        </p>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  testId,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
  testId: string;
}) {
  return (
    <div className="glass-soft rounded-xl px-6 py-10 text-center" data-testid={testId}>
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sky">
        {icon ?? <Sparkles className="h-5 w-5" aria-hidden />}
      </div>
      <h3 className="font-heading text-base font-bold">{title}</h3>
      <p className="dense mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function PremiumBadge({ label = "Pro" }: { label?: string }) {
  return (
    <Badge
      variant="outline"
      className="metal-edge dense gap-1 text-[0.7rem] font-semibold text-gold"
      data-testid="premium-badge"
    >
      <Sparkles className="h-3 w-3" aria-hidden />
      {label}
    </Badge>
  );
}

export function UpgradeGate({
  feature,
  description,
  testId,
}: {
  feature: string;
  description: string;
  testId: string;
}) {
  return (
    <div className="metal-edge rounded-xl p-6 text-center sm:p-8" data-testid={testId}>
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-gold">
        <Lock className="h-5 w-5" aria-hidden />
      </div>
      <p className="label-caps">DigiCon Pro</p>
      <h3 className="font-heading mt-1 text-lg font-bold gold-text">{feature}</h3>
      <p className="dense mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link
          to="/pricing"
          className={cn(buttonVariants({ size: "sm" }), "bg-gold text-[#1a1200] hover:bg-gold-metal")}
          data-testid="upgrade-gate-cta"
        >
          Upgrade to Pro
        </Link>
        <Link
          to="/dashboard"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
          data-testid="upgrade-gate-back"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export function QuickAction({
  icon,
  label,
  onClick,
  to,
  testId,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  to?: string;
  testId: string;
}) {
  const inner = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-sky">
        {icon}
      </span>
      <span className="dense text-xs font-medium">{label}</span>
    </>
  );
  const base =
    "glass-soft flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-xl px-3 py-3 text-center transition-colors duration-200 hover:border-primary/40 hover:bg-primary/10";
  if (to) {
    return (
      <Link to={to} className={base} data-testid={testId}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={base} data-testid={testId}>
      {inner}
    </button>
  );
}

export function HealthBar({ value, testId }: { value: number; testId?: string }) {
  const tone = value >= 70 ? "bg-accent" : value >= 45 ? "bg-sky" : "bg-destructive";
  return (
    <div className="flex items-center gap-2" data-testid={testId}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-[width] duration-500", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="dense w-9 shrink-0 text-right text-xs text-muted-foreground">{value}%</span>
    </div>
  );
}

export function Avatar({
  name,
  url,
  size = "md",
  testId,
}: {
  name: string;
  url?: string;
  size?: "sm" | "md" | "lg";
  testId?: string;
}) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-11 w-11 text-sm", lg: "h-20 w-20 text-xl" };
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={cn("shrink-0 rounded-full border border-border object-cover", sizes[size])}
        data-testid={testId}
      />
    );
  }
  return (
    <span
      className={cn(
        "font-heading flex shrink-0 items-center justify-center rounded-full border border-sky/25 bg-primary/15 font-bold text-sky",
        sizes[size],
      )}
      data-testid={testId}
      aria-hidden
    >
      {initials || "DC"}
    </span>
  );
}

export function InlineButton({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return <Button {...props}>{children}</Button>;
}
