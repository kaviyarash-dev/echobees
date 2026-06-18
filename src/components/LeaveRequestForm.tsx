/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, FileText, AlertTriangle, Check, ArrowRight, HelpCircle } from 'lucide-react';
import { Employee, LeaveType, LeaveStatus, LeaveRequest } from '../types';
import { calculateWorkDays, getLeaveTypeLabel, getLeaveTypeColor } from '../utils/accrual';

interface LeaveRequestFormProps {
  employee: Employee;
  onSubmit: (request: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status' | 'createdAt'>) => Promise<void>;
  existingRequests: LeaveRequest[];
}

export function LeaveRequestForm({ employee, onSubmit, existingRequests }: LeaveRequestFormProps) {
  const [type, setType] = useState<LeaveType>(LeaveType.ANNUAL);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [halfDay, setHalfDay] = useState<boolean>(false);
  
  const [duration, setDuration] = useState<number>(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Recalculate duration and validate
  useEffect(() => {
    if (!startDate || !endDate) {
      setDuration(0);
      setWarningMessage(null);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setDuration(0);
      setWarningMessage('End date cannot be prior to the start date.');
      return;
    }

    let calculated = calculateWorkDays(startDate, endDate);
    if (calculated === 0) {
      setDuration(0);
      setWarningMessage('Selected block consists entirely of weekend days.');
      return;
    }

    if (halfDay) {
      calculated = calculated * 0.5;
    }

    setDuration(calculated);

    // Validate if employee has enough leave balance
    const available = employee.accruedDays[type] - employee.usedDays[type];
    if (calculated > available) {
      setWarningMessage(`Insufficient balance. You are requesting ${calculated} day(s), but only have ${available.toFixed(1)} day(s) available.`);
      return;
    }

    // Check for collision with existing pending or approved requests
    const collides = existingRequests.some((req) => {
      if (req.status === LeaveStatus.REJECTED) return false;
      const reqStart = new Date(req.startDate);
      const reqEnd = new Date(req.endDate);
      const testStart = new Date(startDate);
      const testEnd = new Date(endDate);

      return (testStart <= reqEnd && testEnd >= reqStart);
    });

    if (collides) {
      setWarningMessage('Overlap Warning: You already have another requested leave during this interval.');
      return;
    }

    setWarningMessage(null);
  }, [startDate, endDate, type, halfDay, employee, existingRequests]);

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || duration <= 0 || warningMessage?.includes('Insufficient balance') || warningMessage?.includes('prior to')) {
      return;
    }
    // Launch Custom Confirmation Dialog! Highly recommended by workspace guidelines
    setShowConfirmModal(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        startDate,
        endDate,
        totalDays: duration,
        halfDay,
        reason
      });

