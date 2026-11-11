import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Trophy, Shield, Database, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col with Image Logo */}
          <div className="space-y-4 md:col-span-1">
            <Image
              src="/brand/logo.png"
              alt="PLAYGRID"
              width={180}
              height={50}
              className="object-contain"
            />
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Pakistan's comprehensive sports tournament management system and relational database project. Built for futsal leagues, knockouts, live standings, and stats.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--plum-300)] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
              DBMS 3NF Project
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white font-['Space_Grotesk']">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tournaments" className="hover:text-[var(--plum-300)] transition-colors">
                  Tournaments & Leagues
                </Link>
              </li>
              <li>
                <Link href="/matches" className="hover:text-[var(--plum-300)] transition-colors">
                  Fixtures & Results
                </Link>
              </li>
              <li>
                <Link href="/teams" className="hover:text-[var(--plum-300)] transition-colors">
                  Teams & Clubs
                </Link>
              </li>
              <li>
                <Link href="/venues" className="hover:text-[var(--plum-300)] transition-colors">
                  Venues & Arenas
                </Link>
              </li>
            </ul>
          </div>

          {/* Cities Covered */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white font-['Space_Grotesk']">
              Host Cities
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <span className="text-[var(--text-muted)] hover:text-white">Karachi</span>
              <span className="text-[var(--text-muted)] hover:text-white">Lahore</span>
              <span className="text-[var(--text-muted)] hover:text-white">Islamabad</span>
              <span className="text-[var(--text-muted)] hover:text-white">Rawalpindi</span>
              <span className="text-[var(--text-muted)] hover:text-white">Peshawar</span>
              <span className="text-[var(--text-muted)] hover:text-white">Faisalabad</span>
              <span className="text-[var(--text-muted)] hover:text-white">Multan</span>
              <span className="text-[var(--text-muted)] hover:text-white">Quetta</span>
            </div>
          </div>

          {/* Academic & Database Rigor */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white font-['Space_Grotesk']">
              Database Project
            </h4>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Demonstrates 21 normalized tables (3NF), PostgreSQL triggers, ranked views, and transactional stored procedures.
            </p>
            <div className="flex flex-col gap-1.5 text-xs">
              <Link href="/admin/sql-lab" className="text-[var(--plum-300)] hover:underline flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                SQL Demonstration Lab
              </Link>
              <span className="text-[11px] text-[var(--text-muted)]">
                Asia/Karachi Timezone · PKR Currency
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} PLAYGRID. All rights reserved. Pakistan's Futsal, Organised.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-white transition-colors">
              Organizer Login
            </Link>
            <span>·</span>
            <Link href="/register" className="hover:text-white transition-colors">
              Manager Signup
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

