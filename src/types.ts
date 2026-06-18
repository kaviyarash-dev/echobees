/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  PARENTAL = 'parental',
  UNPAID = 'unpaid',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  joinedDate: string;
  avatar: string;
  isPendingReview?: boolean; // Track if registered through workspace device and awaits HR confirmation
  // Allocation/Accrual details
  annualAllowance: number; // e.g. 25 days
  accruedDays: {
    [key in LeaveType]: number;
  };
  usedDays: {
    [key in LeaveType]: number;
  };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  halfDay: boolean;
  status: LeaveStatus;
  reason: string;
  createdAt: string;
  approvedAt?: string;
  gcalEventId?: string; // ID of the calendar sync event
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: {
    date?: string;
    dateTime?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
  };
  colorId?: string;
}
