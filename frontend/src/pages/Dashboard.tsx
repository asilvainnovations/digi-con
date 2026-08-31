import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Share2 } from "lucide-react";
import { Avatar } from "@/components/kit";
import {
  AttentionMetrics,
  CardPanel,
  FollowUpsPanel,
  HealthPanel,
  QuickActions,
  RecentRelationshipsPanel,
} from "@/components/dashboard/DashboardSections";
import { buttonVariants } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/session";
import type { DashboardSummary, DigitalCard, FollowUp, Relationship } from "@/types";

export default function Dashboard() {
  const { user, isPaid } = useAuth();
  const summary = useQuery({ queryKey: ["dashboard"], queryFn: () => apiGet<DashboardSummary>("/dashboard") });
  const cards = useQuery({ queryKey: ["cards"], queryFn: () => apiGet<DigitalCard[]>("/cards") });
  const followups = useQuery({ queryKey: ["followups", ""], queryFn: () => apiGet<FollowUp[]>("/followups") });
  const contacts = useQuery({
    queryKey: ["relationships", "", "", ""],
    queryFn: () => apiGet<Relationship[]>("/relationships"),
  });

  const due = summary.data?.followups_due ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="animate-rise flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name ?? "DigiCon"} url={user?.avatar_url || undefined} testId="dashboard-avatar" />
          <div>
            <p className="label-caps">
              {isPaid ? "DigiCon Pro" : "DigiCon Free"} · {user?.company || "Your workspace"}
            </p>
            <h1 className="font-heading text-2xl font-extrabold" data-testid="dashboard-greeting">
              {due > 0
                ? `You have ${due} follow-up${due === 1 ? "" : "s"} waiting`
                : `Welcome back, ${(user?.name ?? "there").split(" ")[0]}`}
            </h1>
          </div>
        </div>
        <Link to="/share" className={buttonVariants({ size: "sm" })} data-testid="dashboard-share-cta">
          <Share2 className="mr-2 h-4 w-4" aria-hidden />
          Share my DigiCon
        </Link>
      </header>

      <QuickActions />
      <AttentionMetrics query={summary} />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <FollowUpsPanel query={followups} />
          <RecentRelationshipsPanel query={contacts} />
        </div>
        <div className="space-y-6">
          <CardPanel query={cards} />
          {summary.data && <HealthPanel summary={summary.data} isPaid={isPaid} />}
        </div>
      </div>
    </div>
  );
}
