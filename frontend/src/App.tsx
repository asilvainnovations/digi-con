import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { Protected } from "@/components/layout/Layouts";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import MyCards from "@/pages/MyCards";
import CardBuilder from "@/pages/CardBuilder";
import Share from "@/pages/Share";
import PublicCard from "@/pages/PublicCard";
import Contacts from "@/pages/Contacts";
import ContactDetail from "@/pages/ContactDetail";
import FollowUps from "@/pages/FollowUps";
import Crm from "@/pages/Crm";
import Analytics from "@/pages/Analytics";
import WalletExport from "@/pages/WalletExport";
import LandingPwa from "@/pages/LandingPwa";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import Pricing from "@/pages/Pricing";
import InfoPage from "@/pages/InfoPage";
import { Blog, BlogArticle } from "@/pages/Blog";
import { Billing, Checkout, PaymentCancel, PaymentSuccess } from "@/pages/Billing";

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

export default function App() {
  return (
    <>
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

        {/* Fallback */}
        <Route path="*" element={<Landing />} />
      </Routes>
      <Toaster position="top-center" richColors />
      <InstallPrompt />
    </>
  );
}
