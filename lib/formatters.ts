import { format } from "date-fns";

export function formatPKR(amount: number | string | null | undefined): string {
  if (amount == null) return "Rs 0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Rs 0";
  return `Rs ${num.toLocaleString("en-PK")}`;
}

export function formatMatchDate(date: Date | string | null | undefined): string {
  if (!date) return "TBD";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "TBD";
  // Format: Sat, 15 Nov 2026 · 8:00 PM
  return format(d, "EEE, dd MMM yyyy · h:mm a");
}

export function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return "TBD";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "TBD";
  return format(d, "dd MMM yyyy");
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return format(d, "h:mm a");
}

