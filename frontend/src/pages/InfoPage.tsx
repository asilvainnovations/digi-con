import { Link, useLocation } from "react-router-dom";
import { PublicLayout } from "@/components/layout/Layouts";
import { SectionHeading } from "@/components/kit";
import { buttonVariants } from "@/components/ui/button";

type Block = { heading: string; body: string[] };
type Content = { eyebrow: string; title: string; intro: string; blocks: Block[] };

const CONTENT: Record<string, Content> = {
  "/about": {
    eyebrow: "About",
    title: "We built the part that comes after the handshake",
    intro:
      "DigiCon exists because introductions are easy and remembering is hard. Most tools stop at the exchange; the value is in everything that follows.",
    blocks: [
      {
        heading: "Our position",
        body: [
          "DigiCon sits between a digital business card and a full CRM: much more useful than a static card, far simpler than enterprise sales software.",
          "The card gets someone into DigiCon. The accumulated relationship memory is why they stay.",
        ],
      },
      {
        heading: "Who we build for",
        body: [
          "Founders, SME owners, consultants, freelancers, sales and business-development professionals, recruiters, agency owners and community leaders — anyone whose relationships carry real economic or career value.",
        ],
      },
    ],
  },
  "/faq": {
    eyebrow: "FAQ",
    title: "Questions we hear most",
    intro: "Short answers about how DigiCon works, what's free, and how your data is treated.",
    blocks: [
      {
        heading: "Is DigiCon just a digital business card?",
        body: [
          "No. The card is the entry point. The product is relationship capture, organisation, follow-up and measurable networking value.",
        ],
      },
      {
        heading: "What can I do on the free plan?",
        body: [
          "One published card with QR and link sharing, contact capture from your public card, unlimited relationship records, interaction history and follow-ups.",
        ],
      },
      {
        heading: "What does Pro add?",
        body: [
          "Unlimited cards, the CRM pipeline view, networking analytics and badges, card/vCard export, Apple and Google Wallet identity, and personal landing PWA templates.",
        ],
      },
      {
        heading: "Can people see my private notes?",
        body: [
          "Never. A public card URL exposes only your identity details. Notes, opportunity values, follow-ups and interaction history stay in your private workspace.",
        ],
      },
      {
        heading: "Does the person I meet need an account?",
        body: [
          "No. Anyone viewing your card can save your contact or send theirs back through a minimal contact-exchange form — no registration required.",
        ],
      },
    ],
  },
  "/use-cases": {
    eyebrow: "Customers & use cases",
    title: "Where DigiCon earns its place",
    intro: "The same loop — share, capture, remember, follow up — applied to very different rooms.",
    blocks: [
      {
        heading: "Conferences and trade shows",
        body: [
          "Scan-to-connect at the booth, capture the context of each conversation, then leave with a list of next actions instead of a stack of cards.",
        ],
      },
      {
        heading: "Sales and business development",
        body: [
          "Track interest, opportunity value and relationship health per person, and move them through a pipeline that takes minutes, not a CRM rollout.",
        ],
      },
      {
        heading: "Recruiting and job fairs",
        body: [
          "Capture candidates with role, event and shared purpose, then follow up before the strongest people go elsewhere.",
        ],
      },
      {
        heading: "Consultants, freelancers and agencies",
        body: [
          "One identity to share, one place to remember what each client asked for, and one list telling you who to send a proposal to today.",
        ],
      },
    ],
  },
  "/resources": {
    eyebrow: "Resources",
    title: "Get more out of your network",
    intro: "Practical material on turning introductions into relationships you can manage.",
    blocks: [
      {
        heading: "The five-minute follow-up habit",
        body: [
          "At the end of every event day, capture three things per person: where you met, what they need, and the single next action. Read more on the blog.",
        ],
      },
      {
        heading: "Relationship health signals",
        body: [
          "A relationship going quiet is visible about 30 days before it feels quiet: fewer interactions, no open next action, no recorded shared purpose.",
        ],
      },
      {
        heading: "Sharing checklist",
        body: [
          "QR at the booth, link in chat, vCard for phone contacts, NFC for tap-to-share, and Wallet for the identity you always carry.",
        ],
      },
    ],
  },
  "/support": {
    eyebrow: "Support",
    title: "We'll help you get set up",
    intro: "Most questions are about sharing, plan features or data privacy.",
    blocks: [
      {
        heading: "Get in touch",
        body: [
          "Email support@digicon.app and include your account email. Pro accounts get prioritised responses.",
        ],
      },
      {
        heading: "Common fixes",
        body: [
          "If your card doesn't open publicly, check that it's published in the card builder. If a paid feature stays locked, your subscription state is verified server-side and refreshes on your next page load.",
        ],
      },
    ],
  },
  "/terms": {
    eyebrow: "Legal",
    title: "Terms of Service",
    intro: "Plain-language summary of the agreement between you and DigiCon.",
    blocks: [
      {
        heading: "Your account",
        body: [
          "You are responsible for the accuracy of the identity information you publish and for keeping your credentials secure.",
        ],
      },
      {
        heading: "Acceptable use",
        body: [
          "Do not use DigiCon to store data you have no right to hold, to send unsolicited bulk messaging, or to impersonate another person or business.",
        ],
      },
      {
        heading: "Subscriptions",
        body: [
          "Paid plans are billed through our payment provider. Paid features are enabled only after payment is verified on our servers, and remain available for the paid period.",
        ],
      },
    ],
  },
  "/privacy": {
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro: "DigiCon handles professional contact and relationship information, so privacy is part of the architecture.",
    blocks: [
      {
        heading: "What is public",
        body: [
          "Only the fields on a published card: name, role, company, bio, contact details, services, social links and booking link.",
        ],
      },
      {
        heading: "What is always private",
        body: [
          "Relationship notes, conversation context, interest, opportunity value, relationship health, follow-ups and interaction history. These are never exposed through a public card URL.",
        ],
      },
      {
        heading: "Your controls",
        body: [
          "You can unpublish a card, edit or delete any relationship record, and request account deletion, which removes your cards, relationships, interactions and follow-ups.",
        ],
      },
    ],
  },
  "/cookies": {
    eyebrow: "Legal",
    title: "Cookie Policy",
    intro: "DigiCon uses the minimum set of cookies needed to keep you signed in.",
    blocks: [
      {
        heading: "Essential cookies",
        body: [
          "A single httpOnly session cookie identifies your signed-in session. It is not readable by scripts and is not used for advertising.",
        ],
      },
      {
        heading: "No third-party tracking",
        body: [
          "We do not set advertising or cross-site tracking cookies. Payment pages are hosted by our payment provider under their own policy.",
        ],
      },
    ],
  },
  "/accessibility": {
    eyebrow: "Commitment",
    title: "Accessibility",
    intro: "DigiCon targets WCAG 2.2 AA principles — futuristic styling should never cost usability.",
    blocks: [
      {
        heading: "What we implement",
        body: [
          "Semantic HTML, labelled forms and controls, visible focus states, keyboard-navigable dialogs and menus, touch targets of roughly 44px, and reduced-motion support that disables decorative animation.",
        ],
      },
      {
        heading: "Reporting a barrier",
        body: [
          "If something blocks you, email support@digicon.app with the page and what happened. Accessibility issues are treated as functional bugs.",
        ],
      },
    ],
  },
};

export default function InfoPage() {
  const { pathname } = useLocation();
  const content = CONTENT[pathname] ?? CONTENT["/about"];
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <SectionHeading eyebrow={content.eyebrow} title={content.title} testId="info-heading" />
        <p className="dense text-base text-muted-foreground" data-testid="info-intro">
          {content.intro}
        </p>
        <div className="mt-8 space-y-4">
          {content.blocks.map((b) => (
            <section key={b.heading} className="glass rounded-xl p-5" data-testid={`info-block-${b.heading.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
              <h2 className="font-heading text-base font-bold">{b.heading}</h2>
              {b.body.map((p) => (
                <p key={p.slice(0, 20)} className="dense mt-2 text-sm text-muted-foreground">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/signup" className={buttonVariants()} data-testid="info-cta">
            Create Your DigiCon
          </Link>
          <Link to="/pricing" className={buttonVariants({ variant: "outline" })} data-testid="info-pricing">
            See pricing
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
