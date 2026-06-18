/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Shield, CalendarCheck, TrendingUp, Users, Award, Trash, Bell, Info } from 'lucide-react';
import { LeaveRequest, LeaveStatus, Employee, LeaveType } from '../types';
import { getLeaveTypeColor, getLeaveTypeLabel } from '../utils/accrual';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface ManagerViewProps {
  requests: LeaveRequest[];
  employees: Employee[];
  onAction: (requestId: string, approve: boolean) => Promise<void>;
  onAdjustAllowance: (employeeId: string, delta: number) => void;
  onVerifyEmployee?: (employeeId: string) => Promise<void>;
}

export function ManagerView({ requests, employees, onAction, onAdjustAllowance, onVerifyEmployee }: ManagerViewProps) {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [reviewingEmployee, setReviewingEmployee] = useState<Employee | null>(null);
  const [isVerifyingId, setIsVerifyingId] = useState<string | null>(null);

  const handleVerify = async (empId: string) => {
    setIsVerifyingId(empId);
    if (onVerifyEmployee) {
      await onVerifyEmployee(empId);
    }
    setIsVerifyingId(null);
    setReviewingEmployee(null);
  };

  const pendingReviewEmployees = employees.filter(emp => emp.isPendingReview);
  
  // Pending actions
  const pendingRequests = requests.filter((req) => req.status === LeaveStatus.PENDING);
  const resolvedRequests = requests.filter((req) => req.status !== LeaveStatus.PENDING);

  // Departments list
  const departments = ['All', ...Array.from(new Set(employees.map((emp) => emp.department)))];

  // Filter requests by department selection
  const filteredResolved = selectDeptFilter(resolvedRequests);
  const filteredPending = selectDeptFilter(pendingRequests);

  function selectDeptFilter(list: LeaveRequest[]) {
    if (selectedDept === 'All') return list;
    return list.filter((req) => {
      const emp = employees.find((e) => e.id === req.employeeId);
      return emp?.department === selectedDept;
    });
  }

  // Calculate high-level metrics
  const activeAbsentCount = requests.filter((req) => {
    if (req.status !== LeaveStatus.APPROVED) return false;
    const today = new Date('2026-06-18');
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    return today >= start && today <= end;
  }).length;

  const totalAllocatedVacation = employees.reduce((acc, current) => acc + current.annualAllowance, 0);
  const averageAllotted = Math.round(totalAllocatedVacation / employees.length);

  // Chart Data calculations: Request category breakdown
  const categoryCounts = requests.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + curr.totalDays;
    return acc;
  }, { annual: 0, sick: 0, parental: 0, unpaid: 0 } as Record<string, number>);

  const chartData = [
    { name: 'Annual', Days: categoryCounts.annual, fill: '#10b981' },
    { name: 'Sick', Days: categoryCounts.sick, fill: '#f43f5e' },
    { name: 'Parental', Days: categoryCounts.parental, fill: '#6366f1' },
    { name: 'Unpaid', Days: categoryCounts.unpaid, fill: '#f59e0b' },
  ];

  // Pie chart department distribution
  const deptDistribution = employees.reduce((acc, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(deptDistribution).map((name) => ({
    name,
    value: deptDistribution[name],
  }));

  const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899'];

  return (
    <div id="manager-control-panel-grid" className="space-y-6">
      {/* 🔔 JOINING LOGS & REAL-TIME SECURITY ALERTS */}
      <AnimatePresence>
        {pendingReviewEmployees.length > 0 && (
          <motion.div
            id="hr-joining-notifications"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#FAF9F5]/95 border border-[#DECEB6] p-5 rounded-xs relative overflow-hidden shadow-md backdrop-blur-md z-10"
          >
            {/* Ambient gold glow */}
            <div className="absolute right-0 top-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-[#DECEB6]/45 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#1F190F] flex items-center gap-2 flex-wrap font-mono">
                    System Join Alerts ({pendingReviewEmployees.length})
                  </h3>
                  <p className="text-[9px] text-[#615542] font-mono font-semibold">
                    New corporate signups requiring security auditing and leave allocation ledger review.
                  </p>
                </div>
              </div>
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 shadow-xs">
                Roster Sync Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {pendingReviewEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-3.5 bg-[#FCFBF8] border border-[#DECEB6]/50 rounded-xs hover:border-[#DECEB6] transition-all duration-300 relative group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      referrerPolicy="no-referrer"
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-10 h-10 rounded-xs object-cover border border-[#DECEB6]/30 grayscale group-hover:grayscale-0 transition-all"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#1F190F] group-hover:text-amber-700 transition-colors">
                          {emp.name}
                        </span>
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-ping" />
                      </div>
                      <span className="block text-[10px] text-[#615542] font-mono select-all leading-relaxed font-semibold">
                        {emp.email}
                      </span>
                      <span className="block text-[8px] uppercase tracking-wider text-[#615542] font-bold mt-1">
                        {emp.department} • {emp.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setReviewingEmployee(emp)}
                      className="px-2.5 py-1.5 bg-white hover:bg-[#1F190F] text-[#1F190F] hover:text-[#FCFCFA] border border-[#DECEB6] hover:border-transparent transition font-mono text-[9px] font-bold uppercase tracking-wider cursor-pointer shadow-xs rounded-xs"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => handleVerify(emp.id)}
                      disabled={isVerifyingId === emp.id}
                      className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white transition font-mono text-[9px] font-extrabold uppercase tracking-wider cursor-pointer disabled:opacity-50 shadow-sm rounded-xs"
                    >
                      {isVerifyingId === emp.id ? 'Saving...' : 'Verify'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔍 EMPLOYEE ACCOUNT AUDIT & REVIEW MODAL OVERLAY */}
      <AnimatePresence>
        {reviewingEmployee && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-55">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#FAF9F5] border border-[#DECEB6] p-6 md:p-8 rounded-xs shadow-2xl relative overflow-hidden animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-[#DECEB6]/40 pb-4 mb-5">
                <div className="flex items-center gap-2.5 text-amber-700 font-mono">
                  <Shield className="w-5 h-5" />
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#1F190F]">
                    Employee Credentials Authorization Review
                  </span>
                </div>
                <button
                  onClick={() => setReviewingEmployee(null)}
                  className="text-[#615542] hover:text-[#1F190F] transition text-xs font-mono font-bold"
                >
                  [Dismiss]
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-5 p-4 bg-[#FCFBF8] border border-[#DECEB6]/60 shadow-xs">
                  <img
                    referrerPolicy="no-referrer"
                    src={reviewingEmployee.avatar}
                    alt={reviewingEmployee.name}
                    className="w-20 h-20 rounded-xs object-cover border border-[#DECEB6]/50 shadow-sm grayscale"
                  />
                  <div className="space-y-1">
                    <span className="block text-2xl font-serif text-[#1F190F] leading-none whitespace-nowrap italic">
                      {reviewingEmployee.name}
                    </span>
                    <span className="block text-xs font-mono text-amber-700 font-bold select-all">
                      {reviewingEmployee.email}
                    </span>
                    <span className="inline-block bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[8.5px] uppercase font-mono tracking-widest font-extrabold mt-1">
                      System Entity Verification Key: {reviewingEmployee.id}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-[#FCFBF8] border border-[#DECEB6]/40 rounded-xs shadow-xs">
                    <span className="block text-[8px] uppercase tracking-wider text-[#615542] font-semibold mb-1">Company Department</span>
                    <span className="text-[#1F190F] font-bold">{reviewingEmployee.department}</span>
                  </div>
                  <div className="p-3 bg-[#FCFBF8] border border-[#DECEB6]/40 rounded-xs shadow-xs">
                    <span className="block text-[8px] uppercase tracking-wider text-[#615542] font-semibold mb-1">Professional Role</span>
                    <span className="text-[#1F190F] font-bold">{reviewingEmployee.role}</span>
                  </div>
                  <div className="p-3 bg-[#FCFBF8] border border-[#DECEB6]/40 rounded-xs shadow-xs">
                    <span className="block text-[8px] uppercase tracking-wider text-[#615542] font-semibold mb-1">Contract Commencement</span>
                    <span className="text-[#1F190F] font-bold">{reviewingEmployee.joinedDate}</span>
                  </div>
                  <div className="p-3 bg-[#FCFBF8] border border-[#DECEB6]/40 rounded-xs shadow-xs">
                    <span className="block text-[8px] uppercase tracking-wider text-[#615542] font-semibold mb-1">Initial Annual Allowance</span>
                    <span className="text-emerald-700 font-bold">{reviewingEmployee.annualAllowance} Days</span>
                  </div>
                </div>

                <div className="bg-amber-50/75 p-3 border border-amber-200 rounded-xs flex items-start gap-2.5 text-[#615542] font-mono text-[9px] leading-relaxed">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                  <span className="font-semibold">
                    Verifying this profile updates the database entry, enabling active service integration and synchronizing this client with all devices in the cloud system.
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6 border-t border-[#DECEB6]/45 pt-5 justify-end">
                <button
                  onClick={() => setReviewingEmployee(null)}
                  className="px-4 py-2.5 border border-[#DECEB6] text-[#1F190F] hover:bg-[#F2EDE2]/60 bg-white shadow-xs rounded-xs font-mono text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerify(reviewingEmployee.id)}
                  disabled={isVerifyingId === reviewingEmployee.id}
                  className="px-5 py-2.5 bg-[#1F190F] text-[#FCFCFA] font-bold uppercase tracking-wider text-xs font-mono hover:bg-[#342D1F] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-lg rounded-xs"
                >
                  {isVerifyingId === reviewingEmployee.id ? 'Processing...' : 'Approve & Verify Account'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header with KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          whileHover={{ scale: 1.02, borderColor: '#DECEB6' }}
          className="bg-[#FAF9F5]/95 rounded-xs border border-[#DECEB6]/60 p-5 flex items-center gap-4 cursor-default shadow-md backdrop-blur-md"
        >
          <div className="p-3 bg-[#FCFBF8] border border-[#DECEB6]/50 rounded-xs text-[#1F190F] shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] uppercase font-mono tracking-widest text-[#615542] font-semibold">
              Department Crew
            </span>
            <span className="text-xl font-light font-serif text-[#1F190F]">
              {employees.length} Members
            </span>
          </div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ scale: 1.02, borderColor: '#DECEB6' }}
          className="bg-[#FAF9F5]/95 rounded-xs border border-[#DECEB6]/60 p-5 flex items-center gap-4 cursor-default shadow-md backdrop-blur-md"
        >
          <div className="p-3 bg-[#FCFBF8] border border-[#DECEB6]/50 rounded-xs text-emerald-700 font-bold shadow-xs">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] uppercase font-mono tracking-widest text-[#615542] font-semibold">
              Currently OOO (Away)
            </span>
            <span className="text-xl font-light font-serif text-emerald-700">
              {activeAbsentCount} Employee{activeAbsentCount !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          whileHover={{ scale: 1.02, borderColor: '#DECEB6' }}
          className="bg-[#FAF9F5]/95 rounded-xs border border-[#DECEB6]/60 p-5 flex items-center gap-4 cursor-default shadow-md backdrop-blur-md"
        >
          <div className="p-3 bg-[#FCFBF8] border border-[#DECEB6]/50 rounded-xs text-[#1F190F] shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] uppercase font-mono tracking-widest text-[#615542] font-semibold">
              Avg Yearly Allowance
            </span>
            <span className="text-xl font-light font-serif text-[#1F190F]">
              {averageAllotted} Work-Days
            </span>
          </div>
        </motion.div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Category Count Chart */}
        <div className="bg-[#FAF9F5]/90 rounded-xs border border-[#DECEB6]/60 p-6 flex flex-col h-[320px] shadow-md backdrop-blur-md">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#1F190F] mb-4 flex items-center gap-2 font-mono pb-2 border-b border-[#DECEB6]/30">
            <Award className="w-4 h-4 text-[#1F190F]" />
            <span>Leave Categories Total Hours (Days)</span>
          </h3>
          <div className="flex-1 w-full text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(31,25,15,0.06)" />
                <XAxis dataKey="name" stroke="none" fill="#615542" fontSize={10} tickLine={false} />
                <YAxis stroke="none" fill="#615542" fontSize={10} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(31, 25, 15, 0.02)' }}
                  contentStyle={{
                    background: '#FAF9F5',
                    border: '1px solid #DECEB6',
                    borderRadius: '0px',
                    color: '#1F190F',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <Bar dataKey="Days" radius={[0, 0, 0, 0]} barSize={26}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Member Roster Allocation Adjustment panel */}
        <div className="bg-[#FAF9F5]/90 border border-[#DECEB6]/60 rounded-xs h-[320px] p-6 flex flex-col shadow-md backdrop-blur-md">
          <div className="flex justify-between items-center mb-4 border-b border-[#DECEB6]/30 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#1F190F] font-mono">
              Allocation Dashboard
            </h3>
            <span className="text-[9px] font-mono uppercase tracking-widest bg-amber-50 border border-amber-200 px-2 py-0.5 text-amber-800 shadow-xs">
              Admin Shield Active
            </span>
          </div>

          <div className="flex-grow overflow-y-auto space-y-2.5 pr-1 royal-scrollbar">
            {employees.map((emp, idx) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.2) }}
                whileHover={{ scale: 1.01, borderColor: emp.isPendingReview ? 'rgba(217, 119, 6, 0.5)' : '#DECEB6' }}
                className={`flex items-center justify-between p-3 rounded-xs border transition-colors duration-200 ${
                  emp.isPendingReview 
                    ? 'border-amber-500/50 bg-amber-50/70 hover:bg-amber-100/60 cursor-pointer shadow-xs' 
                    : 'bg-[#FCFBF8] border-[#DECEB6]/40 hover:bg-[#F2EDE2]/55 shadow-xs'
                }`}
                onClick={() => {
                  if (emp.isPendingReview) {
                    setReviewingEmployee(emp);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    referrerPolicy="no-referrer"
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-8 h-8 rounded-xs border border-[#DECEB6]/30 shadow-xs object-cover grayscale brightness-95 hover:grayscale-0 transition cursor-pointer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#1F190F] flex items-center gap-1.5 flex-wrap">
                      <span>{emp.name}</span>
                      {emp.isPendingReview && (
                        <span className="inline-block bg-amber-100 text-amber-800 border border-amber-300 text-[7px] font-sans font-extrabold px-1.5 py-0.5 uppercase tracking-wider scale-95 origin-left">
                          needs verification
                        </span>
                      )}
                    </h4>
                    <p className="text-[9px] text-[#615542] font-mono font-semibold tracking-wider">{emp.department} • {emp.role}</p>
                  </div>
                </div>

                {/* Adjustments buttons */}
                <div className="flex items-center gap-3" onClick={(e) => {
                  // Prevent parent onClick trigger when adjusting allowance
                  if (emp.isPendingReview) e.stopPropagation();
                }}>
                  <div className="text-right">
                    <span className="block text-[8px] uppercase tracking-wider text-[#615542] font-semibold">Allowance Capacity</span>
                    <span className="text-xs font-bold font-mono text-[#1F190F]">
                      {emp.annualAllowance} days
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => onAdjustAllowance(emp.id, -1)}
                      className="w-6 h-6 rounded-xs bg-[#FCFBF8] border border-[#DECEB6] text-[10px] font-bold text-[#615542] hover:text-[#1F190F] hover:border-[#1F190F] transition flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      -
                    </button>
                    <button
                      onClick={() => onAdjustAllowance(emp.id, 1)}
                      className="w-6 h-6 rounded-xs bg-[#FCFBF8] border border-[#DECEB6] text-[10px] font-bold text-[#615542] hover:text-[#1F190F] hover:border-[#1F190F] transition flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Request Approvals Table */}
      <div className="bg-[#FAF9F5]/90 rounded-xs border border-[#DECEB6]/60 p-6 shadow-md backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FCFBF8] border border-[#DECEB6]/50 text-[#1F190F] rounded-xs shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif italic text-[#1F190F] tracking-tight">
                HR Approvals Queue
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-[#615542] mt-1 font-bold">
                Action pending applications of your direct reports.
              </p>
            </div>
          </div>

          {/* Department dropdown selector */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-[#615542] uppercase tracking-widest font-mono font-bold">Department:</span>
            <select
              id="dept-select-filter"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-[#FCFBF8] text-[#1F190F] text-[10px] uppercase font-extrabold tracking-widest border border-[#DECEB6] rounded-xs px-3 py-1.5 focus:border-[#1F190F] focus:outline-hidden text-right cursor-pointer shadow-xs font-mono"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabulation of Pending queue */}
        <div className="mb-6 animate-fade-in">
          <h4 className="text-[9px] font-mono uppercase text-[#615542] tracking-[0.2em] border-b border-[#DECEB6]/40 pb-2 mb-3 font-extrabold">
            Pending Approval ({filteredPending.length})
          </h4>

          <div className="overflow-x-auto royal-scrollbar">
            {filteredPending.length === 0 ? (
              <div className="text-center py-8 bg-[#FCFBF8] border border-[#DECEB6]/40 rounded-xs shadow-xs">
                <p className="text-xs text-[#615542] uppercase tracking-widest font-mono font-bold">
                  Congratulations! Approval queue is completely clear.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="text-[9px] uppercase font-bold text-[#615542] tracking-widest border-b border-[#DECEB6]/30">
                    <th className="py-2.5 px-3 font-semibold">Employee</th>
                    <th className="py-2.5 px-3 font-semibold">Type</th>
                    <th className="py-2.5 px-2 font-semibold font-mono">Interval</th>
                    <th className="py-2.5 px-2 text-center font-semibold">Days</th>
                    <th className="py-2.5 px-3 font-semibold">Reason Statement</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DECEB6]/20">
                  <AnimatePresence initial={false}>
                    {filteredPending.map((req) => {
                      const tCol = getLeaveTypeColor(req.type);
                      const emp = employees.find((e) => e.id === req.employeeId);
                      return (
                        <motion.tr
                          layout
                          key={req.id}
                          id={`pending-tr-${req.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.25 }}
                          className="hover:bg-[#FCFBF8]/80 transition duration-150"
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                referrerPolicy="no-referrer"
                                src={emp?.avatar}
                                alt={req.employeeName}
                                className="w-7 h-7 rounded-xs object-cover border border-[#DECEB6]/30 grayscale"
                              />
                              <div>
                                <span className="block text-xs font-bold text-[#1F190F]">
                                  {req.employeeName}
                                </span>
                                <span className="block text-[8px] text-[#615542] uppercase tracking-widest font-mono font-bold">
                                  {emp?.department}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 mr-1">
                            <span className={`px-2 py-0.5 rounded-xs text-[8px] font-mono font-bold border uppercase ${tCol.bg} ${tCol.text} ${tCol.border}`}>
                              {getLeaveTypeLabel(req.type).split(' ')[0]}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-mono text-[10px] text-[#1F190F] whitespace-nowrap">
                            {req.startDate} to {req.endDate}
                          </td>
                          <td className="py-3 px-2 font-bold text-center text-xs text-[#1F190F]">
                            {req.totalDays}
                          </td>
                          <td className="py-3 px-3 text-[11px] text-[#615542] max-w-[200px] truncate font-semibold">
                            {req.reason || <span className="text-[#DECEB6]/80 italic font-medium">No statement provided</span>}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex gap-1.5">
                              <button
                                id={`reject-btn-${req.id}`}
                                onClick={() => onAction(req.id, false)}
                                className="p-1.5 bg-white hover:bg-rose-50 border border-[#DECEB6] text-rose-600 rounded-xs transition cursor-pointer shadow-xs"
                                title="Deny Leave"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <button
                                id={`approve-btn-${req.id}`}
                                onClick={() => onAction(req.id, true)}
                                className="p-1.5 bg-white hover:bg-emerald-50 border border-[#DECEB6] text-emerald-600 rounded-xs transition cursor-pointer shadow-xs"
                                title="Approve Leave"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Tabulation of Historical queue */}
        <div>
          <h4 className="text-[9px] font-mono uppercase text-[#615542] tracking-[0.2em] border-b border-[#DECEB6]/40 pb-2 mb-3 font-extrabold">
            Resolved Applications ({filteredResolved.length})
          </h4>

          <div className="overflow-x-auto royal-scrollbar">
            {filteredResolved.length === 0 ? (
              <p className="text-[10px] text-center py-6 text-[#615542] uppercase tracking-widest font-mono font-bold">No historical processed leaves found.</p>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="text-[9px] uppercase font-bold text-[#615542] tracking-widest border-b border-[#DECEB6]/30">
                    <th className="py-2.5 px-3 font-semibold">Employee</th>
                    <th className="py-2.5 px-3 font-semibold">Type</th>
                    <th className="py-2.5 px-3 font-semibold font-mono">Period</th>
                    <th className="py-2.5 px-3 text-center font-semibold">Days</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DECEB6]/20">
                  {filteredResolved.map((req) => {
                    const tCol = getLeaveTypeColor(req.type);
                    const isApproved = req.status === LeaveStatus.APPROVED;
                    return (
                      <tr key={req.id} className="hover:bg-[#FCFBF8]/80 transition duration-150 text-xs text-[#1F190F]">
                        <td className="py-3 px-3 font-bold text-[#1F190F]">
                          {req.employeeName}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-1.5 py-0.5 rounded-xs text-[8px] font-mono font-bold uppercase ${tCol.bg} ${tCol.text} ${tCol.border}`}>
                            {getLeaveTypeLabel(req.type).split(' ')[0]}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] text-[#615542] whitespace-nowrap">
                          {req.startDate} ~ {req.endDate}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-[11px] text-[#1F190F] font-bold">
                          {req.totalDays}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider border rounded-xs ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                              : 'bg-rose-50 text-rose-700 border-rose-250'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
