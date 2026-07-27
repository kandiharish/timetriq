import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses a string representation of time into decimal hours.
 * Supported formats:
 * - "4h 34m", "4 hours 34 minutes", "4 hour 34 min", etc.
 * - "2h", "2 hours", "2 hr"
 * - "30m", "30 minutes", "30 min"
 * - "3"   → 3 hours (bare integers default to hours)
 * - "3.4" → 3 hours 40 minutes (decimal part × 100 = minutes, e.g. .4 = 40 min)
 * - "2.5" → 2 hours 30 minutes
 */
export function parseEstimatedTime(input: string): { hours: number; needsClarification: boolean; cleanText: string } {
  const text = input.trim().toLowerCase();

  if (!text) {
    return { hours: 0, needsClarification: false, cleanText: '' };
  }

  // 1. Check if it's a plain number (integer or decimal)
  const numericMatch = text.match(/^(\d+)(?:\.(\d+))?$/);
  if (numericMatch) {
    const wholeHours = parseInt(numericMatch[1], 10);
    if (numericMatch[2] !== undefined) {
      // Decimal notation: treat decimal part as minute tens-place
      // e.g. 3.4 → 3h 40m, 1.5 → 1h 50m, 0.3 → 0h 30m
      const decimalPart = numericMatch[2].padEnd(2, '0').slice(0, 2); // normalise to 2 digits
      const minutes = parseInt(decimalPart, 10);
      const totalHours = wholeHours + minutes / 60;
      return { hours: parseFloat(totalHours.toFixed(4)), needsClarification: false, cleanText: formatHours(totalHours) };
    }
    // Bare integer → treat as hours (no clarification needed)
    return { hours: wholeHours, needsClarification: false, cleanText: formatHours(wholeHours) };
  }

  // 2. Parse patterns with explicit units
  let hours = 0;
  let minutes = 0;
  let matched = false;

  // Pattern A: Hours and minutes: e.g. "4h 34m" or "4 hours 34 minutes"
  const hrMinPattern = /(\d+(?:\.\d+)?)\s*(?:h|hour|hours|hr|hrs)\s*(\d+)\s*(?:m|min|minute|minutes|mins)/;
  const hrMinMatch = text.match(hrMinPattern);
  if (hrMinMatch) {
    hours = parseFloat(hrMinMatch[1]);
    minutes = parseInt(hrMinMatch[2], 10);
    matched = true;
  } else {
    // Pattern B: Hours only: e.g. "4h", "4 hours", "4 hr"
    const hrPattern = /(\d+(?:\.\d+)?)\s*(?:h|hour|hours|hr|hrs)/;
    const hrMatch = text.match(hrPattern);
    if (hrMatch) {
      hours = parseFloat(hrMatch[1]);
      matched = true;
    }

    // Pattern C: Minutes only: e.g. "30m", "30 minutes", "30 min"
    const minPattern = /(\d+)\s*(?:m|min|minute|minutes|mins)/;
    const minMatch = text.match(minPattern);
    if (minMatch) {
      minutes = parseInt(minMatch[1], 10);
      matched = true;
    }
  }

  if (matched) {
    const totalHours = hours + minutes / 60;
    return {
      hours: parseFloat(totalHours.toFixed(4)),
      needsClarification: false,
      cleanText: formatHours(totalHours)
    };
  }

  // Fallback: try parsing as float (handles locale-independent floats)
  const fallback = parseFloat(text);
  if (isNaN(fallback)) {
    return { hours: 0, needsClarification: false, cleanText: '' };
  }
  return { hours: fallback, needsClarification: false, cleanText: formatHours(fallback) };
}

export function formatHours(hours: number): string {
  if (!hours || hours <= 0) return '';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  if (h > 0 && m > 0) {
    return `${h} hour${h > 1 ? 's' : ''} ${m} minute${m > 1 ? 's' : ''}`;
  } else if (h > 0) {
    return `${h} hour${h > 1 ? 's' : ''}`;
  } else if (m > 0) {
    return `${m} minute${m > 1 ? 's' : ''}`;
  }
  return '';
}

export function formatHoursCompact(hours: number): string {
  if (!hours || hours <= 0) return '0h';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h > 0 && m > 0) {
    return `${h}h ${m}m`;
  } else if (h > 0) {
    return `${h}h`;
  } else {
    return `${m}m`;
  }
}

