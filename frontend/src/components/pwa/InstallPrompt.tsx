import { useEffect, useState } from "react";
import { Download, Share, Smartphone, X } from "lucide-react";
import { DigiConMark } from "@/components/brand/DigiConLogo";
import { Button } from "@/components/ui/button";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "digicon.install.dismissedAt";
const SNOOZE_DAYS = 7;
const FIRST_SHOW_DELAY_MS = 12_000;

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function snoozeActive(): boolean {
  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (!Number.isFinite(dismissedAt)) return false;
  return Date.now() - dismissedAt < SNOOZE_DAYS * 24 * 60 * 60 * 1000;
}

function detectPlatform(): "ios" | "android" | "desktop" {
  const ua = window.navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

/**
 * "Install DigiCon" prompt: fires the native flow when the browser offers it, otherwise
 * shows platform instructions. Respects dismissal for 7 days and never shows when the
 * app is already running installed.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const platform = detectPlatform();

  useEffect(() => {
    if (isStandalone() || snoozeActive()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as InstallEvent);
      setOpen(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS/Safari never fires beforeinstallprompt — offer manual instructions instead,
    // and only after the visitor has had a moment with the page.
    const timer = window.setTimeout(() => {
      if (!isStandalone() && !snoozeActive()) setOpen(true);
    }, FIRST_SHOW_DELAY_MS);

    const onInstalled = () => {
      setOpen(false);
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setOpen(false);
    setShowSteps(false);
  };

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setOpen(false);
      } else {
        dismiss();
      }
      setDeferred(null);
      return;
    }
    setShowSteps(true);
  };

  if (!open) return null;

  const steps =
    platform === "ios"
      ? ["Tap the Share button in Safari", "Choose “Add to Home Screen”", "Tap “Add” to finish"]
      : platform === "android"
        ? ["Open the browser menu (⋮)", "Choose “Install app” or “Add to Home screen”", "Confirm “Install”"]
        : ["Open your browser menu", "Choose “Install DigiCon” or “Create shortcut”", "Confirm to install"];

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] sm:pb-[calc(env(safe-area-inset-bottom)+1rem)] lg:pb-4"
      role="dialog"
      aria-modal="false"
      aria-labelledby="install-prompt-title"
      data-testid="install-prompt"
    >
      <div className="glass animate-rise mx-auto max-w-md rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <DigiConMark glow className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <h2 id="install-prompt-title" className="font-heading text-base font-bold" data-testid="install-prompt-title">
              Install DigiCon
            </h2>
            <p className="dense mt-1 text-sm text-muted-foreground">
              Keep your professional identity and connections one tap away. Install DigiCon on your
              home screen for a faster, app-like experience.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Dismiss install prompt"
            onClick={dismiss}
            data-testid="install-prompt-close"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        {showSteps && (
          <ol className="dense mt-3 space-y-1.5 rounded-xl bg-secondary/50 p-3 text-sm" data-testid="install-prompt-steps">
            {steps.map((step, i) => (
              <li key={step} className="flex items-start gap-2">
                <span className="font-heading mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[0.65rem] font-bold text-sky">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
            <li className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
              {platform === "ios" ? (
                <Share className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Smartphone className="h-3.5 w-3.5" aria-hidden />
              )}
              Works offline once installed.
            </li>
          </ol>
        )}

        <div className="mt-4 flex gap-2">
          <Button className="flex-1" onClick={install} data-testid="install-prompt-install">
            <Download className="mr-2 h-4 w-4" aria-hidden />
            Install DigiCon
          </Button>
          <Button variant="ghost" onClick={dismiss} data-testid="install-prompt-later">
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
}
