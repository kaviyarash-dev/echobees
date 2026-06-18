/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LeaveType, Employee } from '../types';

/**
 * Calculates work days (excluding weekends) between two dates inclusive.
 */
export function calculateWorkDays(startStr: string, endStr: string): number {
  const start = new Date(startStr);
  const end = new Date(endStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (start > end) return 0;

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) and not Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Calculates automatic accruals based on standard HR policies.
 * Annual leaves: tick up linearly based on days passed.
 * Accrual calculation: (Days between join date and target date) * (Annual Allowance / 365)
 * Sick leave, unpaid, and parental: flat annual allowances or custom fixed values.
 */
export function calculateAccruedDays(
  joinedDateStr: string,
  targetDateStr: string,
  annualAllowance: number
): { [key in LeaveType]: number } {
  const joined = new Date(joinedDateStr);
  const target = new Date(targetDateStr);

  const msDiff = target.getTime() - joined.getTime();
  if (msDiff <= 0) {
    return {
      [LeaveType.ANNUAL]: 0,
      [LeaveType.SICK]: 10,
      [LeaveType.PARENTAL]: 30,
      [LeaveType.UNPAID]: 0,
    };
  }

  const daysPassed = msDiff / (1000 * 60 * 60 * 24);
  const annualAccruedBeforeCap = daysPassed * (annualAllowance / 365);
  // Cap accrual based on joined years, or just normal annual capping
  const annualAccruedLocked = Math.min(annualAllowance, Math.round(annualAccruedBeforeCap * 100) / 100);

  return {
    [LeaveType.ANNUAL]: annualAccruedLocked,
    [LeaveType.SICK]: 10,  // Sick leave typically has a flat annual pool
    [LeaveType.PARENTAL]: 30, // Parental standard
    [LeaveType.UNPAID]: 90,   // Allowed unpaid leaves
  };
}

/**
 * Helper to get nice descriptive labels for Leave Types
 */
export function getLeaveTypeLabel(type: LeaveType): string {
  switch (type) {
    case LeaveType.ANNUAL:
      return 'Annual Leave';
    case LeaveType.SICK:
      return 'Sick Leave';
    case LeaveType.PARENTAL:
      return 'Parental Leave';
    case LeaveType.UNPAID:
      return 'Unpaid Leave';
    default:
      return 'Leave';
  }
}

/**
 * Helper to get distinct colors for Leave Types
 */
export function getLeaveTypeColor(type: LeaveType): {
  bg: string;
  text: string;
  border: string;
  accent: string;
  hex: string;
} {
  switch (type) {
    case LeaveType.ANNUAL:
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/40',
        accent: 'bg-emerald-500',
        hex: '#10b981',
      };
    case LeaveType.SICK:
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/20',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800/40',
        accent: 'bg-rose-500',
        hex: '#f43f5e',
      };
    case LeaveType.PARENTAL:
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-950/20',
        text: 'text-indigo-700 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-800/40',
        accent: 'bg-indigo-500',
        hex: '#6366f1',
      };
    case LeaveType.UNPAID:
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800/40',
        accent: 'bg-amber-500',
        hex: '#f59e0b',
      };
  }
}
