import type { ReactNode } from "react";
import { Link, Navigate, NavLink, useLocation } from "react-router-dom";
import { BookOpen, Home, LayoutDashboard, LogIn, Menu, Tag, Users } from "lucide-react";
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

const PUBLIC_BOTTOM_NAV = [
  { to: "/", label: "Home", icon: Home, testId: "public-bottom-home" },
  { to: "/pricing", label: "Pricing", icon: Tag, testId: "public-bottom-pricing" },
  { to: "/use-cases", label: "Use Cases", icon: Users, testId: "public-bottom-use-cases" },
  { to: "/blog", label: "Blog", icon: BookOpen, testId: "public-bottom-blog" },
];

/**
 * Persistent glass bottom navigation for the marketing surface — the mobile footer is
 * collapsed to legal essentials so this is the primary way to move around on a phone.
 */
function PublicBottomNav() {
  const { user } = useAuth();
  const items = [
    ...PUBLIC_BOTTOM_NAV,
    user
      ? { to: "/dashboard", label: "Workspace", icon: LayoutDashboard, testId: "public-bottom-workspace" }
      : { to: "/login", label: "Sign in", icon: LogIn, testId: "public-bottom-signin" },
  ];
  return (
    <nav
      className="glass fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t border-border/70 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
      aria-label="Primary navigation"
      data-testid="public-bottom-navigation"
    >
      {items.map(({ to, label, icon: Icon, testId }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          aria-label={label}
          data-testid={testId}
          className={({ isActive }) =>
            cn(
              "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg text-[0.68rem] transition-colors duration-200",
              isActive ? "bg-primary/15 text-sky" : "text-muted-foreground",
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_rgba(56,189,248,0.55)]")}
                aria-hidden
              />
              <span className="dense font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

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
      <PublicBottomNav />
      <footer className="mt-16 border-t border-border/60 bg-[#040a18]/80 pb-24 md:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <DigiConLogo />
              <p className="dense mt-3 text-sm text-muted-foreground">
                Your professional identity. Your connections. Your network. Create. Share. Connect.
                Remember. Follow Up. Grow.
              </p>
            </div>
            {/* Full link grid on tablet/desktop; mobile keeps a compact essentials row so the
                persistent bottom navigation stays the primary way to move around. */}
            <nav className="hidden grid-cols-2 gap-x-8 gap-y-2 sm:grid" aria-label="Legal and support">
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
            <nav className="flex flex-wrap gap-x-4 gap-y-2 sm:hidden" aria-label="Legal and support">
              {FOOTER_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="dense text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  data-testid={`footer-mobile-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
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
