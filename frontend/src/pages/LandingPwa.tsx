import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { SectionHeading, UpgradeGate } from "@/components/kit";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/session";
import type { DigitalCard } from "@/types";

const TEMPLATES = [
  { id: "founder", name: "Founder", sections: ["Profile", "About", "Traction", "Contact"] },
  { id: "consultant", name: "Consultant", sections: ["Profile", "Services", "Testimonials", "Booking"] },
  { id: "freelancer", name: "Freelancer", sections: ["Profile", "Portfolio", "Services", "Contact"] },
  { id: "sales", name: "Sales Professional", sections: ["Profile", "Offer", "Booking", "Contact"] },
  { id: "agency", name: "Agency", sections: ["Profile", "Work", "Services", "Contact"] },
  { id: "recruiter", name: "Recruiter", sections: ["Profile", "Open roles", "About", "Contact"] },
  { id: "speaker", name: "Speaker / Community Leader", sections: ["Profile", "Talks", "Featured", "Contact"] },
  { id: "sme", name: "SME", sections: ["Profile", "Products", "Location", "Contact"] },
];

export default function LandingPwa() {
  const { isPaid } = useAuth();
  const [selected, setSelected] = useState("founder");
  const cards = useQuery({ queryKey: ["cards"], queryFn: () => apiGet<DigitalCard[]>("/cards"), enabled: isPaid });
  const card = cards.data?.[0];

  if (!isPaid) {
    return (
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="Identity" title="Personal landing PWA" testId="landingpwa-heading" />
        <UpgradeGate
          feature="Personal landing PWA"
          description="Publish a professionally designed, installable landing page for your practice — profile, services, portfolio, testimonials, booking and connect actions."
          testId="landingpwa-upgrade-gate"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SectionHeading eyebrow="Identity" title="Personal landing PWA" testId="landingpwa-heading" />
      <p className="dense text-sm text-muted-foreground">
        Pick a template for your public landing experience. It shares your published card's identity
        data, so the two never drift apart.
      </p>

      <ul className="grid gap-3 sm:grid-cols-2" data-testid="landingpwa-templates">
        {TEMPLATES.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => setSelected(t.id)}
              className={`glass w-full rounded-xl p-4 text-left transition-colors duration-200 ${
                selected === t.id ? "border-sky/60 bg-primary/10" : "hover:border-primary/30"
              }`}
              data-testid={`landingpwa-template-${t.id}`}
            >
              <p className="flex items-center gap-2 text-sm font-semibold">
                {t.name}
                {selected === t.id && <Check className="h-3.5 w-3.5 text-accent" aria-hidden />}
              </p>
              <p className="dense mt-1 text-xs text-muted-foreground">{t.sections.join(" · ")}</p>
            </button>
          </li>
        ))}
      </ul>

      <section className="glass rounded-xl p-5" data-testid="landingpwa-publish">
        <SectionHeading eyebrow="Publish" title="Your landing experience" />
        <p className="dense text-sm text-muted-foreground">
          Template <strong className="text-foreground">{TEMPLATES.find((t) => t.id === selected)?.name}</strong>{" "}
          is applied to your public identity at{" "}
          <span className="text-sky">/c/{card?.slug ?? "your-card"}</span>. Installable from any mobile
          browser via “Add to Home Screen”.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {card && (
            <a
              href={`/c/${card.slug}`}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
              data-testid="landingpwa-preview"
            >
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
              Preview live page
            </a>
          )}
          <Button
            size="sm"
            onClick={() => toast.success(`${TEMPLATES.find((t) => t.id === selected)?.name} template applied`)}
            data-testid="landingpwa-apply"
          >
            Apply template
          </Button>
        </div>
      </section>
    </div>
  );
}
