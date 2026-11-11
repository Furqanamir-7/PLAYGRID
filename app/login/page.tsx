"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { toast } from "sonner";
import { Shield, KeyRound, Mail, ArrowRight, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === "SUPER_ADMIN" || data.user.role === "ORGANIZER") {
        router.push("/admin");
      } else {
        router.push("/portal");
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[var(--bg)] bg-grid-pattern relative">
      <div className="w-full max-w-md space-y-8 p-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl relative z-10">
        <div className="text-center space-y-3">
          <Logo size="lg" showTagline={true} className="justify-center" />
          <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mt-2">
            Sign in to PLAYGRID
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Access tournament admin controls or your team manager dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-muted)]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--plum-300)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@playgrid.pk"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white focus:outline-none focus:border-[var(--plum-500)] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-muted)]">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[var(--plum-300)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white focus:outline-none focus:border-[var(--plum-500)] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--plum-500)] hover:bg-[var(--plum-300)] hover:text-[var(--bg)] text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials for Viva / Demo */}
        <div className="pt-4 border-t border-[var(--border)] space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--plum-300)] block text-center">
            One-Click Demo Accounts (Academic Viva)
          </span>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => quickFill("admin@playgrid.pk", "Admin@123")}
              className="p-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--plum-900)] text-[var(--text)] border border-[var(--border)] text-center transition-colors font-semibold"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => quickFill("organizer.khi@playgrid.pk", "Organizer@123")}
              className="p-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--plum-900)] text-[var(--text)] border border-[var(--border)] text-center transition-colors font-semibold"
            >
              Organizer
            </button>
            <button
              type="button"
              onClick={() => quickFill("manager.cls@playgrid.pk", "Manager@123")}
              className="p-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--plum-900)] text-[var(--text)] border border-[var(--border)] text-center transition-colors font-semibold"
            >
              Manager
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[var(--text-muted)]">
          Don't have an account?{" "}
          <Link href="/register" className="text-[var(--plum-300)] font-semibold hover:underline">
            Register as Team Manager
          </Link>
        </div>
      </div>
    </div>
  );
}

