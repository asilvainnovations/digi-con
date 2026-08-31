import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  CalendarClock,
  QrCode,
  Send,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/Layouts";
import CardCanvas from "@/components/cards/CardCanvas";
import { Avatar, SectionHeading, StatusBadge } from "@/components/kit";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { CardInput } from "@/types";

const HERO_CARD: CardInput = {
  label: "Founder",
  template: "founder",
  orientation: "portrait",
  accent: "#22d3ee",
  name: "Maria Santos",
  title: "Founder & CEO",
  company: "Neora Solutions",
  bio: "Building solutions that create impact.",
  phone: "+63 917 123 4567",
  email: "maria@neora.com",
  website: "www.neora.com",
  location: "Manila, Philippines",
  avatar_url: "",
  logo_url: "",
  services: ["Partnerships", "Product strategy"],
  socials: [{ label: "LinkedIn", url: "https://linkedin.com" }],
  booking_url: "",
  published: true,
};

const NETWORK_PREVIEW = [
  { name: "Miguel Reyes", role: "Founder @ GreenGrid", status: "Partner", met: "Sustainability Forum 2026" },
  { name: "Aisha Rahman", role: "HR Director @ PeopleFirst", status: "Connected", met: "Leadership Summit 2026" },
  { name: "Jessica Chen", role: "Investor @ NextWave", status: "Opportunity", met: "Tech Leaders Roundtable" },
  { name: "David Lim", role: "CTO @ NovaTech", status: "Follow Up", met: "Global Tech Conference 2026" },
];

const JOURNEY = [
  { icon: QrCode, title: "Identity", body: "One card, portrait or landscape, live at its own URL and QR." },
  { icon: Share2, title: "Connection", body: "Share by QR, link, SMS, email, chat or NFC in seconds." },
  { icon: Users, title: "Relationship", body: "Capture who they are, where you met and what they need." },
  { icon: CalendarClock, title: "Follow-up", body: "One clear next action with a due date, never a vague reminder." },
  { icon: BarChart3, title: "Growth", body: "See health, sources, opportunities and follow-through." },
];

