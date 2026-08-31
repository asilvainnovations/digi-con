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
import BrandImage from "@/components/brand/BrandImage";
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
  { icon: Share2, title: "Share", body: "QR, link, SMS, email, chat, NFC or wallet — in seconds." },
  { icon: Users, title: "Connect", body: "An introduction becomes a captured, two-way connection." },
  { icon: Bell, title: "Remember", body: "Where you met, what you discussed, what they need." },
  { icon: CalendarClock, title: "Follow Up", body: "One clear next action with a due date, never a vague reminder." },
  { icon: BarChart3, title: "Grow", body: "See health, sources, opportunities and follow-through." },
];

const SHARE_CHANNELS = ["QR code", "Link", "NFC tap", "Email", "Chat", "Digital wallet"];

const REMEMBER_FIELDS = [
  { label: "Met at", value: "Global Tech Conference 2026, San Francisco" },
  { label: "Discussed", value: "AI-powered solutions for business growth" },
  { label: "They need", value: "Scalable marketing automation" },
  { label: "Shared purpose", value: "Partnership opportunities" },
  { label: "Status", value: "Follow Up" },
];

const GROW_METRICS = [
  { value: "128", label: "Connections" },
  { value: "36", label: "Follow-ups" },
  { value: "12", label: "Meetings" },
  { value: "8", label: "Opportunities" },
];

const PILLARS = [
  { icon: Bell, title: "Remember", body: "Never forget a connection — the context of the conversation stays with the person." },
  { icon: Brain, title: "Understand", body: "Capture what matters: their interest, shared purpose, and the value in play." },
  { icon: Send, title: "Follow Up", body: "Take the right next action before the moment goes cold." },
  { icon: Sparkles, title: "Grow", body: "Build a network that compounds instead of a contact list that decays." },
];

