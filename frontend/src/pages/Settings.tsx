import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PremiumBadge, SectionHeading } from "@/components/kit";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiGet, apiPatch } from "@/lib/api";
import { meKey, useAuth, useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { Entitlement, User } from "@/types";

export default function Settings() {
  const { user, isPaid } = useAuth();
  const { endSession } = useSession();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", title: "", company: "", phone: "", avatar_url: "", networking_goal: "" });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        title: user.title,
        company: user.company,
        phone: user.phone,
        avatar_url: user.avatar_url,
        networking_goal: user.networking_goal,
      });
    }
  }, [user]);

  const entitlements = useQuery({ queryKey: ["entitlements"], queryFn: () => apiGet<Entitlement[]>("/entitlements") });

  const save = useMutation({
    mutationFn: () => apiPatch<User>("/auth/profile", form),
    onSuccess: (updated) => {
      qc.setQueryData(meKey, updated);
      toast.success("Profile updated");
    },
    onError: () => toast.error("Couldn't save your profile."),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <SectionHeading eyebrow="Account" title="Profile & settings" testId="settings-heading" />

      <section className="glass space-y-3 rounded-xl p-5" aria-label="Profile">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="st-name">Full name</Label>
            <Input id="st-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="settings-name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-title">Role</Label>
            <Input id="st-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="settings-title" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-company">Company</Label>
            <Input id="st-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} data-testid="settings-company" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-phone">Phone</Label>
            <Input id="st-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="settings-phone" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="st-goal">Primary networking goal</Label>
          <Input id="st-goal" value={form.networking_goal} onChange={(e) => setForm({ ...form, networking_goal: e.target.value })} data-testid="settings-goal" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="st-avatar">Profile photo URL</Label>
          <Input id="st-avatar" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} data-testid="settings-avatar" />
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending} data-testid="settings-save">
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
      </section>

      <section className="glass rounded-xl p-5" aria-label="Plan">
        <SectionHeading
          eyebrow="Subscription"
          title="Your plan"
          action={isPaid ? <PremiumBadge /> : undefined}
        />
        <p className="dense text-sm text-muted-foreground" data-testid="settings-plan">
          You're on the <strong className="text-foreground">{isPaid ? "Pro" : "Free"}</strong> plan.
          {isPaid ? " All growth features are unlocked." : " Core DigiCon is yours to keep — upgrade when it becomes infrastructure."}
        </p>
        <ul className="dense mt-3 grid gap-1.5 text-sm sm:grid-cols-2" data-testid="settings-entitlements">
          {entitlements.data?.map((e) => (
            <li key={e.feature} className="flex items-center gap-2">
              <ShieldCheck className={cn("h-3.5 w-3.5", e.allowed ? "text-accent" : "text-muted-foreground")} aria-hidden />
              <span className={e.allowed ? "" : "text-muted-foreground"}>
                {e.feature.replace(/_/g, " ")}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/billing" className={buttonVariants({ variant: "outline", size: "sm" })} data-testid="settings-billing-link">
            Subscription & billing
          </Link>
          {!isPaid && (
            <Link to="/pricing" className={cn(buttonVariants({ size: "sm" }), "bg-gold text-[#1a1200] hover:bg-gold-metal")} data-testid="settings-upgrade">
              Upgrade to Pro
            </Link>
          )}
        </div>
      </section>

      <section className="glass rounded-xl p-5" aria-label="Privacy">
        <SectionHeading eyebrow="Privacy" title="What's public, what's private" />
        <p className="dense text-sm text-muted-foreground">
          Your published card shows only your identity details. Relationship notes, follow-ups,
          opportunity values and interaction history are never exposed through a public card URL.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/cards" className={buttonVariants({ variant: "outline", size: "sm" })} data-testid="settings-card-visibility">
            <Eye className="mr-2 h-4 w-4" aria-hidden />
            Manage card visibility
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await endSession();
              navigate("/login");
            }}
            data-testid="settings-signout"
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden />
            Sign out
          </Button>
        </div>
      </section>
    </div>
  );
}
