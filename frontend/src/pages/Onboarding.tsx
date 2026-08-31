import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { DigiConLogo } from "@/components/brand/DigiConLogo";
import CardCanvas from "@/components/cards/CardCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiPost } from "@/lib/api";
import { meKey, useAuth } from "@/lib/session";
import { CARD_TEMPLATES, type CardInput, type User } from "@/types";

const GOALS = [
  "Find partners and investors",
  "Win more clients",
  "Hire great people",
  "Build a community",
  "Grow my sales pipeline",
];

const GOAL_LABELS: Record<string, string> = Object.fromEntries(GOALS.map((g) => [g, g]));

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    title: "",
    company: "",
    phone: "",
    avatar_url: "",
    networking_goal: GOALS[0],
    template: "founder",
  });

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const preview: CardInput = {
    label: "Primary",
    template: form.template,
    orientation: "portrait",
    accent: "#22d3ee",
    name: form.name || "Your name",
    title: form.title,
    company: form.company,
    bio: "",
    phone: form.phone,
    email: user?.email ?? "",
    website: "",
    location: "",
    avatar_url: form.avatar_url,
    logo_url: "",
    services: [],
    socials: [],
    booking_url: "",
    published: true,
  };

  const finish = useMutation({
    mutationFn: () => apiPost<User>("/auth/onboarding", form),
    onSuccess: (updated) => {
      qc.setQueryData(meKey, updated);
      setStep(3);
    },
    onError: () => toast.error("We couldn't save your details. Please try again."),
  });

  const steps = ["Who you are", "How to reach you", "Your first card"];

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8">
      <DigiConLogo to="/dashboard" />

      {step < 3 ? (
        <div className="mt-8 grid flex-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <ol className="mb-6 flex gap-2" aria-label="Onboarding progress">
              {steps.map((label, i) => (
                <li key={label} className="flex-1" data-testid={`onboarding-step-${i}`}>
                  <div
                    className={`h-1 rounded-full transition-colors duration-300 ${
                      i <= step ? "bg-sky" : "bg-muted"
                    }`}
                  />
                  <p className="dense mt-2 text-xs text-muted-foreground">{label}</p>
                </li>
              ))}
            </ol>

            <div className="glass animate-rise rounded-2xl p-6">
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <p className="label-caps">Step 1</p>
                    <h1 className="font-heading text-2xl font-extrabold">Let's set up your identity</h1>
                    <p className="dense mt-1.5 text-sm text-muted-foreground">
                      Only what we need to make your first DigiCon card useful.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ob-name">Full name</Label>
                    <Input id="ob-name" value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="onboarding-name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ob-title">Professional role</Label>
                    <Input
                      id="ob-title"
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      placeholder="Founder & CEO"
                      data-testid="onboarding-title"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ob-company">Company</Label>
                    <Input
                      id="ob-company"
                      value={form.company}
                      onChange={(e) => set("company", e.target.value)}
                      placeholder="Neora Solutions"
                      data-testid="onboarding-company"
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <p className="label-caps">Step 2</p>
                    <h1 className="font-heading text-2xl font-extrabold">How should people reach you?</h1>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ob-phone">Phone</Label>
                    <Input
                      id="ob-phone"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+63 917 123 4567"
                      data-testid="onboarding-phone"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ob-avatar">Profile photo URL (optional)</Label>
                    <Input
                      id="ob-avatar"
                      value={form.avatar_url}
                      onChange={(e) => set("avatar_url", e.target.value)}
                      placeholder="https://…"
                      data-testid="onboarding-avatar"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ob-goal">Primary networking goal</Label>
                    <Select
                      value={form.networking_goal}
                      onValueChange={(value: string) => set("networking_goal", value)}
                    >
                      <SelectTrigger id="ob-goal" data-testid="onboarding-goal">
                        <SelectValue>{(v) => GOAL_LABELS[v as string] ?? "Choose a goal"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {GOALS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <p className="label-caps">Step 3</p>
                    <h1 className="font-heading text-2xl font-extrabold">Pick your card template</h1>
                    <p className="dense mt-1.5 text-sm text-muted-foreground">
                      You can restyle it any time in the card builder.
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {CARD_TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => set("template", t.id)}
                        className={`glass-soft rounded-xl p-3 text-left transition-colors duration-200 ${
                          form.template === t.id ? "border-sky/60 bg-primary/12" : "hover:border-primary/30"
                        }`}
                        data-testid={`onboarding-template-${t.id}`}
                      >
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          {t.name}
                          {form.template === t.id && <Check className="h-3.5 w-3.5 text-accent" aria-hidden />}
                        </p>
                        <p className="dense mt-0.5 text-xs text-muted-foreground">{t.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  data-testid="onboarding-back"
                >
                  Back
                </Button>
                {step < 2 ? (
                  <Button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={step === 0 && form.name.trim().length < 2}
                    data-testid="onboarding-next"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Button>
                ) : (
                  <Button
                    onClick={() => finish.mutate()}
                    disabled={finish.isPending}
                    data-testid="onboarding-finish"
                  >
                    {finish.isPending ? "Creating…" : "Create my card"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <p className="label-caps mb-2">Live preview</p>
            <CardCanvas card={preview} testId="onboarding-card-preview" />
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-12 max-w-xl text-center">
          <div className="glass animate-rise rounded-2xl p-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
              <PartyPopper className="h-6 w-6" aria-hidden />
            </div>
            <h1 className="font-heading text-2xl font-extrabold" data-testid="onboarding-ready-heading">
              Your DigiCon is ready.
            </h1>
            <p className="dense mt-2 text-sm text-muted-foreground">
              Next: share it, capture the people you meet, and never lose a valuable connection again.
            </p>
            <div className="dense mt-5 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              {["Share", "Connect", "Remember", "Follow Up"].map((s) => (
                <span key={s} className="glass-soft rounded-full px-3 py-1">
                  {s}
                </span>
              ))}
            </div>
            <Button className="mt-6 w-full sm:w-auto" onClick={() => navigate("/dashboard")} data-testid="onboarding-go-dashboard">
              Go to my dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
