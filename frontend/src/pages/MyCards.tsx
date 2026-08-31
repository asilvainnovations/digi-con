import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Lock, Plus, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CardCanvas from "@/components/cards/CardCanvas";
import { EmptyState, ErrorState, LoadingState, SectionHeading } from "@/components/kit";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiDelete, apiGet } from "@/lib/api";
import { useAuth } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { DigitalCard } from "@/types";

export default function MyCards() {
  const { isPaid } = useAuth();
  const qc = useQueryClient();
  const cards = useQuery({ queryKey: ["cards"], queryFn: () => apiGet<DigitalCard[]>("/cards") });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/cards/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      toast.success("Card deleted");
    },
    onError: () => toast.error("Couldn't delete that card"),
  });

  const atFreeLimit = !isPaid && (cards.data?.length ?? 0) >= 1;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeading
        eyebrow="Identity"
        title="My DigiCon cards"
        action={
          atFreeLimit ? (
            <Link to="/pricing" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "text-gold")} data-testid="cards-upgrade-cta">
              <Lock className="mr-2 h-4 w-4" aria-hidden />
              More cards with Pro
            </Link>
          ) : (
            <Link to="/cards/new" className={buttonVariants({ size: "sm" })} data-testid="cards-create-cta">
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              New card
            </Link>
          )
        }
        testId="cards-heading"
      />

      {cards.isLoading && <LoadingState testId="cards-loading" />}
      {cards.isError && <ErrorState testId="cards-error" />}
      {cards.data?.length === 0 && (
        <EmptyState
          title="No cards yet"
          body="Your card is the entry point — create it, share it, then capture who you meet."
          action={
            <Link to="/cards/new" className={buttonVariants({ size: "sm" })} data-testid="cards-empty-cta">
              Create your first card
            </Link>
          }
          testId="cards-empty"
        />
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {cards.data?.map((card) => (
          <div key={card.id} className="space-y-3" data-testid={`card-item-${card.id}`}>
            <CardCanvas card={card} testId={`card-preview-${card.id}`} />
            <div className="glass-soft flex flex-wrap items-center gap-2 rounded-lg p-2.5">
              <Badge variant="secondary" className="dense">
                {card.label}
              </Badge>
              <span className="dense flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" aria-hidden />
                {card.views} views
              </span>
              <Badge variant={card.published ? "outline" : "secondary"} className="dense">
                {card.published ? "Published" : "Draft"}
              </Badge>
              <div className="ml-auto flex items-center gap-1.5">
                <Link
                  to={`/cards/${card.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                  data-testid={`card-edit-${card.id}`}
                >
                  Edit
                </Link>
                <Link
                  to={`/share?card=${card.id}`}
                  className={buttonVariants({ size: "sm" })}
                  data-testid={`card-share-${card.id}`}
                >
                  <Share2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Share
                </Link>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${card.label} card`}
                  onClick={() => remove.mutate(card.id)}
                  data-testid={`card-delete-${card.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
