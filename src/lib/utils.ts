
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts pixels to mm using a standard 96 DPI conversion rate
 * @param px - Pixels to convert
 * @returns Equivalent in millimeters
 */
export function pxToMm(px: number): number {
  // 1 inch = 25.4 mm, standard screen resolution is 96 DPI
  return px * 25.4 / 96;
}

/**
 * Converts millimeters to pixels using a standard 96 DPI conversion rate
 * @param mm - Millimeters to convert
 * @returns Equivalent in pixels
 */
export function mmToPx(mm: number): number {
  // 1 inch = 25.4 mm, standard screen resolution is 96 DPI
  return mm * 96 / 25.4;
}

/**
 * Ensure text fits within a container by truncating if necessary
 * @param text - The text to check
 * @param maxLength - Maximum allowed length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
