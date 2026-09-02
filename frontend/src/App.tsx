import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { Protected } from "@/components/layout/Layouts";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import PublicCard from "@/pages/PublicCard";
import Pricing from "@/pages/Pricing";
import InfoPage from "@/pages/InfoPage";
import NotFound from "@/pages/NotFound";
import { Blog, BlogArticle } from "@/pages/Blog";
// Billing pulls the payments UI; the app pages pull the charting vendor bundle. Both were
// in the entry graph, so a first-time visitor — or anyone scanning a QR code to view a
// public card — downloaded the entire signed-in application before the card could paint.
// Everything behind authentication is split out.
const Billing = lazy(() => import("@/pages/Billing").then((m) => ({ default: m.Billing })));
const Checkout = lazy(() => import("@/pages/Billing").then((m) => ({ default: m.Checkout })));
const PaymentCancel = lazy(() => import("@/pages/Billing").then((m) => ({ default: m.PaymentCancel })));
const PaymentSuccess = lazy(() => import("@/pages/Billing").then((m) => ({ default: m.PaymentSuccess })));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const MyCards = lazy(() => import("@/pages/MyCards"));
const CardBuilder = lazy(() => import("@/pages/CardBuilder"));
const Share = lazy(() => import("@/pages/Share"));
const Contacts = lazy(() => import("@/pages/Contacts"));
const ContactDetail = lazy(() => import("@/pages/ContactDetail"));
const FollowUps = lazy(() => import("@/pages/FollowUps"));
const Crm = lazy(() => import("@/pages/Crm"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const WalletExport = lazy(() => import("@/pages/WalletExport"));
const LandingPwa = lazy(() => import("@/pages/LandingPwa"));
const Settings = lazy(() => import("@/pages/Settings"));
const Admin = lazy(() => import("@/pages/Admin"));

const INFO_PATHS = [
  "/about",
  "/faq",
  "/use-cases",
  "/resources",
  "/support",
  "/terms",
  "/privacy",
  "/cookies",
  "/accessibility",
];

/** Shown while a route chunk downloads. Deliberately minimal — a spinner that replaces
 *  the whole screen reads as slower than one that does not. */
function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-sky" aria-hidden />
    </div>
  );
}

export default function App() {
  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogArticle />} />
        <Route path="/c/:slug" element={<PublicCard />} />
        {INFO_PATHS.map((path) => (
          <Route key={path} path={path} element={<InfoPage />} />
        ))}

        {/* Protected */}
        <Route path="/onboarding" element={<Protected bare><Onboarding /></Protected>} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/cards" element={<Protected><MyCards /></Protected>} />
        <Route path="/cards/new" element={<Protected><CardBuilder /></Protected>} />
        <Route path="/cards/:cardId" element={<Protected><CardBuilder /></Protected>} />
        <Route path="/share" element={<Protected><Share /></Protected>} />
        <Route path="/contacts" element={<Protected><Contacts /></Protected>} />
        <Route path="/contacts/:relId" element={<Protected><ContactDetail /></Protected>} />
        <Route path="/followups" element={<Protected><FollowUps /></Protected>} />
        <Route path="/crm" element={<Protected><Crm /></Protected>} />
        <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
        <Route path="/wallet" element={<Protected><WalletExport /></Protected>} />
        <Route path="/landing-pwa" element={<Protected><LandingPwa /></Protected>} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />
        <Route path="/billing" element={<Protected><Billing /></Protected>} />
        <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
        <Route path="/payment/success" element={<Protected><PaymentSuccess /></Protected>} />
        <Route path="/payment/cancel" element={<Protected><PaymentCancel /></Protected>} />

        {/* Super admin */}
        <Route path="/admin" element={<Protected adminOnly><Admin /></Protected>} />

        {/* Fallback — a real 404, not the landing page rendered at 200 */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster position="top-center" richColors />
      <InstallPrompt />
    </>
  );
}
