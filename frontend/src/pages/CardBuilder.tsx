import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";
import CardCanvas from "@/components/cards/CardCanvas";
import { ErrorState, LoadingState, SectionHeading } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, apiPut, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/session";
import { CARD_TEMPLATES, type CardInput, type DigitalCard } from "@/types";

const ACCENTS = ["#22d3ee", "#2f7dff", "#60a5fa", "#f0b429", "#16ecd0", "#8b5cf6"];

const EMPTY: CardInput = {
  label: "Primary",
  template: "founder",
  orientation: "portrait",
  accent: "#22d3ee",
  name: "",
  title: "",
  company: "",
  bio: "",
  phone: "",
  email: "",
  website: "",
  location: "",
  avatar_url: "",
  logo_url: "",
  services: [],
  socials: [],
  booking_url: "",
  published: true,
};

export default function CardBuilder() {
  const { cardId } = useParams<{ cardId: string }>();
  const isNew = !cardId || cardId === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<CardInput>(EMPTY);
  const [servicesText, setServicesText] = useState("");
  const [socialsText, setSocialsText] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const cards = useQuery({ queryKey: ["cards"], queryFn: () => apiGet<DigitalCard[]>("/cards") });
  const existing = cards.data?.find((c) => c.id === cardId);

  useEffect(() => {
    if (hydrated) return;
    if (!isNew && existing) {
      setForm({ ...existing });
      setServicesText(existing.services.join(", "));
      setSocialsText(existing.socials.map((s) => `${s.label}|${s.url}`).join("\n"));
      setHydrated(true);
    } else if (isNew && user) {
      setForm((f) => ({ ...f, name: user.name, title: user.title, company: user.company, phone: user.phone, email: user.email }));
      setHydrated(true);
    }
  }, [existing, isNew, user, hydrated]);

  const set = <K extends keyof CardInput>(key: K, value: CardInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const payload: CardInput = {
    ...form,
    services: servicesText.split(",").map((s) => s.trim()).filter(Boolean),
    socials: socialsText
      .split("\n")
      .map((line) => line.split("|"))
      .filter((parts) => parts.length === 2 && parts[0].trim() && parts[1].trim())
      .map(([label, url]) => ({ label: label.trim(), url: url.trim() })),
  };

  const save = useMutation({
    mutationFn: () =>
      isNew ? apiPost<DigitalCard>("/cards", payload) : apiPut<DigitalCard>(`/cards/${cardId}`, payload),
    onSuccess: (card) => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      toast.success(isNew ? "Card published" : "Card updated");
      navigate(`/share?card=${card.id}`);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 402) {
        toast.error("Free plan includes 1 card — upgrade to add more.");
        navigate("/pricing");
        return;
      }
      toast.error("Couldn't save the card. Check the required fields.");
    },
  });

  if (!isNew && cards.isLoading) return <LoadingState testId="builder-loading" />;
  if (!isNew && cards.data && !existing) return <ErrorState label="That card no longer exists." testId="builder-missing" />;

  return (
    <div className="mx-auto max-w-6xl">
      <SectionHeading
        eyebrow="Card builder"
        title={isNew ? "Create a new DigiCon card" : `Edit "${form.label}"`}
        testId="builder-heading"
      />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass rounded-xl p-5">
          <Tabs defaultValue="identity">
            <TabsList variant="line" className="mb-4">
              <TabsTrigger value="identity" data-testid="builder-tab-identity">
                Identity
              </TabsTrigger>
              <TabsTrigger value="contact" data-testid="builder-tab-contact">
                Contact
              </TabsTrigger>
              <TabsTrigger value="style" data-testid="builder-tab-style">
                Style
              </TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="card-label">Card label</Label>
                <Input id="card-label" value={form.label} onChange={(e) => set("label", e.target.value)} data-testid="builder-label" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="card-name">Name</Label>
                  <Input id="card-name" value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="builder-name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="card-title">Job title</Label>
                  <Input id="card-title" value={form.title} onChange={(e) => set("title", e.target.value)} data-testid="builder-title" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="card-company">Company</Label>
                <Input id="card-company" value={form.company} onChange={(e) => set("company", e.target.value)} data-testid="builder-company" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="card-bio">Short bio</Label>
                <Textarea
                  id="card-bio"
                  rows={3}
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="Building solutions that create impact."
                  data-testid="builder-bio"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="card-services">Services (comma separated)</Label>
                <Input
                  id="card-services"
                  value={servicesText}
                  onChange={(e) => setServicesText(e.target.value)}
                  placeholder="Product strategy, Partnerships"
                  data-testid="builder-services"
                />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="card-phone">Phone</Label>
                  <Input id="card-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} data-testid="builder-phone" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="card-email">Email</Label>
                  <Input id="card-email" value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="builder-email" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="card-website">Website</Label>
                  <Input id="card-website" value={form.website} onChange={(e) => set("website", e.target.value)} data-testid="builder-website" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="card-location">Location</Label>
                  <Input id="card-location" value={form.location} onChange={(e) => set("location", e.target.value)} data-testid="builder-location" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="card-booking">Booking link</Label>
                <Input id="card-booking" value={form.booking_url} onChange={(e) => set("booking_url", e.target.value)} data-testid="builder-booking" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="card-socials">Social links — one per line as “Label|URL”</Label>
                <Textarea
                  id="card-socials"
                  rows={3}
                  value={socialsText}
                  onChange={(e) => setSocialsText(e.target.value)}
                  placeholder={"LinkedIn|https://linkedin.com/in/you"}
                  data-testid="builder-socials"
                />
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-5">
              <div>
                <Label className="mb-2 block">Template</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CARD_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => set("template", t.id)}
                      className={`glass-soft rounded-lg p-3 text-left transition-colors duration-200 ${
                        form.template === t.id ? "border-sky/60 bg-primary/12" : "hover:border-primary/30"
                      }`}
                      data-testid={`builder-template-${t.id}`}
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
              <div>
                <Label className="mb-2 block">Orientation</Label>
                <div className="flex gap-2">
                  {(["portrait", "landscape"] as const).map((o) => (
                    <Button
                      key={o}
                      type="button"
                      variant={form.orientation === o ? "default" : "outline"}
                      size="sm"
                      onClick={() => set("orientation", o)}
                      data-testid={`builder-orientation-${o}`}
                    >
                      {o[0].toUpperCase() + o.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Accent colour</Label>
                <div className="flex flex-wrap gap-2">
                  {ACCENTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Accent ${c}`}
                      onClick={() => set("accent", c)}
                      className={`h-9 w-9 rounded-full border-2 transition-transform duration-200 hover:scale-105 ${
                        form.accent === c ? "border-white" : "border-transparent"
                      }`}
                      style={{ background: c }}
                      data-testid={`builder-accent-${c.replace("#", "")}`}
                    />
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="card-avatar">Profile image URL</Label>
                  <Input id="card-avatar" value={form.avatar_url} onChange={(e) => set("avatar_url", e.target.value)} data-testid="builder-avatar" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="card-logo">Company logo URL</Label>
                  <Input id="card-logo" value={form.logo_url} onChange={(e) => set("logo_url", e.target.value)} data-testid="builder-logo" />
                </div>
              </div>
              <label className="flex items-center gap-2.5 text-sm" htmlFor="card-published">
                <Checkbox
                  id="card-published"
                  checked={form.published}
                  onCheckedChange={(checked) => set("published", checked === true)}
                  data-testid="builder-published"
                />
                Publish this card at its public URL
              </label>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex gap-2">
            <Button
              onClick={() => save.mutate()}
              disabled={save.isPending || form.name.trim().length === 0}
              data-testid="builder-save"
            >
              {save.isPending ? "Saving…" : isNew ? "Publish card" : "Save changes"}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/cards")} data-testid="builder-cancel">
              Cancel
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="label-caps mb-2">Real-time preview</p>
          <CardCanvas card={payload} testId="builder-preview" />
        </div>
      </div>
    </div>
  );
}
