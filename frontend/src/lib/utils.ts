import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export function formatRating(n: number | null | undefined) {
  if (n === null || n === undefined) return "N/A"
  return n.toFixed(1)
}
