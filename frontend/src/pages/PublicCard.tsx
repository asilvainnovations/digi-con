import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Download, Handshake, QrCode } from "lucide-react";
import { toast } from "sonner";
import { DigiConLogo } from "@/components/brand/DigiConLogo";
import CardCanvas from "@/components/cards/CardCanvas";
import { ErrorState, LoadingState } from "@/components/kit";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost } from "@/lib/api";
import type { PublicCardData } from "@/types";

export default function PublicCard() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    met_at: "",
    message: "",
  });

  const card = useQuery({
    queryKey: ["public-card", slug],
    queryFn: () => apiGet<PublicCardData>(`/public/cards/${slug}`),
    retry: false,
  });

  const connect = useMutation({
    mutationFn: () => apiPost<{ ok: boolean; owner_name: string }>(`/public/cards/${slug}/connect`, form),
    onSuccess: () => {
      setDone(true);
      setOpen(false);
      toast.success("Your details are on their way");
    },
    onError: () => toast.error("We couldn't send your details. Please try again."),
  });

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-5 flex items-center justify-between">
          <DigiConLogo />
          <Link to="/signup" className={buttonVariants({ variant: "ghost", size: "sm" })} data-testid="public-card-signup">
            Get your own
          </Link>
        </div>

        {card.isLoading && <LoadingState label="Loading card…" testId="public-card-loading" />}
        {card.isError && (
          <ErrorState label="This DigiCon card isn't available." testId="public-card-error" />
        )}

        {card.data && (
          <div className="animate-rise space-y-4">
            <CardCanvas card={card.data} testId="public-card-canvas" />

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`/api/public/cards/${slug}/vcard`}
                className={buttonVariants({ variant: "outline" })}
                data-testid="public-card-save-contact"
              >
                <Download className="mr-2 h-4 w-4" aria-hidden />
                Save Contact
              </a>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger
                  render={
                    <Button data-testid="public-card-connect-button">
                      <Handshake className="mr-2 h-4 w-4" aria-hidden />
                      Connect
                    </Button>
                  }
                />
                <DialogContent className="glass max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-heading">Share your contact back</DialogTitle>
                  </DialogHeader>
                  <p className="dense text-sm text-muted-foreground">
                    No account needed. {card.data.name} will see how you met and can follow up.
                  </p>
                  <form
                    className="mt-4 space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (form.name.trim().length < 2) {
                        toast.error("Please enter your name.");
                        return;
                      }
                      connect.mutate();
                    }}
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="cx-name">Your name</Label>
                      <Input id="cx-name" value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="connect-name" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="cx-email">Email</Label>
                        <Input id="cx-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="connect-email" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cx-phone">Phone</Label>
                        <Input id="cx-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} data-testid="connect-phone" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="cx-company">Company</Label>
                        <Input id="cx-company" value={form.company} onChange={(e) => set("company", e.target.value)} data-testid="connect-company" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cx-position">Role</Label>
                        <Input id="cx-position" value={form.position} onChange={(e) => set("position", e.target.value)} data-testid="connect-position" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cx-met">Where did you meet?</Label>
                      <Input
                        id="cx-met"
                        value={form.met_at}
                        onChange={(e) => set("met_at", e.target.value)}
                        placeholder="Startup Expo 2026"
                        data-testid="connect-met-at"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cx-message">Note (optional)</Label>
                      <Textarea
                        id="cx-message"
                        rows={2}
                        value={form.message}
                        onChange={(e) => set("message", e.target.value)}
                        placeholder="What you discussed or what you need."
                        data-testid="connect-message"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={connect.isPending} data-testid="connect-submit">
                      {connect.isPending ? "Sending…" : "Send my details"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {done && (
              <div
                className="glass flex items-start gap-3 rounded-xl border-accent/30 p-4"
                role="status"
                data-testid="public-card-connect-success"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                <div>
                  <p className="text-sm font-medium">Connected with {card.data.name}.</p>
                  <p className="dense mt-0.5 text-xs text-muted-foreground">
                    Your details were captured as a relationship record — expect a follow-up.
                  </p>
                </div>
              </div>
            )}

            {card.data.booking_url && (
              <a
                href={card.data.booking_url}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
                data-testid="public-card-booking"
              >
                Book a meeting
              </a>
            )}

            <div className="glass-soft rounded-xl p-4 text-center">
              <QrCode className="mx-auto h-4 w-4 text-sky" aria-hidden />
              <p className="dense mt-2 text-xs text-muted-foreground">
                Powered by DigiCon — your professional identity, your connections, your network.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
