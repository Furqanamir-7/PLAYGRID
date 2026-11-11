"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { 
  Trophy, 
  Calendar, 
  Shield, 
  MapPin, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard,
  Users
} from "lucide-react";

interface NavbarProps {
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Tournaments", href: "/tournaments", icon: Trophy },
    { name: "Matches", href: "/matches", icon: Calendar },
    { name: "Teams", href: "/teams", icon: Shield },
    { name: "Venues", href: "/venues", icon: MapPin },
  ];

  const isAdminOrOrg = user?.role === "SUPER_ADMIN" || user?.role === "ORGANIZER";
  const isTeamManager = user?.role === "TEAM_MANAGER";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with 9-dot icon */}
        <div className="flex items-center gap-8">
          <Logo size="md" showTagline={false} />
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white bg-[var(--plum-900)] text-[var(--plum-100)]"
                      : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface)]"
                  }`}
                >
                  <Icon className="w-4 h-4 text-[var(--plum-300)]" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Controls & Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Admin Panel button - Only for Admins / Organizers */}
              {isAdminOrOrg && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-[var(--plum-700)] text-white hover:bg-[var(--plum-500)] transition-all shadow-sm shadow-[var(--plum-900)]"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Admin Panel
                </Link>
              )}

              {/* Team Portal - for Team Managers */}
              {isTeamManager && (
                <Link
                  href="/portal"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-[var(--surface-2)] text-[var(--plum-300)] hover:text-white hover:bg-[var(--plum-900)] border border-[var(--border)] transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  My Portal
                </Link>
              )}

              {/* User Dropdown / Profile pill */}
              <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)]">
                <div className="w-6 h-6 rounded-full bg-[var(--plum-700)] flex items-center justify-center text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-medium text-white leading-tight">
                    {user.name.split(" ")[0]}
                  </span>
                  <span className="text-[10px] text-[var(--plum-300)] uppercase font-semibold leading-tight">
                    {user.role === "SUPER_ADMIN" ? "Super Admin" : user.role === "ORGANIZER" ? "Organizer" : "Manager"}
                  </span>
                </div>
                <form action="/api/auth/logout" method="POST" className="ml-1">
                  <button
                    type="submit"
                    title="Log out"
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-[var(--plum-500)] text-white hover:bg-[var(--plum-300)] hover:text-[var(--bg)] transition-all shadow-md shadow-[var(--plum-900)]/30"
              >
                Register Team
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {user && isAdminOrOrg && (
            <Link
              href="/admin"
              className="p-1.5 rounded-lg bg-[var(--plum-900)] text-[var(--plum-300)] text-xs font-semibold"
            >
              Admin
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface)]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 space-y-3">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? "text-white bg-[var(--plum-900)] font-semibold"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 text-[var(--plum-300)]" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[var(--border)]">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 bg-[var(--surface-2)] rounded-lg">
                  <div>
                    <div className="text-sm font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-[var(--plum-300)]">{user.role}</div>
                  </div>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 text-xs text-[var(--danger)] hover:underline"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </form>
                </div>

                {isAdminOrOrg && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center text-xs font-semibold uppercase tracking-wider rounded-lg bg-[var(--plum-500)] text-white"
                  >
                    Go to Admin Panel
                  </Link>
                )}

                {isTeamManager && (
                  <Link
                    href="/portal"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center text-xs font-semibold uppercase tracking-wider rounded-lg bg-[var(--surface-2)] text-[var(--plum-100)] border border-[var(--border)]"
                  >
                    Go to Manager Portal
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-medium rounded-lg bg-[var(--surface-2)] text-white border border-[var(--border)]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-semibold rounded-lg bg-[var(--plum-500)] text-white"
                >
                  Register Team
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

