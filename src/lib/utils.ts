import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatISTTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date) + ' IST';
}

export function formatISTDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Strict Alert Severity Hierarchy (Requirement 7):
// CRITICAL = 4, HIGH = 3, MEDIUM = 2, LOW = 1.
export const ALERT_SEVERITY_WEIGHT: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  INFO: 0,
};

export function sortAlertsBySeverity<T extends { severity?: string; created_at?: string }>(alerts: T[]): T[] {
  return [...alerts].sort((a, b) => {
    const sevA = (a.severity || '').toUpperCase();
    const sevB = (b.severity || '').toUpperCase();
    const weightA = ALERT_SEVERITY_WEIGHT[sevA] ?? 0;
    const weightB = ALERT_SEVERITY_WEIGHT[sevB] ?? 0;

    if (weightA !== weightB) {
      return weightB - weightA; // Higher severity first (CRITICAL -> HIGH -> MEDIUM -> LOW)
    }

    // Within same severity, sort newest first
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });
}

