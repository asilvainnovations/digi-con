import { Link } from "react-router-dom";
import { Check, Minus } from "lucide-react";
import { PublicLayout } from "@/components/layout/Layouts";
import { SectionHeading } from "@/components/kit";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/session";
import { cn } from "@/lib/utils";

const ROWS = [
  { feature: "Digital business card", free: "1 card", pro: "Unlimited cards" },
  { feature: "QR, link, SMS, email & NFC sharing", free: true, pro: true },
  { feature: "Contact capture from your public card", free: true, pro: true },
  { feature: "Relationship records & interaction history", free: true, pro: true },
  { feature: "Follow-ups and next actions", free: true, pro: true },
  { feature: "CRM pipeline view", free: false, pro: true },
  { feature: "Networking analytics & badges", free: false, pro: true },
  { feature: "Card image / vCard export", free: false, pro: true },
  { feature: "Apple & Google Wallet identity", free: false, pro: true },
  { feature: "Personal landing PWA templates", free: false, pro: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span className="dense text-sm">{value}</span>;
  return value ? (
    <Check className="h-4 w-4 text-accent" aria-label="Included" />
  ) : (
    <Minus className="h-4 w-4 text-muted-foreground" aria-label="Not included" />
  );
}

export default function Pricing() {
  const { user, isPaid } = useAuth();
  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="text-center">
          <p className="label-caps">Pricing</p>
          <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">
            Free to discover. Paid when it becomes infrastructure.
          </h1>
          <p className="dense mx-auto mt-3 max-w-xl text-muted-foreground">
            Use the core relationship workspace for free. Upgrade when DigiCon becomes the system of
            record for your professional network.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="glass rounded-2xl p-6" data-testid="plan-free">
            <p className="label-caps">Free</p>
            <p className="metric mt-1 text-3xl">$0</p>
            <p className="dense mt-1 text-sm text-muted-foreground">Forever. One card, full relationship basics.</p>
            <Link
              to={user ? "/dashboard" : "/signup"}
              className={cn(buttonVariants({ variant: "outline" }), "mt-5 w-full")}
              data-testid="plan-free-cta"
            >
              {user ? "Go to dashboard" : "Start free"}
            </Link>
          </div>

          <div className="metal-edge rounded-2xl p-6" data-testid="plan-pro-monthly">
            <p className="label-caps">Pro · Monthly</p>
            <p className="metric mt-1 text-3xl gold-text">$19</p>
            <p className="dense mt-1 text-sm text-muted-foreground">per month · billed monthly</p>
            <Link
              to={isPaid ? "/billing" : "/checkout?plan=pro_monthly"}
              className={cn(buttonVariants(), "mt-5 w-full bg-gold text-[#1a1200] hover:bg-gold-metal")}
              data-testid="plan-pro-monthly-cta"
            >
              {isPaid ? "Manage subscription" : "Upgrade monthly"}
            </Link>
          </div>

          <div className="glass rounded-2xl p-6" data-testid="plan-pro-yearly">
            <p className="label-caps">Pro · Yearly</p>
            <p className="metric mt-1 text-3xl">$182</p>
            <p className="dense mt-1 text-sm text-muted-foreground">per year · two months free</p>
            <Link
              to={isPaid ? "/billing" : "/checkout?plan=pro_yearly"}
              className={cn(buttonVariants({ variant: "outline" }), "mt-5 w-full")}
              data-testid="plan-pro-yearly-cta"
            >
              {isPaid ? "Manage subscription" : "Upgrade yearly"}
            </Link>
          </div>
        </div>

        <section className="glass mt-10 overflow-x-auto rounded-2xl p-5" aria-label="Plan comparison">
          <SectionHeading eyebrow="Compare" title="What's in each plan" />
          <table className="w-full min-w-[520px] text-left" data-testid="pricing-table">
            <thead>
              <tr className="label-caps">
                <th scope="col" className="pb-2">Feature</th>
                <th scope="col" className="pb-2">Free</th>
                <th scope="col" className="pb-2">Pro</th>
              </tr>
            </thead>
            <tbody className="dense text-sm">
              {ROWS.map((row) => (
                <tr key={row.feature} className="border-t border-border/60">
                  <th scope="row" className="py-2.5 pr-4 font-normal">{row.feature}</th>
                  <td className="py-2.5"><Cell value={row.free} /></td>
                  <td className="py-2.5"><Cell value={row.pro} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </PublicLayout>
  );
}
