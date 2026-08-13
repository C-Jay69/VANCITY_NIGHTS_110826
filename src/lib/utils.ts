import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FALLBACK_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='#0b1020'/><rect x='8' y='8' width='584' height='384' rx='16' fill='none' stroke='#1e2a4a' stroke-width='2'/><g fill='none' stroke='#22d3ee' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'><path d='M300 120c-60 0-108 48-108 108 0 80 108 152 108 152s108-72 108-152c0-60-48-108-108-108z'/><circle cx='300' cy='228' r='34'/></g></svg>`;

export const VENUE_IMAGE_FALLBACK = `data:image/svg+xml,${encodeURIComponent(FALLBACK_SVG)}`;

export function venueImageSrc(url?: string | null) {
  return url && url.trim() ? url : VENUE_IMAGE_FALLBACK;
}

export function venueImgFallback(e: { currentTarget: HTMLImageElement }) {
  const img = e.currentTarget;
  if (img.src !== VENUE_IMAGE_FALLBACK) {
    img.src = VENUE_IMAGE_FALLBACK;
  }
}