      // Clean up form on success
      setType(LeaveType.ANNUAL);
      setStartDate('');
      setEndDate('');
      setReason('');
      setHalfDay(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorInfo = getLeaveTypeColor(type);
  const currentAvailable = employee.accruedDays[type] - employee.usedDays[type];

  return (
    <>
      <div
        id="leave-request-form-card"
        className="bg-[#FAF9F5]/90 rounded-xs border border-[#DECEB6]/60 p-6 shadow-md backdrop-blur-md"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#FCFBF8] border border-[#DECEB6]/50 rounded-xs text-[#1F190F] shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 id="form-heading" className="text-base font-serif italic text-[#1F190F] tracking-tight">
              Request Time Off
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-[#615542] mt-1">
              Submit requests with automatic calculations.
            </p>
          </div>
        </div>

        <form id="request-leave-form" onSubmit={handlePreSubmit} className="space-y-5 font-sans">
          {/* Leave Type row */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#615542] mb-2 font-semibold">
              Select Leave Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(LeaveType).map((t) => {
                const isActive = type === t;
                const tCol = getLeaveTypeColor(t);
                const bal = employee.accruedDays[t] - employee.usedDays[t];
                return (
                  <motion.button
                    key={t}
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setType(t)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xs border transition text-center cursor-pointer relative overflow-hidden shadow-xs ${
                      isActive
                        ? `bg-[#1F190F] border-transparent text-[#FCFCFA] shadow-md`
                        : 'bg-white border-[#DECEB6]/50 text-[#615542] hover:border-[#DECEB6] hover:text-[#1F190F]'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap z-10">{getLeaveTypeLabel(t).split(' ')[0]}</span>
                    <span className="text-[9px] opacity-85 mt-1 font-mono tracking-tighter z-10">{bal.toFixed(1)}d balance</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeLeaveTypeTabIndicator"
                        className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#FCFCFA]"
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Start and End date cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="leave-start-input" className="block text-[10px] uppercase tracking-widest text-[#615542] mb-1.5 font-semibold">
                Start Date
              </label>
              <div className="relative">
                <input
                  id="leave-start-input"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#FCFBF8] border border-[#DECEB6] rounded-xs px-3 py-2 text-xs outline-hidden focus:border-[#1F190F] font-mono text-[#1F190F]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="leave-end-input" className="block text-[10px] uppercase tracking-widest text-[#615542] mb-1.5 font-semibold">
                End Date
              </label>
              <div className="relative">
                <input
                  id="leave-end-input"
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#FCFBF8] border border-[#DECEB6] rounded-xs px-3 py-2 text-xs outline-hidden focus:border-[#1F190F] font-mono text-[#1F190F]"
                />
              </div>
            </div>
          </div>

          {/* Half day checkbox */}
          <div className="p-3 bg-[#FCFBF8] rounded-xs border border-[#DECEB6]/50 shadow-xs">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                id="half-day-checkbox"
                type="checkbox"
                checked={halfDay}
                onChange={(e) => setHalfDay(e.target.checked)}
                className="rounded-none border-[#DECEB6] text-[#1F190F] focus:ring-0 w-4 h-4 bg-white"
              />
              <div className="text-left">
                <span className="block text-xs font-semibold text-[#1F190F]">Half-Day Session</span>
                <span className="block text-[10px] text-[#615542] uppercase tracking-tighter mt-0.5">Counts as 0.5 Day</span>
              </div>
            </label>
          </div>

          {/* Reason details */}
          <div>
            <label htmlFor="leave-reason-textarea" className="block text-[10px] uppercase tracking-widest text-[#615542] mb-1.5 font-semibold">
              Reason / Comment
            </label>
            <div className="relative">
              <FileText className="absolute top-3 left-3 w-4 h-4 text-[#615542] pointer-events-none" />
              <textarea
                id="leave-reason-textarea"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Going on annual summer trip / Doctor checkup..."
                className="w-full bg-[#FCFBF8] border border-[#DECEB6] rounded-xs pl-10 pr-3 py-2.5 text-xs outline-hidden focus:border-[#1F190F] text-[#1F190F] placeholder:text-[#615542]/60"
              />
            </div>
          </div>

          {/* Warnings Panel */}
          <AnimatePresence mode="wait">
            {warningMessage && (
              <motion.div
                id="form-warning-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 p-3 rounded-xs"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="text-[11px] text-rose-800 leading-normal font-semibold font-mono">
                  {warningMessage}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result projection Panel */}
          {duration > 0 && !warningMessage?.includes('prior to') && (
            <div className="flex justify-between items-center bg-[#FCFBF8] px-4 py-3 border border-[#DECEB6]/50 rounded-xs shadow-xs">
              <span className="text-xs text-[#615542]">Duration Count:</span>
              <div className="text-right">
                <span className="text-lg font-serif italic text-[#1F190F]">
                  {duration} {duration === 1 ? 'Working Day' : 'Working Days'}
                </span>
                <span className="block text-[9px] text-[#615542] tracking-[0.15em] font-mono uppercase mt-0.5">
                  Excludes Weekends
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="leave-submit-button"
            type="submit"
            disabled={duration <= 0 || !!warningMessage?.includes('balance') || !!warningMessage?.includes('prior to')}
            className={`w-full py-3 text-xs uppercase tracking-widest font-bold font-sans transition rounded-xs cursor-pointer ${
              duration <= 0 || !!warningMessage?.includes('balance') || !!warningMessage?.includes('prior to')
                ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#1F190F] hover:bg-[#342D1F] text-white shadow-lg hover:scale-[1.01]'
            }`}
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-[#FCFCFA] border-t-transparent" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Request Time Off</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            )}
          </button>
        </form>
      </div>

      {/* Confirmation modal adhering strictly to Workspace API confirmation rules! */}
      <AnimatePresence>
        {showConfirmModal && (
          <div id="confirm-sync-modal-backdrop" className="fixed inset-0 z-55 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <motion.div
              id="confirm-sync-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FAF9F5] rounded-xs border border-[#DECEB6] p-8 max-w-md w-full relative overflow-hidden shadow-2xl"
            >
              <div className="mb-6 text-center">
                <div className="mx-auto w-12 h-12 bg-[#FCFBF8] border border-[#DECEB6]/50 rounded-xs flex items-center justify-center text-[#1F190F] mb-3 shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif italic text-[#1F190F] tracking-tight">
                  Confirm Leave Request
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-[#615542] mt-1">
                  You are about to register a new leave request.
                </p>
              </div>

              <div className="bg-[#FCFBF8] rounded-xs p-4 border border-[#DECEB6]/70 space-y-3.5 mb-6 text-xs text-[#1F190F] shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#615542] font-medium">Leave Category:</span>
                  <span className={`px-2 py-0.5 rounded-xs font-semibold text-[9px] border uppercase ${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}`}>
                    {getLeaveTypeLabel(type).split(' ')[0]}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#615542] font-medium">Requested Block:</span>
                  <span className="font-mono text-[#1F190F] font-bold">
                    {startDate} <span className="text-[#615542] font-normal">to</span> {endDate}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#615542] font-medium">Work Days:</span>
                  <span className="font-serif italic text-[#1F190F] font-black text-sm">
                    {duration} {duration === 1 ? 'day' : 'days'}
                  </span>
                </div>

                {reason && (
                  <div className="border-t border-[#DECEB6]/40 pt-3">
                    <span className="block text-[#615542] font-semibold mb-1">Comment:</span>
                    <span className="block text-[#1F190F] italic bg-[#FAF9F5] p-2.5 rounded-xs border border-[#DECEB6]/60 shadow-xs font-semibold">
                      "{reason}"
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  id="confirm-modal-cancel"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 bg-white border border-[#DECEB6] hover:bg-[#F2EDE2]/60 text-[#1F190F] font-bold uppercase tracking-widest text-[10px] rounded-xs transition cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  id="confirm-modal-proceed"
                  onClick={handleConfirmedSubmit}
                  className="flex-1 py-3 bg-[#1F190F] text-[#FCFCFA] font-bold uppercase tracking-widest text-[10px] rounded-xs hover:bg-[#342D1F] transition cursor-pointer shadow-lg"
                >
                  Confirm Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
