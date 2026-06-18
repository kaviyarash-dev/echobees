/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, CalendarDays, Users, ShieldAlert, Globe } from 'lucide-react';
import { LeaveRequest, CalendarEvent, LeaveStatus } from '../types';
import { getLeaveTypeColor, getLeaveTypeLabel } from '../utils/accrual';

interface CalendarViewProps {
  requests: LeaveRequest[];
  teamRequests: LeaveRequest[];
}

export function CalendarView({ requests, teamRequests }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-06-18')); // Current baseline
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday ... etc
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Offset padding columns for start of month
  const calendarGridPrefix = Array(firstDayOfMonth).fill(null);
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayString = (day: number) => {
    const dStr = String(day).padStart(2, '0');
    const mStr = String(month + 1).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  // Check which leaves fall on this day
  const getLeavesForDay = (dayStr: string, mode: 'my' | 'team') => {
    const list = mode === 'my' ? requests : teamRequests;
    return list.filter((req) => {
      if (req.status === LeaveStatus.REJECTED) return false;
      const start = req.startDate;
      const end = req.endDate;
      return dayStr >= start && dayStr <= end;
    });
  };

  const formatMonthTitle = () => {
    return currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div
      id="interactive-calendar-card"
      className="bg-[#FAF9F5]/90 rounded-xs border border-[#DECEB6]/60 p-6 h-full flex flex-col shadow-md backdrop-blur-md"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h2 id="calendar-title" className="text-base font-serif italic text-[#1F190F] tracking-tight">
            Schedule Hub
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-[#615542] mt-1">
            Track leaves and check team overlaps in real-time.
          </p>
        </div>

        {/* View Switches */}
        <div className="flex bg-[#F2EDE2] p-1 rounded-xs border border-[#DECEB6]/45 self-start sm:self-auto relative shadow-xs">
          <button
            id="tab-my-leaves"
            onClick={() => setActiveTab('my')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xs text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer relative z-10 ${
              activeTab === 'my'
                ? 'text-[#1F190F] font-extrabold'
                : 'text-[#615542] hover:text-[#1F190F]'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>My Leaves</span>
            {activeTab === 'my' && (
              <motion.div
                layoutId="calendarViewTabIndicator"
                className="absolute inset-0 bg-[#FCFBF8] border border-[#DECEB6]/50 rounded-xs -z-10 shadow-xs"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
          <button
            id="tab-team-leaves"
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xs text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer relative z-10 ${
              activeTab === 'team'
                ? 'text-[#1F190F] font-extrabold'
                : 'text-[#615542] hover:text-[#1F190F]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Hub</span>
            {activeTab === 'team' && (
              <motion.div
                layoutId="calendarViewTabIndicator"
                className="absolute inset-0 bg-[#FCFBF8] border border-[#DECEB6]/50 rounded-xs -z-10 shadow-xs"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Calendar Header with shifts */}
      <div className="flex items-center justify-between bg-[#FCFBF8] px-4 py-2.5 rounded-xs border border-[#DECEB6]/50 mb-4 shrink-0 shadow-xs">
        <h3 id="current-month-heading" className="text-xs uppercase tracking-widest font-mono font-bold text-[#1F190F]">
          {formatMonthTitle()}
        </h3>
        <div className="flex gap-1.5">
          <button
            id="calendar-prev-month"
            onClick={handlePrevMonth}
            className="p-1.5 bg-white border border-[#DECEB6] hover:bg-[#F2EDE2]/60 rounded-xs text-[#1F190F] transition cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            id="calendar-next-month"
            onClick={handleNextMonth}
            className="p-1.5 bg-white border border-[#DECEB6] hover:bg-[#F2EDE2]/60 rounded-xs text-[#1F190F] transition cursor-pointer shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days header column */}
      <div className="grid grid-cols-7 text-center border-b border-[#DECEB6]/30 pb-2 mb-2 shrink-0">
        {dayNames.map((name) => (
          <span key={name} className="text-[9px] font-bold text-[#615542] uppercase tracking-[0.2em] font-sans">
            {name}
          </span>
        ))}
      </div>

      {/* Calendar Days Board */}
      <div className="grid grid-cols-7 gap-1 flex-1 relative min-h-[220px]">
        {calendarGridPrefix.map((_, i) => (
          <div key={`empty-${i}`} className="bg-transparent border border-dashed border-[#DECEB6]/20 rounded-xs" />
        ))}

        {calendarDays.map((day) => {
          const dayStr = getDayString(day);
          const isToday = dayStr === '2026-06-18'; // Mock exact today context

          // Get events based on screen filter
          const dayLeaves = getLeavesForDay(dayStr, activeTab);

          return (
            <motion.div
              key={`day-${day}`}
              id={`day-${dayStr}`}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: Math.min((day % 8) * 0.015, 0.15) }}
              whileHover={{ scale: 1.05, zIndex: 10, borderColor: '#DECEB6' }}
              className={`min-h-[50px] p-1 rounded-xs border flex flex-col justify-between transition-colors relative group overflow-hidden cursor-default ${
                isToday
                  ? 'border-[#1F190F] bg-[#FCFBF8] shadow-sm font-bold'
                  : 'border-[#DECEB6]/30 bg-transparent hover:bg-[#F2EDE2]/60'
              }`}
            >
              {/* Day Number */}
              <div className="flex justify-between items-center z-10">
                <span
                  className={`text-[10px] font-mono font-medium block w-5 h-5 rounded-none flex items-center justify-center leading-none ${
                    isToday
                      ? 'bg-[#1F190F] text-[#FCFCFA] font-bold'
                      : 'text-[#615542]'
                  }`}
                >
                  {day}
                </span>

                {/* Overlap Alarm Indicator */}
                {dayLeaves.length > 1 && (
                  <ShieldAlert className="w-3 h-3 text-rose-600 animate-pulse" title="Multiple overlapping absences" />
                )}
              </div>

              {/* Event Strips Container */}
              <div className="space-y-1 mt-1.5 flex-1 flex flex-col justify-end z-10 font-sans">
                {/* Personal / Team Leaves Render */}
                {dayLeaves.map((leave, index) => {
                  if (index >= 2) return null; // cap visual count
                  const cInfo = getLeaveTypeColor(leave.type);
                  const isApproved = leave.status === LeaveStatus.APPROVED;
                  
                  return (
                    <div
                      key={leave.id}
                      id={`calendar-strip-${leave.id}`}
                      className={`text-[8px] px-1.5 py-0.5 rounded-xs overflow-hidden truncate whitespace-nowrap block tracking-wide leading-none border select-none ${cInfo.bg} ${cInfo.text} ${cInfo.border} ${
                        isApproved ? 'opacity-100 font-semibold border-solid' : 'opacity-60 border-dashed'
                      }`}
                      title={`${leave.employeeName}: ${getLeaveTypeLabel(leave.type)} (${leave.status})`}
                    >
                      {activeTab === 'team' ? leave.employeeName.split(' ')[0] : getLeaveTypeLabel(leave.type).split(' ')[0]}
                    </div>
                  );
                })}

                {/* Visual sync bubble overlay */}
                {dayLeaves.length > 2 && (
                  <div className="text-[7.5px] text-center font-mono font-bold text-[#615542]">
                    +{dayLeaves.length - 2} more
                  </div>
                )}
              </div>

              {/* Subtle visual hover border accent */}
              <div className="absolute inset-0 border border-white/0 rounded-xs group-hover:border-[#DECEB6]/60 transition pointer-events-none" />
            </motion.div>
          );
        })}
      </div>

      {/* Tiny descriptive legend bottom info bar */}
      <div className="mt-4 pt-4 border-t border-[#DECEB6]/50 flex flex-wrap justify-between items-center gap-3 shrink-0 text-xs">
        <div className="flex flex-wrap gap-2.5">
          <span className="text-[9px] text-[#615542] uppercase font-bold tracking-widest font-sans">
            LEGEND:
          </span>
          <div className="flex items-center gap-1 font-semibold text-[10px] text-[#615542]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Annual</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-[10px] text-[#615542]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            <span>Sick</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-[10px] text-[#615542]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-650" />
            <span>Parental</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-[10px] text-[#615542]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Unpaid</span>
          </div>
        </div>

        <div className="text-[10px] text-[#615542] font-semibold">
          * Approved blocks appear solid; Pending are light & dashed.
        </div>
      </div>
    </div>
  );
}
