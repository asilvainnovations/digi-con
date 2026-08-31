import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Copy, Download, Link2, Mail, MessageSquare, Nfc, QrCode, Wallet } from "lucide-react";
import { toast } from "sonner";
import CardCanvas from "@/components/cards/CardCanvas";
import { EmptyState, ErrorState, LoadingState, PremiumBadge, SectionHeading } from "@/components/kit";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { DigitalCard } from "@/types";

export default function Share() {
  const [params] = useSearchParams();
  const { isPaid } = useAuth();
  const cards = useQuery({ queryKey: ["cards"], queryFn: () => apiGet<DigitalCard[]>("/cards") });
  const [selected, setSelected] = useState<string | null>(params.get("card"));

  const card = useMemo(() => {
    const list = cards.data ?? [];
    return list.find((c) => c.id === selected) ?? list[0];
  }, [cards.data, selected]);

  const publicUrl = card ? `${window.location.origin}/c/${card.slug}` : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Link copied — paste it anywhere");
    } catch {
      toast.error("Copy failed — select the link and copy it manually");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SectionHeading eyebrow="Connect" title="Share your DigiCon" testId="share-heading" />

      {cards.isLoading && <LoadingState testId="share-loading" />}
      {cards.isError && <ErrorState testId="share-error" />}
      {cards.data?.length === 0 && (
        <EmptyState
          title="No card to share yet"
          body="Create your DigiCon card first — then share it by QR, link, SMS, email or chat."
          action={
            <Link to="/cards/new" className={buttonVariants({ size: "sm" })} data-testid="share-empty-cta">
              Create Card
            </Link>
          }
          testId="share-empty"
        />
      )}

      {card && (
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            {(cards.data?.length ?? 0) > 1 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {cards.data?.map((c) => (
                  <Button
                    key={c.id}
                    size="sm"
                    variant={c.id === card.id ? "default" : "outline"}
                    onClick={() => setSelected(c.id)}
                    data-testid={`share-select-${c.id}`}
                  >
                    {c.label}
                  </Button>
                ))}
              </div>
            )}
            <CardCanvas card={card} testId="share-card-preview" />
          </div>

          <div className="space-y-4">
            <div className="glass rounded-xl p-5 text-center">
              <p className="label-caps">Scan to connect</p>
              <img
                src={`/api/public/cards/${card.slug}/qr.png`}
                alt={`QR code for ${card.name}'s DigiCon card`}
                className="mx-auto mt-3 h-44 w-44 rounded-xl border border-border bg-white p-2"
                data-testid="share-qr-image"
              />
              <p className="dense mt-3 break-all text-sm text-sky" data-testid="share-public-url">
                {publicUrl}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button size="sm" onClick={copy} data-testid="share-copy-link">
                  <Copy className="mr-2 h-4 w-4" aria-hidden />
                  Copy link
                </Button>
                <a
                  href={`/c/${card.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                  data-testid="share-open-public"
                >
                  <Link2 className="mr-2 h-4 w-4" aria-hidden />
                  Open card
                </a>
              </div>
            </div>

            <div className="glass rounded-xl p-5">
              <SectionHeading eyebrow="Share via" title="Every way you meet people" />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <a
                  href={`sms:?&body=${encodeURIComponent(`Here's my DigiCon: ${publicUrl}`)}`}
                  className="glass-soft flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm transition-colors duration-200 hover:border-primary/40"
                  data-testid="share-via-sms"
                >
                  <MessageSquare className="h-4 w-4 text-sky" aria-hidden />
                  SMS
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent("My DigiCon card")}&body=${encodeURIComponent(publicUrl)}`}
                  className="glass-soft flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm transition-colors duration-200 hover:border-primary/40"
                  data-testid="share-via-email"
                >
                  <Mail className="h-4 w-4 text-sky" aria-hidden />
                  Email
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(publicUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-soft flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm transition-colors duration-200 hover:border-primary/40"
                  data-testid="share-via-chat"
                >
                  <MessageSquare className="h-4 w-4 text-sky" aria-hidden />
                  Chat
                </a>
                <a
                  href={`/api/public/cards/${card.slug}/vcard`}
                  className="glass-soft flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm transition-colors duration-200 hover:border-primary/40"
                  data-testid="share-via-vcard"
                >
                  <Download className="h-4 w-4 text-sky" aria-hidden />
                  vCard
                </a>
                <span
                  className="glass-soft flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground"
                  title="NFC writes the same public URL from a supported device"
                  data-testid="share-via-nfc"
                >
                  <Nfc className="h-4 w-4" aria-hidden />
                  NFC ready
                </span>
                <Link
                  to="/wallet"
                  className="glass-soft flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm transition-colors duration-200 hover:border-primary/40"
                  data-testid="share-via-wallet"
                >
                  <Wallet className="h-4 w-4 text-gold" aria-hidden />
                  Wallet
                  {!isPaid && <PremiumBadge />}
                </Link>
              </div>
              <p className="dense mt-4 text-xs text-muted-foreground">
                <QrCode className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                Anyone who opens your card can save your contact or send theirs back — no signup needed.
              </p>
              <Link
                to="/contacts"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 w-full")}
                data-testid="share-view-captured"
              >
                See who has connected
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
