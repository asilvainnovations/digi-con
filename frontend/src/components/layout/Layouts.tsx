import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { DigiConLogo } from "@/components/brand/DigiConLogo";
import { LoadingState } from "@/components/kit";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/session";
import { cn } from "@/lib/utils";
import AppShell from "@/components/layout/AppShell";

const PUBLIC_LINKS = [
  { to: "/pricing", label: "Pricing" },
  { to: "/use-cases", label: "Use Cases" },
  { to: "/blog", label: "Blog" },
  { to: "/resources", label: "Resources" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
];

const FOOTER_LINKS = [
  { to: "/support", label: "Support" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/cookies", label: "Cookie Policy" },
  { to: "/accessibility", label: "Accessibility" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="glass-soft sticky top-0 z-40 border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <DigiConLogo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Site navigation">
            {PUBLIC_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="dense rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:bg-secondary/60 hover:text-foreground"
                data-testid={`public-nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to={user ? "/dashboard" : "/login"}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
              data-testid="public-nav-login"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
            <Link
              to={user ? "/dashboard" : "/signup"}
              className={buttonVariants({ size: "sm" })}
              data-testid="public-nav-cta"
            >
              Create Your DigiCon
            </Link>
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open menu" data-testid="public-menu-trigger">
                    <Menu className="h-5 w-5" aria-hidden />
                  </Button>
                }
              />
              <SheetContent side="right" className="w-[84vw] max-w-xs bg-[#07132a] px-4">
                <SheetHeader>
                  <SheetTitle className="font-heading">DigiCon</SheetTitle>
                </SheetHeader>
                <nav className="mt-4 space-y-1" aria-label="Mobile site navigation">
                  {[...PUBLIC_LINKS, ...FOOTER_LINKS].map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      className="dense flex min-h-[44px] items-center rounded-lg px-3 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      data-testid={`mobile-nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-border/60 bg-[#040a18]/80">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <DigiConLogo />
              <p className="dense mt-3 text-sm text-muted-foreground">
                Your professional identity. Your connections. Your network. Create. Share. Connect.
                Remember. Follow Up. Grow.
              </p>
            </div>
            <nav className="grid grid-cols-2 gap-x-8 gap-y-2" aria-label="Legal and support">
              {[...PUBLIC_LINKS, ...FOOTER_LINKS].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="dense text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  data-testid={`footer-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="dense mt-8 text-xs text-muted-foreground">
            © {new Date().getFullYear()} DigiCon. Built for people who meet people.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function Protected({
  children,
  adminOnly = false,
  bare = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
  bare?: boolean;
}) {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <LoadingState label="Checking your session…" testId="auth-loading" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!user.onboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (bare) return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}
