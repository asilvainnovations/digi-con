import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  CreditCard,
  Home,
  LayoutGrid,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { DigiConLogo } from "@/components/brand/DigiConLogo";
import { Avatar, PremiumBadge } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth, useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const PRIMARY = [
  { to: "/dashboard", label: "Home", icon: Home, testId: "nav-dashboard" },
  { to: "/cards", label: "Cards", icon: CreditCard, testId: "nav-cards" },
  { to: "/contacts", label: "Network", icon: Users, testId: "nav-contacts" },
  { to: "/followups", label: "Follow Up", icon: ListChecks, testId: "nav-followups" },
  { to: "/settings", label: "Profile", icon: Settings, testId: "nav-settings" },
];

const SECONDARY = [
  { to: "/crm", label: "CRM Pipeline", icon: LayoutGrid, testId: "nav-crm" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, testId: "nav-analytics" },
  { to: "/share", label: "Share & QR", icon: Share2, testId: "nav-share" },
  { to: "/wallet", label: "Wallet & Export", icon: Wallet, testId: "nav-wallet" },
  { to: "/billing", label: "Subscription", icon: Sparkles, testId: "nav-billing" },
];

function NavItem({
  to,
  label,
  icon: Icon,
  testId,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  testId: string;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      data-testid={testId}
      className={({ isActive }) =>
        cn(
          "flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-200",
          isActive
            ? "bg-primary/15 text-sky shadow-[inset_0_0_0_1px_rgba(96,165,250,0.28)]"
            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
        )
      }
    >
      <Icon className="h-4.5 w-4.5" aria-hidden />
      <span className="dense font-medium">{label}</span>
    </NavLink>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, isPaid } = useAuth();
  const { endSession } = useSession();
  const navigate = useNavigate();

  const signOut = async () => {
    await endSession();
    navigate("/login");
  };

  const drawerNav = (close: () => void) => (
    <nav className="mt-4 space-y-1" aria-label="Secondary navigation">
      {[...PRIMARY, ...SECONDARY].map((item) => (
        <NavItem key={item.to} {...item} onNavigate={close} />
      ))}
      {isAdmin && (
        <NavItem to="/admin" label="Super Admin" icon={Shield} testId="nav-admin" onNavigate={close} />
      )}
    </nav>
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-[#071227]/80 px-4 py-5 backdrop-blur-md lg:flex">
          <DigiConLogo to="/dashboard" />
          <nav className="mt-7 space-y-1" aria-label="Main navigation">
            {PRIMARY.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>
          <p className="label-caps mt-6 px-3">Grow</p>
          <nav className="mt-2 space-y-1" aria-label="Growth tools">
            {SECONDARY.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
            {isAdmin && <NavItem to="/admin" label="Super Admin" icon={Shield} testId="nav-admin-desktop" />}
          </nav>
          <div className="mt-auto space-y-3 pt-5">
            {!isPaid && (
              <Link
                to="/pricing"
                className="metal-edge block rounded-lg p-3 transition-transform duration-200 hover:-translate-y-0.5"
                data-testid="sidebar-upgrade-card"
              >
                <p className="font-heading text-sm font-bold gold-text">Unlock DigiCon Pro</p>
                <p className="dense mt-1 text-xs text-muted-foreground">
                  Analytics, CRM pipeline, wallet export and more cards.
                </p>
              </Link>
            )}
            <div className="glass-soft flex items-center gap-2.5 rounded-lg p-2.5">
              <Avatar name={user?.name ?? "DigiCon"} url={user?.avatar_url || undefined} size="sm" testId="sidebar-avatar" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium" data-testid="sidebar-user-name">
                  {user?.name}
                </p>
                <p className="dense truncate text-[0.7rem] text-muted-foreground">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={signOut}
                aria-label="Sign out"
                data-testid="sidebar-signout"
              >
                <LogOut className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile top bar */}
          <header className="glass-soft sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden">
            <DigiConLogo to="/dashboard" />
            <div className="flex items-center gap-2">
              {isPaid && <PremiumBadge />}
              <Sheet>
                <SheetTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" aria-label="Open menu" data-testid="mobile-menu-trigger">
                      <Menu className="h-5 w-5" aria-hidden />
                    </Button>
                  }
                />
                <SheetContent side="right" className="w-[86vw] max-w-xs border-border bg-[#07132a] px-4">
                  <SheetHeader>
                    <SheetTitle className="font-heading">Menu</SheetTitle>
                  </SheetHeader>
                  <MobileDrawerBody render={drawerNav} onSignOut={signOut} email={user?.email ?? ""} />
                </SheetContent>
              </Sheet>
            </div>
          </header>

          <main className="px-4 pb-32 pt-5 sm:px-6 lg:pb-10 lg:pt-8">{children}</main>
        </div>
      </div>

      {/* Persistent mobile bottom navigation */}
      <nav
        className="glass fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t border-border/70 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
        aria-label="Primary navigation"
        data-testid="bottom-navigation"
      >
        {PRIMARY.map(({ to, label, icon: Icon, testId }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            data-testid={`bottom-${testId}`}
            className={({ isActive }) =>
              cn(
                "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg text-[0.68rem] transition-colors duration-200",
                isActive ? "bg-primary/15 text-sky" : "text-muted-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_rgba(56,189,248,0.55)]")} aria-hidden />
                <span className="dense font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function MobileDrawerBody({
  render,
  onSignOut,
  email,
}: {
  render: (close: () => void) => ReactNode;
  onSignOut: () => void;
  email: string;
}) {
  return (
    <div className="flex h-full flex-col pb-6">
      {render(() => {
        const el = document.activeElement as HTMLElement | null;
        el?.blur();
      })}
      <div className="mt-auto space-y-2 pt-6">
        <p className="dense text-xs text-muted-foreground">{email}</p>
        <Button variant="outline" className="w-full" onClick={onSignOut} data-testid="drawer-signout">
          <LogOut className="mr-2 h-4 w-4" aria-hidden />
          Sign out
        </Button>
      </div>
    </div>
  );
}
