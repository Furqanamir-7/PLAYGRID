import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
  href?: string;
  asImage?: boolean;
}

export function Logo({
  size = "md",
  showTagline = false,
  className = "",
  href = "/",
  asImage = false,
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 24, text: "text-lg", imgWidth: 120, imgHeight: 32 },
    md: { icon: 32, text: "text-xl", imgWidth: 160, imgHeight: 44 },
    lg: { icon: 44, text: "text-2xl", imgWidth: 220, imgHeight: 60 },
    xl: { icon: 56, text: "text-4xl", imgWidth: 300, imgHeight: 82 },
  };

  const currentSize = sizeMap[size];

  const content = asImage ? (
    <div className={`flex flex-col items-start ${className}`}>
      <Image
        src="/brand/logo.png"
        alt="PLAYGRID - Pakistan's Futsal, Organised."
        width={currentSize.imgWidth}
        height={currentSize.imgHeight}
        priority
        className="object-contain"
      />
      {showTagline && (
        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--plum-300)] mt-1 font-semibold">
          Pakistan's Futsal, Organised.
        </span>
      )}
    </div>
  ) : (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Precision 3x3 SVG Grid Icon matching the brand graphic */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      >
        <rect width="100" height="100" rx="22" fill="#09080A" />
        <rect x="18" y="18" width="18" height="18" rx="5" fill="#8E4585" />
        <rect x="41" y="18" width="18" height="18" rx="5" fill="#3B1838" />
        <rect x="64" y="18" width="18" height="18" rx="5" fill="#2E132D" />
        <rect x="18" y="41" width="18" height="18" rx="5" fill="#9B4B92" />
        <rect x="41" y="41" width="18" height="18" rx="5" fill="#8E4585" />
        {/* Spotlight White Dot */}
        <circle cx="73" cy="50" r="10" fill="#F4F0F5" className="animate-pulse" />
        <rect x="18" y="64" width="18" height="18" rx="5" fill="#7C3B74" />
        <rect x="41" y="64" width="18" height="18" rx="5" fill="#3B1838" />
        <rect x="64" y="64" width="18" height="18" rx="5" fill="#2E132D" />
      </svg>

      <div className="flex flex-col leading-none">
        <div className="flex items-baseline tracking-tight">
          <span className={`font-bold font-['Space_Grotesk'] text-white ${currentSize.text} tracking-wider`}>
            PLAY
          </span>
          <span className={`font-bold font-['Space_Grotesk'] text-[var(--plum-500)] group-hover:text-[var(--plum-300)] transition-colors ${currentSize.text} tracking-wider`}>
            GRID
          </span>
        </div>
        {showTagline && (
          <span className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-muted)] font-medium mt-1">
            Pakistan's Futsal, Organised.
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

export function LoadingScreen({ text = "Loading PLAYGRID..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg)] bg-grid-pattern">
      <div className="relative mb-6">
        <div className="absolute -inset-4 bg-[var(--plum-900)]/40 rounded-full blur-xl animate-pulse" />
        <Image
          src="/icons/icon.png"
          alt="PLAYGRID"
          width={80}
          height={80}
          className="relative animate-bounce rounded-2xl shadow-2xl shadow-[var(--plum-900)]"
          priority
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[var(--plum-500)] animate-ping" />
        <p className="text-sm font-medium tracking-widest uppercase text-[var(--plum-300)] font-['Space_Grotesk']">
          {text}
        </p>
      </div>
    </div>
  );
}

