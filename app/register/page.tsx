"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { toast } from "sonner";
import { User, Mail, KeyRound, Phone, ArrowRight, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      toast.success("Account created successfully! Welcome to PLAYGRID.");
      router.push("/portal");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[var(--bg)] bg-grid-pattern relative py-12">
      <div className="w-full max-w-md space-y-6 p-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          <Logo size="lg" showTagline={true} className="justify-center" />
          <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mt-2">
            Team Manager Registration
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Create your manager account to register teams and submit tournament squads
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-muted)]">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[var(--plum-300)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ahmed Raza"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white focus:outline-none focus:border-[var(--plum-500)]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-muted)]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--plum-300)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="manager@playgrid.pk"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white focus:outline-none focus:border-[var(--plum-500)]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-muted)]">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[var(--plum-300)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white focus:outline-none focus:border-[var(--plum-500)]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-muted)]">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[var(--plum-300)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white focus:outline-none focus:border-[var(--plum-500)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--plum-500)] hover:bg-[var(--plum-300)] hover:text-[var(--bg)] text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Complete Registration"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--plum-300)] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

