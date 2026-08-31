import type { ReactNode } from "react";
import { Briefcase, CalendarCheck, Globe, Mail, MapPin, Phone } from "lucide-react";
import { Avatar } from "@/components/kit";
import type { CardInput, Social } from "@/types";
import { cn } from "@/lib/utils";

function ContactRow({
  icon,
  value,
  accent,
  testId,
  truncate = false,
}: {
  icon: ReactNode;
  value: string;
  accent: string;
  testId: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-center gap-2" data-testid={testId} style={{ color: accent }}>
      {icon}
      <dd className={cn("text-[#cddcf7]", truncate && "truncate")}>{value}</dd>
    </div>
  );
}

export function CardIdentity({ card, accent }: { card: CardInput; accent: string }) {
  const logoFirst = card.template === "company" || card.template === "event";
  return (
    <>
      {logoFirst && card.logo_url ? (
        <img
          src={card.logo_url}
          alt={`${card.company} logo`}
          className="h-14 w-14 rounded-xl border border-white/10 bg-white/5 object-contain p-1.5"
        />
      ) : (
        <Avatar name={card.name || "DigiCon"} url={card.avatar_url || undefined} size="lg" testId="card-avatar" />
      )}
      <div className="min-w-0">
        <p className="label-caps" style={{ color: accent }}>
          {card.template}
        </p>
        <h3 className="font-heading truncate text-xl font-extrabold" data-testid="card-name">
          {card.name || "Your name"}
        </h3>
        <p className="dense text-sm text-[#cddcf7]" data-testid="card-title">
          {card.title || "Your role"}
          {card.company ? ` · ${card.company}` : ""}
        </p>
      </div>
    </>
  );
}

export function CardContactList({ card, accent }: { card: CardInput; accent: string }) {
  const iconClass = "h-3.5 w-3.5 shrink-0";
  const rows: { key: string; icon: ReactNode; value: string; truncate?: boolean }[] = [
    { key: "phone", icon: <Phone className={iconClass} aria-hidden />, value: card.phone },
    { key: "email", icon: <Mail className={iconClass} aria-hidden />, value: card.email, truncate: true },
    { key: "website", icon: <Globe className={iconClass} aria-hidden />, value: card.website, truncate: true },
    { key: "location", icon: <MapPin className={iconClass} aria-hidden />, value: card.location },
    { key: "booking", icon: <CalendarCheck className={iconClass} aria-hidden />, value: card.booking_url, truncate: true },
  ];
  return (
    <dl className="dense grid gap-1.5 text-sm text-[#cddcf7]">
      {rows
        .filter((row) => Boolean(row.value))
        .map((row) => (
          <ContactRow
            key={row.key}
            icon={row.icon}
            value={row.value}
            accent={accent}
            truncate={row.truncate}
            testId={`card-${row.key}`}
          />
        ))}
    </dl>
  );
}

export function CardServices({ services, accent }: { services: string[]; accent: string }) {
  return (
    <div className="flex flex-wrap gap-1.5" data-testid="card-services">
      {services.slice(0, 5).map((service) => (
        <span
          key={service}
          className="dense rounded-full border px-2.5 py-0.5 text-xs"
          style={{ borderColor: `${accent}44`, color: accent }}
        >
          {service}
        </span>
      ))}
    </div>
  );
}

export function CardSocials({ socials }: { socials: Social[] }) {
  return (
    <div className="flex flex-wrap gap-2 pt-0.5" data-testid="card-socials">
      {socials.map((social) => (
        <a
          key={`${social.label}-${social.url}`}
          href={social.url}
          target="_blank"
          rel="noreferrer noopener"
          className="dense inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs text-[#cddcf7] transition-colors duration-200 hover:bg-white/10"
        >
          <Briefcase className="h-3 w-3" aria-hidden />
          {social.label}
        </a>
      ))}
    </div>
  );
}
