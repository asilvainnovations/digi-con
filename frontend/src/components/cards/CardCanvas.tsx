import { Briefcase, Globe, Mail, MapPin, Phone, CalendarCheck } from "lucide-react";
import { Avatar } from "@/components/kit";
import type { CardInput } from "@/types";
import { cn } from "@/lib/utils";

/** One reusable renderer for every template/orientation — no per-design hard-coding. */
export default function CardCanvas({
  card,
  className,
  testId = "card-canvas",
}: {
  card: CardInput;
  className?: string;
  testId?: string;
}) {
  const landscape = card.orientation === "landscape";
  const accent = card.accent || "#22d3ee";
  const showServices = card.services.length > 0 && card.template !== "sales";
  const logoFirst = card.template === "company" || card.template === "event";

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 p-5",
        landscape ? "flex gap-5" : "flex flex-col gap-4",
        className,
      )}
      style={{
        background:
          "linear-gradient(155deg, rgba(23,45,86,0.95) 0%, rgba(7,16,35,0.97) 55%, rgba(10,25,52,0.96) 100%)",
        boxShadow: `0 24px 60px -34px rgba(2,8,23,0.95), inset 0 0 0 1px ${accent}22`,
      }}
      data-testid={testId}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-25 blur-2xl"
        style={{ background: accent }}
        aria-hidden
      />
      <div className={cn("relative flex items-center gap-3.5", landscape && "flex-col text-center")}>
        {logoFirst && card.logo_url ? (
          <img
            src={card.logo_url}
            alt={`${card.company} logo`}
            className="h-14 w-14 rounded-xl border border-white/10 object-contain bg-white/5 p-1.5"
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
      </div>

      <div className={cn("relative min-w-0 flex-1 space-y-3", landscape && "border-l border-white/10 pl-5")}>
        {card.bio && (
          <p className="dense text-sm leading-relaxed text-[#b8c9e6]" data-testid="card-bio">
            {card.bio}
          </p>
        )}
        <dl className="dense grid gap-1.5 text-sm text-[#cddcf7]">
          {card.phone && (
            <div className="flex items-center gap-2" data-testid="card-phone">
              <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} aria-hidden />
              <dd>{card.phone}</dd>
            </div>
          )}
          {card.email && (
            <div className="flex items-center gap-2" data-testid="card-email">
              <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} aria-hidden />
              <dd className="truncate">{card.email}</dd>
            </div>
          )}
          {card.website && (
            <div className="flex items-center gap-2" data-testid="card-website">
              <Globe className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} aria-hidden />
              <dd className="truncate">{card.website}</dd>
            </div>
          )}
          {card.location && (
            <div className="flex items-center gap-2" data-testid="card-location">
              <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} aria-hidden />
              <dd>{card.location}</dd>
            </div>
          )}
          {card.booking_url && (
            <div className="flex items-center gap-2" data-testid="card-booking">
              <CalendarCheck className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} aria-hidden />
              <dd className="truncate">{card.booking_url}</dd>
            </div>
          )}
        </dl>

        {showServices && (
          <div className="flex flex-wrap gap-1.5" data-testid="card-services">
            {card.services.slice(0, 5).map((s) => (
              <span
                key={s}
                className="dense rounded-full border px-2.5 py-0.5 text-xs"
                style={{ borderColor: `${accent}44`, color: accent }}
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {card.socials.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-0.5" data-testid="card-socials">
            {card.socials.map((s) => (
              <a
                key={`${s.label}-${s.url}`}
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                className="dense inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs text-[#cddcf7] transition-colors duration-200 hover:bg-white/10"
              >
                <Briefcase className="h-3 w-3" aria-hidden />
                {s.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
