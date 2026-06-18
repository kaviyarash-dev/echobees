/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, CalendarDays, TrendingUp } from 'lucide-react';
import { Employee, LeaveType } from '../types';
import { calculateAccruedDays, getLeaveTypeColor, getLeaveTypeLabel } from '../utils/accrual';

interface AccrualSimulatorProps {
  employee: Employee;
}

export function AccrualSimulator({ employee }: AccrualSimulatorProps) {
  // Simulator targets up to 12 months in the future from today
  const today = new Date('2026-06-18'); // Standard current context
  const [monthsAhead, setMonthsAhead] = useState<number>(3);

  const targetDateStr = () => {
    const target = new Date(today);
    target.setMonth(target.getMonth() + monthsAhead);
    return target.toISOString().split('T')[0];
  };

  const currentAccrued = employee.accruedDays;
  const simulatedAccrued = calculateAccruedDays(
    employee.joinedDate,
    targetDateStr(),
    employee.annualAllowance
  );

  const formatTargetDate = () => {
    const target = new Date(today);
    target.setMonth(target.getMonth() + monthsAhead);
    return target.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
      day: 'numeric'
    });
  };

  return (
    <div
      id="accrual-simulator-card"
      className="bg-[#FAF9F5]/90 rounded-xs border border-[#DECEB6]/60 p-6 relative overflow-hidden font-sans shadow-md backdrop-blur-md"
    >
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#1F190F] font-semibold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="uppercase tracking-widest text-[9px] text-[#615542]">Accrual Forecaster</span>
          </div>
          <h2 id="simulator-heading" className="text-base font-serif italic text-[#1F190F] tracking-tight">
            Project Your Time Off
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-[#615542] mt-1">
            See your accrued balance grow in real-time as days pass.
          </p>
        </div>
        
        <div className="bg-[#FCFBF8] px-4 py-2.5 rounded-xs border border-[#DECEB6]/50 text-center md:text-right min-w-[150px] shadow-xs">
          <span className="block text-[9px] uppercase font-mono tracking-widest text-[#615542] mb-0.5">
            Target Projection
          </span>
          <span className="text-xs font-bold font-sans tracking-wide text-[#1F190F]">
            {formatTargetDate()}
          </span>
        </div>
      </div>

      {/* Accrual Rate Highlight Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-[#FCFBF8] p-4 rounded-xs border border-[#DECEB6]/50 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white border border-[#DECEB6] rounded-xs text-[#1F190F] shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F190F]">Accumulation Rate</h4>
            <p className="text-xs text-[#615542] mt-0.5">
              {(employee.annualAllowance / 12).toFixed(2)} days earned per active work-month.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white border border-[#DECEB6] rounded-xs text-[#1F190F] shadow-xs">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F190F]">Annual Allocation Limit</h4>
            <p className="text-xs text-[#615542] mt-0.5">
              Capped at a maximum of {employee.annualAllowance} vacation days per cycle.
            </p>
          </div>
        </div>
      </div>

      {/* Slider Control */}
      <div className="mb-8">
        <div className="flex justify-between text-[9px] text-[#615542] uppercase tracking-widest font-mono mb-2">
          <span>Current (Today)</span>
          <span className="text-[#1F190F] font-bold">{monthsAhead} Months and counting</span>
          <span>+1 Year</span>
        </div>
        <div className="relative flex items-center">
          <input
            id="accrual-months-range"
            type="range"
            min="0"
            max="12"
            value={monthsAhead}
            onChange={(e) => setMonthsAhead(Number(e.target.value))}
            className="w-full h-1 bg-[#DECEB6]/45 rounded-none appearance-none cursor-pointer accent-[#1F190F] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Projected Leaves Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.values(LeaveType).map((type) => {
          const colorInfo = getLeaveTypeColor(type);
          const currentAmount = currentAccrued[type];
          const projectedAmount = simulatedAccrued[type];
          const change = Math.max(0, Number((projectedAmount - currentAmount).toFixed(1)));

          return (
            <motion.div
              key={type}
              id={`projected-${type}-card`}
              whileHover={{ scale: 1.03, borderColor: '#DECEB6' }}
              className="bg-[#FCFBF8] p-4 rounded-xs border border-[#DECEB6]/50 flex flex-col justify-between transition-colors duration-200 shadow-xs"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${colorInfo.accent}`} />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#615542]">
                    {getLeaveTypeLabel(type).split(' ')[0]}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mt-1">
                  <motion.span
                    id={`${type}-simulated-days`}
                    key={projectedAmount}
                    initial={{ scale: 0.9, opacity: 0.3 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-light text-[#1F190F] font-serif"
                  >
                    {projectedAmount}
                  </motion.span>
                  <span className="text-[10px] text-[#615542] font-sans uppercase">Days</span>
                </div>
              </div>

              {change > 0 && (
                <div className="mt-3.5 inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 font-mono uppercase bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs self-start">
                  +{change} Expected
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
