import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CARD_TEMPLATES, type CardInput } from "@/types";

const ACCENTS = ["#22d3ee", "#2f7dff", "#60a5fa", "#f0b429", "#16ecd0", "#8b5cf6"];

type SetField = <K extends keyof CardInput>(key: K, value: CardInput[K]) => void;

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  testId,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  testId: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={testId}
      />
    </div>
  );
}

export function IdentityTab({
  form,
  setField,
  servicesText,
  setServicesText,
}: {
  form: CardInput;
  setField: SetField;
  servicesText: string;
  setServicesText: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Field id="card-label" label="Card label" value={form.label} onChange={(v) => setField("label", v)} testId="builder-label" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="card-name" label="Name" value={form.name} onChange={(v) => setField("name", v)} testId="builder-name" />
        <Field id="card-title" label="Job title" value={form.title} onChange={(v) => setField("title", v)} testId="builder-title" />
      </div>
      <Field id="card-company" label="Company" value={form.company} onChange={(v) => setField("company", v)} testId="builder-company" />
      <div className="space-y-1.5">
        <Label htmlFor="card-bio">Short bio</Label>
        <Textarea
          id="card-bio"
          rows={3}
          value={form.bio}
          onChange={(e) => setField("bio", e.target.value)}
          placeholder="Building solutions that create impact."
          data-testid="builder-bio"
        />
      </div>
      <Field
        id="card-services"
        label="Services (comma separated)"
        value={servicesText}
        onChange={setServicesText}
        placeholder="Product strategy, Partnerships"
        testId="builder-services"
      />
    </div>
  );
}

export function ContactTab({
  form,
  setField,
  socialsText,
  setSocialsText,
}: {
  form: CardInput;
  setField: SetField;
  socialsText: string;
  setSocialsText: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="card-phone" label="Phone" value={form.phone} onChange={(v) => setField("phone", v)} testId="builder-phone" />
        <Field id="card-email" label="Email" value={form.email} onChange={(v) => setField("email", v)} testId="builder-email" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="card-website" label="Website" value={form.website} onChange={(v) => setField("website", v)} testId="builder-website" />
        <Field id="card-location" label="Location" value={form.location} onChange={(v) => setField("location", v)} testId="builder-location" />
      </div>
      <Field id="card-booking" label="Booking link" value={form.booking_url} onChange={(v) => setField("booking_url", v)} testId="builder-booking" />
      <div className="space-y-1.5">
        <Label htmlFor="card-socials">Social links — one per line as “Label|URL”</Label>
        <Textarea
          id="card-socials"
          rows={3}
          value={socialsText}
          onChange={(e) => setSocialsText(e.target.value)}
          placeholder="LinkedIn|https://linkedin.com/in/you"
          data-testid="builder-socials"
        />
      </div>
    </div>
  );
}

export function StyleTab({ form, setField }: { form: CardInput; setField: SetField }) {
  return (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block">Template</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {CARD_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setField("template", t.id)}
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
              onClick={() => setField("orientation", o)}
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
              onClick={() => setField("accent", c)}
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
        <Field id="card-avatar" label="Profile image URL" value={form.avatar_url} onChange={(v) => setField("avatar_url", v)} testId="builder-avatar" />
        <Field id="card-logo" label="Company logo URL" value={form.logo_url} onChange={(v) => setField("logo_url", v)} testId="builder-logo" />
      </div>

      <label className="flex items-center gap-2.5 text-sm" htmlFor="card-published">
        <Checkbox
          id="card-published"
          checked={form.published}
          onCheckedChange={(checked) => setField("published", checked === true)}
          data-testid="builder-published"
        />
        Publish this card at its public URL
      </label>
    </div>
  );
}
