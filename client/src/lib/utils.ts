import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Derive a stable exercise id from a display name.
 * MUST stay byte-identical to the original seed scheme (each non-alphanumeric
 * char becomes a dash, no collapsing) so historical log/PR ids keep resolving.
 *   "Goblet Squat"  -> "goblet-squat"
 *   "Single-Arm Row" -> "single-arm-row"
 *   "World's Greatest Stretch" -> "world-s-greatest-stretch"
 */
export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "-");
}

/** Humanize an id when no nicer name is available: "goblet-squat" -> "goblet squat". */
export function humanizeId(id: string): string {
  return id.replace(/-+/g, " ").trim();
}
