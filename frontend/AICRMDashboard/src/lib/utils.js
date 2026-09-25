import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and de-duplicate conflicting Tailwind classes.
 * The canonical shadcn/ui helper.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Return the uppercase initials for a name (e.g. "Sujon Ahmed" -> "SA", "Globex - AI" -> "GA"). */
export function initials(name = "") {
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
