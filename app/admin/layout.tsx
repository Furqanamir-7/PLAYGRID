import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";
import { 
  LayoutDashboard, 
  Trophy, 
  Calendar, 
  Users, 
  FileCheck, 
  CreditCard, 
  MapPin, 
  ShieldCheck, 
  UserCog, 
  History, 
  Database, 
  LogOut, 
  ArrowLeft 
} from "lucide-react";


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Route Guard: Admin & Organizer only
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ORGANIZER")) {
    redirect("/login");
  }

  const isSuperAdmin = user.role === "SUPER_ADMIN";

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Tournaments", href: "/admin/tournaments", icon: Trophy },
    { name: "Matches & Results", href: "/admin/matches", icon: Calendar },
    { name: "Registrations", href: "/admin/registrations", icon: FileCheck },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Teams & Clubs", href: "/admin/teams", icon: Users },
    { name: "Players", href: "/admin/players", icon: Users },
    { name: "Venues", href: "/admin/venues", icon: MapPin },
    { name: "Referees", href: "/admin/referees", icon: ShieldCheck },
    ...(isSuperAdmin ? [{ name: "Users & Roles", href: "/admin/users", icon: UserCog }] : []),
    { name: "Audit Log", href: "/admin/audit-log", icon: History },
    ...(isSuperAdmin ? [{ name: "SQL Demonstration Lab", href: "/admin/sql-lab", icon: Database }] : []),
  ];

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--text)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--surface)] hidden md:flex flex-col shrink-0">
        <div className="p-6 border-b border-[var(--border)]">
          <Logo size="md" showTagline={true} href="/admin" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-2)] transition-colors group"
              >
                <Icon className="w-4 h-4 text-[var(--plum-300)] group-hover:text-white transition-colors" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Badge & Actions */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-2)]/40 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--plum-700)] text-white font-bold flex items-center justify-center text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-[var(--plum-300)] uppercase font-semibold">
                {user.role}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]">
            <Link
              href="/"
              className="text-[var(--text-muted)] hover:text-white flex items-center gap-1 text-[11px]"
            >
              <ArrowLeft className="w-3 h-3" /> Public Site
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-[var(--danger)] hover:underline flex items-center gap-1 text-[11px]"
              >
                <LogOut className="w-3 h-3" /> Logout
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--plum-300)] font-['Space_Grotesk']">
              Official Tournament Control Panel
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/admin/sql-lab"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--plum-900)] text-[var(--plum-100)] border border-[var(--plum-700)] font-semibold"
            >
              <Database className="w-3.5 h-3.5 text-[var(--plum-300)]" />
              SQL Lab (Demo)
            </Link>
            <Link
              href="/"
              className="px-3 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
            >
              Back to Home
            </Link>
          </div>
        </header>

        <main className="p-4 sm:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}