function StorySection({
  id,
  eyebrow,
  title,
  lead,
  image,
  alt,
  reverse = false,
  children,
  testId,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  image: "connect" | "share" | "remember" | "grow" | "male";
  alt: string;
  reverse?: boolean;
  children?: React.ReactNode;
  testId: string;
}) {
  return (
    <section id={id} className="py-10 sm:py-14" aria-labelledby={`${id}-title`} data-testid={testId}>
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-0 sm:px-4 lg:grid-cols-2">
        <div className={cn("min-w-0 order-1 px-4 sm:px-0", reverse && "lg:order-2")}>
          <p className="label-caps">{eyebrow}</p>
          <h2 id={`${id}-title`} className="font-heading mt-1.5 text-2xl font-extrabold sm:text-3xl">
            {title}
          </h2>
          <p className="dense mt-3 max-w-lg text-muted-foreground">{lead}</p>
          {children}
        </div>
        <div className={cn("order-2 min-w-0", reverse && "lg:order-1")}>
          <div className="overflow-hidden sm:rounded-2xl sm:border sm:border-border/60">
            <BrandImage name={image} alt={alt} testId={`${testId}-image`} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const startHref = user ? "/dashboard" : "/signup";

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
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
              id="hero-title"
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
                to={startHref}
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

      {/* Full-bleed hero banner */}
      <section aria-label="DigiCon in real professional use" className="relative">
        <BrandImage
          name="connect"
          alt="Two professionals exchanging DigiCon digital business cards by QR code while their connections, follow-ups and relationship statuses appear as a live network around them"
          priority
          testId="landing-banner-hero"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/70 to-transparent p-4 pt-16 sm:p-8">
          <p className="font-heading mx-auto max-w-6xl text-base font-bold sm:text-2xl">
            An introduction is easy. <span className="text-sky">Remembering is the hard part.</span>
          </p>
        </div>
      </section>

      {/* Journey */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="journey-title">
        <SectionHeading
          eyebrow="How it works"
          title="Identity → Share → Connect → Remember → Follow Up → Grow"
          testId="landing-journey-heading"
        />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Create & Share */}
      <StorySection
        id="create-share"
        eyebrow="Create & Share"
        title="Your identity, ready to hand over in one tap"
        lead="Build your DigiCon card once, then share it the way the moment allows — scan the QR at a booth, drop the link in chat, tap phones over NFC, or keep it in your digital wallet."
        image="share"
        alt="DigiCon user sharing her digital business card with QR code, link, NFC, email, chat and digital wallet options alongside her live professional identity profile"
        testId="landing-section-share"
      >
        <ul className="mt-5 flex flex-wrap gap-2" data-testid="landing-share-channels">
          {SHARE_CHANNELS.map((channel) => (
            <li key={channel} className="glass-soft dense rounded-full px-3 py-1.5 text-sm">
              {channel}
            </li>
          ))}
        </ul>
        <Link to={startHref} className={cn(buttonVariants({ size: "sm" }), "mt-6")} data-testid="landing-share-cta">
          Create Your DigiCon
        </Link>
      </StorySection>

      {/* Connect */}
      <StorySection
        id="connect"
        eyebrow="Connect"
        title="Both sides walk away with something useful"
        lead="When someone opens your card they can save your contact or send theirs straight back — no signup, no app install. Their details land in your workspace as a real relationship record with the context of how you met."
        image="male"
        alt="DigiCon professional networking platform showing a digital identity profile with QR code, contact information, social links and connect options next to captured relationship cards"
        reverse
        testId="landing-section-connect"
      >
        <p className="font-heading mt-5 text-lg font-bold text-sky">
          An introduction becomes a connection.
        </p>
      </StorySection>

      {/* Remember */}
      <StorySection
        id="remember"
        eyebrow="Remember"
        title="The conversation stays attached to the person"
        lead="DigiCon keeps the details that actually matter when you follow up weeks later: where you met, when, what you discussed, what they need and where the relationship stands."
        image="remember"
        alt="DigiCon relationship record capturing where two professionals met, the date, what they discussed, shared purpose and the next follow-up action for a lasting business relationship"
        testId="landing-section-remember"
      >
        <dl className="mt-5 space-y-2" data-testid="landing-remember-fields">
          {REMEMBER_FIELDS.map((f) => (
            <div key={f.label} className="glass-soft flex flex-wrap gap-x-3 rounded-lg px-3 py-2">
              <dt className="label-caps min-w-[7rem]">{f.label}</dt>
              <dd className="dense min-w-0 flex-1 text-sm">{f.value}</dd>
            </div>
          ))}
        </dl>
      </StorySection>

      {/* Follow Up */}
      <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="followup-title">
        <SectionHeading eyebrow="Follow Up" title="One clear next action, with a date" testId="landing-followup-heading" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Send partnership proposal", who: "David Lim · NovaTech", due: "due in 2 days", status: "Follow Up" },
            { title: "Share portfolio & case studies", who: "Aisha Rahman · PeopleFirst", due: "due tomorrow", status: "Pending" },
            { title: "Send updated metrics deck", who: "Jessica Chen · NextWave", due: "due in 3 days", status: "Opportunity" },
            { title: "Plan joint webinar agenda", who: "Miguel Reyes · GreenGrid", due: "in progress", status: "Partner" },
          ].map((f, i) => (
            <article key={f.title} className="glass rounded-xl p-4" data-testid={`landing-followup-card-${i}`}>
              <StatusBadge status={f.status} />
              <h3 className="font-heading mt-2 text-sm font-bold">{f.title}</h3>
              <p className="dense mt-1 text-xs text-muted-foreground">{f.who}</p>
              <p className="dense mt-2 text-xs text-sky">{f.due}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Grow */}
      <StorySection
        id="grow"
        eyebrow="Grow"
        title="See whether your network is actually growing"
        lead="Connections, follow-ups, meetings, opportunities and relationship health — the numbers that tell you who to re-engage and where your best introductions come from."
        image="grow"
        alt="DigiCon networking analytics dashboard showing total connections, follow-ups, meetings, opportunities and relationship health for a growing professional network"
        reverse
        testId="landing-section-grow"
      >
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="landing-grow-metrics">
          {GROW_METRICS.map((m) => (
            <div key={m.label} className="glass-soft rounded-xl p-3">
              <dt className="label-caps">{m.label}</dt>
              <dd className="metric mt-1 text-xl text-sky">{m.value}</dd>
            </div>
          ))}
        </dl>
      </StorySection>

      {/* Difference */}
      <section className="mx-auto max-w-6xl px-4 py-6" aria-labelledby="difference-title">
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
      <section className="mx-auto max-w-6xl px-4 py-14" aria-label="What DigiCon does for you">
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

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-6" aria-labelledby="final-cta-title">
        <div className="metal-edge rounded-2xl p-8 text-center">
          <h2 id="final-cta-title" className="font-heading text-2xl font-extrabold sm:text-3xl">
            Every conversation can become a meaningful relationship.
          </h2>
          <p className="dense mx-auto mt-3 max-w-lg text-muted-foreground">
            Start free with one card and the full relationship workspace. Upgrade when DigiCon becomes
            infrastructure for your professional identity.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to={startHref}
              className={cn(buttonVariants({ size: "lg" }), "bg-gold text-[#1a1200] hover:bg-gold-metal")}
              data-testid="landing-footer-cta"
            >
              Create Your DigiCon
            </Link>
            <Link to="/pricing" className={buttonVariants({ variant: "outline", size: "lg" })} data-testid="landing-pricing-cta">
              Explore DigiCon
            </Link>
          </div>
          <p className="font-heading mt-6 text-sm font-semibold">
            Your identity. Your connections. <span className="text-sky">Your future.</span>
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
