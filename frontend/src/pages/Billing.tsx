import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ErrorState, PremiumBadge, SectionHeading } from "@/components/kit";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api";
import { meKey, useAuth } from "@/lib/session";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { CheckoutResponse, PaymentStatus, PlanOption, User } from "@/types";

const FEATURES = [
  "Unlimited DigiCon cards",
  "CRM pipeline view",
  "Networking analytics & badges",
  "Card image and vCard export",
  "Apple & Google Wallet identity",
  "Personal landing PWA templates",
];

export function Checkout() {
  const [params] = useSearchParams();
  const planId = params.get("plan") ?? "pro_monthly";
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => apiGet<PlanOption[]>("/payments/plans") });
  const plan = plans.data?.find((p) => p.id === planId);

  const start = useMutation({
    mutationFn: () =>
      apiPost<CheckoutResponse>("/payments/checkout", { plan_id: planId, origin_url: window.location.origin }),
    onSuccess: (res) => {
      window.location.href = res.checkout_url;
    },
    onError: () => toast.error("We couldn't start checkout. Please try again."),
  });

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <SectionHeading eyebrow="Checkout" title="Upgrade to DigiCon Pro" testId="checkout-heading" />
      <section className="metal-edge rounded-2xl p-6" data-testid="checkout-summary">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label-caps">Selected plan</p>
            <p className="font-heading text-xl font-extrabold gold-text" data-testid="checkout-plan-label">
              {plan?.label ?? "DigiCon Pro"}
            </p>
            <p className="dense mt-1 text-sm text-muted-foreground" data-testid="checkout-plan-period">
              Billed per {plan?.period ?? "month"}
            </p>
          </div>
          <p className="metric text-2xl" data-testid="checkout-plan-price">
            ${plan?.amount ?? 19}
          </p>
        </div>
        <ul className="dense mt-5 space-y-2 text-sm">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
        <Button
          className="mt-6 w-full bg-gold text-[#1a1200] hover:bg-gold-metal"
          onClick={() => start.mutate()}
          disabled={start.isPending || plans.isLoading}
          data-testid="checkout-pay-button"
        >
          <CreditCard className="mr-2 h-4 w-4" aria-hidden />
          {start.isPending ? "Opening secure checkout…" : "Continue to secure payment"}
        </Button>
        <p className="dense mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Payment is processed by Stripe in test mode. Your plan unlocks only after the backend
          verifies the payment. Test card: 4242 4242 4242 4242.
        </p>
      </section>
      <Link to="/pricing" className="dense block text-center text-sm text-muted-foreground hover:text-foreground" data-testid="checkout-back">
        Compare plans again
      </Link>
    </div>
  );
}

export function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id") ?? "";
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(0);
  const [state, setState] = useState<"pending" | "paid" | "timeout">("pending");

  const status = useQuery({
    queryKey: ["payment-status", sessionId, attempts],
    queryFn: () => apiGet<PaymentStatus>(`/payments/status/${sessionId}`),
    enabled: Boolean(sessionId) && state === "pending",
    retry: false,
  });

  // Polls only while state === "pending"; `status.data` + `attempts` are the only inputs that
  // should retrigger it. `navigate`/`sessionId` are stable for the life of this screen.
  useEffect(() => {
    if (!status.data) return;
    if (status.data.payment_status === "paid") {
      setState("paid");
      apiGet<User>("/auth/me")
        .then((user) => queryClient.setQueryData(meKey, user))
        .catch(() => undefined);
      return;
    }
    if (attempts >= 8) {
      setState("timeout");
      return;
    }
    const t = setTimeout(() => setAttempts((a) => a + 1), 2000);
    return () => clearTimeout(t);
  }, [status.data, attempts]);

  if (!sessionId) return <ErrorState label="Missing checkout session." testId="payment-success-missing" />;

  return (
    <div className="mx-auto max-w-md py-8 text-center">
      <div className="glass rounded-2xl p-8" data-testid="payment-success-panel">
        {state === "pending" && (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-sky" aria-hidden />
            <h1 className="font-heading mt-4 text-xl font-extrabold">Confirming your payment…</h1>
            <p className="dense mt-2 text-sm text-muted-foreground">
              We're verifying the payment with Stripe before unlocking Pro.
            </p>
          </>
        )}
        {state === "paid" && (
          <>
            <CheckCircle2 className="mx-auto h-9 w-9 text-accent" aria-hidden />
            <div className="mt-3 flex justify-center">
              <PremiumBadge label="Pro unlocked" />
            </div>
            <h1 className="font-heading mt-3 text-xl font-extrabold" data-testid="payment-success-heading">
              You're on DigiCon Pro
            </h1>
            <p className="dense mt-2 text-sm text-muted-foreground">
              Analytics, CRM pipeline, wallet export and unlimited cards are now unlocked.
            </p>
            <Button className="mt-5 w-full" onClick={() => navigate("/analytics")} data-testid="payment-success-cta">
              Open my analytics
            </Button>
          </>
        )}
        {state === "timeout" && (
          <>
            <XCircle className="mx-auto h-8 w-8 text-destructive" aria-hidden />
            <h1 className="font-heading mt-4 text-xl font-extrabold">Still processing</h1>
            <p className="dense mt-2 text-sm text-muted-foreground">
              Stripe hasn't confirmed the payment yet. Your plan will unlock automatically once it
              settles — check your subscription page in a few minutes.
            </p>
            <Link to="/billing" className={cn(buttonVariants({ variant: "outline" }), "mt-5 w-full")} data-testid="payment-timeout-cta">
              Go to billing
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export function PaymentCancel() {
  return (
    <div className="mx-auto max-w-md py-8 text-center">
      <div className="glass rounded-2xl p-8" data-testid="payment-cancel-panel">
        <XCircle className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
        <h1 className="font-heading mt-4 text-xl font-extrabold">Checkout cancelled</h1>
        <p className="dense mt-2 text-sm text-muted-foreground">
          No payment was taken. Your free workspace is exactly as you left it.
        </p>
        <Link to="/pricing" className={cn(buttonVariants(), "mt-5 w-full")} data-testid="payment-cancel-cta">
          Back to pricing
        </Link>
      </div>
    </div>
  );
}

export function Billing() {
  const { user, isPaid } = useAuth();
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => apiGet<PlanOption[]>("/payments/plans") });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <SectionHeading eyebrow="Billing" title="Subscription" testId="billing-heading" />
      <section className="glass rounded-xl p-5" data-testid="billing-panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="label-caps">Current plan</p>
            <p className="font-heading text-xl font-extrabold" data-testid="billing-plan">
              {isPaid ? "DigiCon Pro" : "DigiCon Free"}
            </p>
            <p className="dense mt-1 text-sm text-muted-foreground">{user?.email}</p>
          </div>
          {isPaid && <PremiumBadge />}
        </div>
        {!isPaid && (
          <div className="mt-5 space-y-2">
            {plans.data?.map((p) => (
              <Link
                key={p.id}
                to={`/checkout?plan=${p.id}`}
                className="glass-soft flex items-center justify-between rounded-lg p-3 transition-colors duration-200 hover:border-primary/40"
                data-testid={`billing-plan-${p.id}`}
              >
                <span className="dense text-sm">{p.label}</span>
                <span className="metric text-sm text-sky">${p.amount}</span>
              </Link>
            ))}
          </div>
        )}
        {isPaid && (
          <p className="dense mt-4 text-sm text-muted-foreground">
            Your Pro features are active. Subscription state is verified server-side from your
            payment records — nothing is unlocked by the browser alone.
          </p>
        )}
      </section>
    </div>
  );
}
