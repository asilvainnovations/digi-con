import { CardContactList, CardIdentity, CardServices, CardSocials } from "@/components/cards/CardParts";
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
        <CardIdentity card={card} accent={accent} />
      </div>

      <div className={cn("relative min-w-0 flex-1 space-y-3", landscape && "border-l border-white/10 pl-5")}>
        {card.bio && (
          <p className="dense text-sm leading-relaxed text-[#b8c9e6]" data-testid="card-bio">
            {card.bio}
          </p>
        )}
        <CardContactList card={card} accent={accent} />
        {showServices && <CardServices services={card.services} accent={accent} />}
        {card.socials.length > 0 && <CardSocials socials={card.socials} />}
      </div>
    </article>
  );
}
