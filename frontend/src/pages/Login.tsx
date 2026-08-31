import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { DigiConLogo } from "@/components/brand/DigiConLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost, ApiError } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { User } from "@/types";

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const body = err.body as { detail?: unknown } | null;
    const detail = body?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      return first.msg ?? "Please check the form and try again.";
    }
  }
  return "Something went wrong. Please try again.";
}

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const { beginSession } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const path = isSignup ? "/auth/signup" : "/auth/login";
      const body = isSignup ? { name, email, password } : { email, password };
      return apiPost<User>(path, body);
    },
    onSuccess: async (user) => {
      await beginSession(user);
      toast.success(isSignup ? "Welcome to DigiCon" : `Welcome back, ${user.name.split(" ")[0]}`);
      navigate(user.onboarded ? "/dashboard" : "/onboarding", { replace: true });
    },
    onError: (err) => setError(errorMessage(err)),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isSignup && name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <DigiConLogo />
        </div>
        <div className="glass animate-rise rounded-2xl p-6 sm:p-8">
          <p className="label-caps">{isSignup ? "Create account" : "Sign in"}</p>
          <h1 className="font-heading mt-1 text-2xl font-extrabold">
            {isSignup ? "Create your DigiCon" : "Welcome back"}
          </h1>
          <p className="dense mt-2 text-sm text-muted-foreground">
            {isSignup
              ? "Your identity, your connections and your follow-ups in one workspace."
              : "Pick up where your network left off."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {isSignup && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Maria Santos"
                  data-testid="auth-name-input"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@company.com"
                data-testid="auth-email-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder="At least 8 characters"
                data-testid="auth-password-input"
              />
            </div>
            {error && (
              <p className="dense text-sm text-destructive" role="alert" data-testid="auth-error">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
              data-testid="auth-submit-button"
            >
              {mutation.isPending ? "Please wait…" : isSignup ? "Create Your DigiCon" : "Sign in"}
            </Button>
          </form>

          <p className="dense mt-5 text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account? " : "New to DigiCon? "}
            <Link
              to={isSignup ? "/login" : "/signup"}
              className="text-sky underline-offset-4 hover:underline"
              data-testid="auth-switch-link"
            >
              {isSignup ? "Sign in" : "Create your DigiCon"}
            </Link>
          </p>
        </div>

        <div className="glass-soft mt-4 rounded-xl p-4" data-testid="demo-credentials">
          <p className="label-caps">Demo accounts</p>
          <ul className="dense mt-2 space-y-1 text-xs text-muted-foreground">
            <li>Pro user — maria@digicon.app / DigiCon2026!</li>
            <li>Free user — free@digicon.app / DigiCon2026!</li>
            <li>Super admin — admin@digicon.app / DigiCon2026!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return <AuthPage mode="login" />;
}