const PILLARS = [
  { icon: Bell, title: "Remember", body: "Never forget a connection — the context of the conversation stays with the person." },
  { icon: Brain, title: "Understand", body: "Capture what matters: their interest, shared purpose, and the value in play." },
  { icon: Send, title: "Follow Up", body: "Take the right next action before the moment goes cold." },
  { icon: Sparkles, title: "Grow", body: "Build a network that compounds instead of a contact list that decays." },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40" aria-hidden>
          <g stroke="#38bdf8" strokeWidth="1" fill="none">
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M -40 ${140 + i * 90} C 320 ${60 + i * 80}, 640 ${300 - i * 40}, 1180 ${120 + i * 70}`}
                strokeDasharray="320"
                className="animate-trace"
                style={{ animationDelay: `${i * 0.6}s` }}
              />
            ))}
          </g>
        </svg>

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="min-w-0">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="label-caps"
            >
              DigiCon · Digitally Connected
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-heading mt-2 break-words text-3xl font-extrabold leading-[1.12] sm:text-4xl lg:text-5xl"
              data-testid="landing-hero-heading"
            >
              More than a digital business card.
              <span className="block text-sky">It's your relationship workspace.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="dense mt-5 max-w-lg text-base text-muted-foreground sm:text-lg"
            >
              Your professional identity. Your connections. Your network. Create your identity, share
              it instantly, capture the people you meet, and turn everyday networking into
              relationships you can actually manage.
            </motion.p>
            <p className="font-heading mt-4 text-sm font-semibold tracking-wide text-accent">
              Create. Share. Connect. Remember. Follow Up. Grow.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to={user ? "/dashboard" : "/signup"}
                className={cn(buttonVariants({ size: "lg" }), "min-h-[48px]")}
                data-testid="landing-primary-cta"
              >
                Create Your DigiCon
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#how-it-works"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "min-h-[48px]")}
                data-testid="landing-secondary-cta"
              >
                See How It Works
              </a>
            </div>
            <dl className="mt-9 grid max-w-md grid-cols-3 gap-4">
              {[
                { k: "Never lost", v: "Connections" },
                { k: "One action", v: "Per relationship" },
                { k: "Measurable", v: "Networking" },
              ].map((s) => (
                <div key={s.k} className="min-w-0">
                  <dt className="font-heading text-sm font-bold text-sky sm:text-base">{s.k}</dt>
                  <dd className="dense text-xs text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative min-w-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto max-w-xs"
            >
              <CardCanvas card={HERO_CARD} testId="landing-hero-card" />
            </motion.div>
            <div className="mt-5 space-y-2.5">
              {NETWORK_PREVIEW.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 + i * 0.09 }}
                  className="glass flex items-center gap-3 rounded-xl p-3"
                  data-testid={`landing-network-card-${i}`}
                >
                  <Avatar name={p.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="dense truncate text-xs text-muted-foreground">
                      {p.role} · met {p.met}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-14">
        <SectionHeading
          eyebrow="How it works"
          title="Identity → Connection → Relationship → Follow-up → Growth"
          testId="landing-journey-heading"
        />
        <ol className="grid gap-4 md:grid-cols-5">
          {JOURNEY.map((j, i) => (
            <li key={j.title} className="glass rounded-xl p-5" data-testid={`landing-journey-${i}`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-sky">
                <j.icon className="h-4.5 w-4.5" aria-hidden />
              </span>
              <p className="label-caps mt-3">Step {i + 1}</p>
              <h3 className="font-heading text-base font-bold">{j.title}</h3>
              <p className="dense mt-1.5 text-sm text-muted-foreground">{j.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Difference */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="glass rounded-2xl p-6 sm:p-9">
          <SectionHeading
            eyebrow="The difference"
            title="A connection is not just a contact"
            testId="landing-difference-heading"
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="label-caps">A digital business card gives you</p>
              <ul className="dense mt-2 space-y-1.5 text-sm text-muted-foreground">
                <li>Name, company and links</li>
                <li>A tap or a scan</li>
                <li>A contact saved somewhere</li>
                <li>…and then nothing</li>
              </ul>
            </div>
            <div>
              <p className="label-caps text-accent">DigiCon gives you</p>
              <ul className="dense mt-2 space-y-1.5 text-sm">
                <li>Where you met and what you discussed</li>
                <li>What they need and what it's worth</li>
                <li>One clear next action with a due date</li>
                <li>Proof that your network is actually growing</li>
              </ul>
            </div>
          </div>
          <p className="font-heading mt-7 text-lg font-bold sm:text-xl">
            The card is the entry point. <span className="text-sky">The relationship is the product.</span>
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="glass rounded-xl p-5" data-testid={`landing-pillar-${p.title.toLowerCase()}`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/12 text-accent">
                <p.icon className="h-4.5 w-4.5" aria-hidden />
              </span>
              <h3 className="font-heading mt-3 text-base font-bold">{p.title}</h3>
              <p className="dense mt-1.5 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-6">
        <div className="metal-edge rounded-2xl p-8 text-center">
          <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">
            Your next valuable connection should never be forgotten.
          </h2>
          <p className="dense mx-auto mt-3 max-w-lg text-muted-foreground">
            Start free with one card and the full relationship workspace. Upgrade when DigiCon becomes
            infrastructure for your professional identity.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className={cn(buttonVariants({ size: "lg" }), "bg-gold text-[#1a1200] hover:bg-gold-metal")}
              data-testid="landing-footer-cta"
            >
              Create Your DigiCon
            </Link>
            <Link to="/pricing" className={buttonVariants({ variant: "outline", size: "lg" })} data-testid="landing-pricing-cta">
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
