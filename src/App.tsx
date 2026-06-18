/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Layers,
  LogOut,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  History,
  Shield,
  User,
  GitPullRequest,
  Check,
  X,
  Plus,
  Server,
  Database
} from 'lucide-react';
import {
  Employee,
  LeaveRequest,
  LeaveType,
  LeaveStatus
} from './types';
import {
  calculateAccruedDays,
  calculateWorkDays,
  getLeaveTypeColor,
  getLeaveTypeLabel
} from './utils/accrual';
import { AccrualSimulator } from './components/AccrualSimulator';
import { LeaveRequestForm } from './components/LeaveRequestForm';
import { CalendarView } from './components/CalendarView';
import { ManagerView } from './components/ManagerView';
import { LoginScreen } from './components/LoginScreen';
import { EchobeesLogo } from './components/EchobeesLogo';
import { EmailNotificationsMockup } from './components/EmailNotificationsMockup';

// -------------------------------------------------------------
// INITIAL STARTING DATA (To avoid blank states and enable instant demo play)
// -------------------------------------------------------------
const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'John Doe',
    email: 'john.doe@corporate.com',
    role: 'Principal Product Designer',
    department: 'Product Design',
    joinedDate: '2024-01-15', // Accrued long-standing balance
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    annualAllowance: 24,
    accruedDays: { annual: 0, sick: 10, parental: 30, unpaid: 90 }, // Will be calculated dynamically on app load
    usedDays: { annual: 5, sick: 1.5, parental: 0, unpaid: 0 }
  },
  {
    id: 'emp-2',
    name: 'Jane Smith',
    email: 'jane.smith@corporate.com',
    role: 'Engineering Lead',
    department: 'Engineering Services',
    joinedDate: '2024-11-01',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    annualAllowance: 26,
    accruedDays: { annual: 0, sick: 10, parental: 30, unpaid: 90 },
    usedDays: { annual: 8, sick: 2, parental: 0, unpaid: 0 }
  },
  {
    id: 'emp-3',
    name: 'Sarah Connor',
    email: 'sarah.connor@corporate.com',
    role: 'Infrastructure Security Specialist',
    department: 'Engineering Services',
    joinedDate: '2525-08-29', // Simulated sci-fi join date
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    annualAllowance: 25,
    accruedDays: { annual: 0, sick: 10, parental: 30, unpaid: 90 },
    usedDays: { annual: 0, sick: 0, parental: 0, unpaid: 0 }
  }
];

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'req-1',
    employeeId: 'emp-1',
    employeeName: 'John Doe',
    type: LeaveType.ANNUAL,
    startDate: '2026-06-25',
    endDate: '2026-06-27',
    totalDays: 3,
    halfDay: false,
    status: LeaveStatus.APPROVED,
    reason: 'Family summer trip sync with kids.',
    createdAt: '2026-06-10T10:00:00Z',
    gcalEventId: 'sbox-1'
  },
  {
    id: 'req-2',
    employeeId: 'emp-2',
    employeeName: 'Jane Smith',
    type: LeaveType.SICK,
    startDate: '2026-06-19',
    endDate: '2026-06-20',
    totalDays: 2,
    halfDay: false,
    status: LeaveStatus.APPROVED,
    reason: 'Dental wisdom tooth extraction session.',
    createdAt: '2026-06-15T09:30:00Z',
    gcalEventId: 'sbox-2'
  },
  {
    id: 'req-3',
    employeeId: 'emp-1',
    employeeName: 'John Doe',
    type: LeaveType.PARENTAL,
    startDate: '2026-07-10',
    endDate: '2026-07-20',
    totalDays: 7,
    halfDay: false,
    status: LeaveStatus.PENDING,
    reason: 'Welcoming newborn baby home.',
    createdAt: '2026-06-17T11:45:00Z'
  },
  {
    id: 'req-4',
    employeeId: 'emp-3',
    employeeName: 'Sarah Connor',
    type: LeaveType.ANNUAL,
    startDate: '2026-06-22',
    endDate: '2026-06-24',
    totalDays: 3,
    halfDay: false,
    status: LeaveStatus.PENDING,
    reason: 'Off-grid security clearance audit prep.',
    createdAt: '2026-06-18T01:00:00Z'
  }
];

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('emp-1');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Separate login credentials session state
  const [loggedInUser, setLoggedInUser] = useState<{ role: 'hr' | 'employee'; employeeId?: string; name: string; email: string } | null>(null);
  
  // Custom alerts/toasts
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Baseline mock evaluation date: 2026-06-18
  const evalDate = '2026-06-18';

  // Compute helper to sync live changes to user's personal storage (localStorage) and Node Express backend
  const syncToLocalAndBackend = async (nextEmployees: Employee[], nextRequests: LeaveRequest[]) => {
    setEmployees(nextEmployees);
    setRequests(nextRequests);
    localStorage.setItem('echobees_employees', JSON.stringify(nextEmployees));
    localStorage.setItem('echobees_requests', JSON.stringify(nextRequests));

    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: nextEmployees, requests: nextRequests })
      });
    } catch (err) {
      console.warn("Backend API not reachable for sync. Operating in independent computer storage mode.");
    }
  };

  // 1. Calculate dynamic automatic accruals on boot up or employee load
  // Every time 'employees' loads, we compute live up-to-date balances based on joined dates
  useEffect(() => {
    // We only calculate this once or when employees change to avoid looping
    const recalculateAllAccruals = () => {
      const updated = employees.map((emp) => {
        const computed = calculateAccruedDays(emp.joinedDate, evalDate, emp.annualAllowance);
        return {
          ...emp,
          accruedDays: {
            ...emp.accruedDays,
            annual: Number(computed.annual.toFixed(1)),
            sick: Number(computed.sick.toFixed(1)),
            parental: Number(computed.parental.toFixed(1)),
            unpaid: Number(computed.unpaid.toFixed(1))
          }
        };
      });

      // Simple shallow check to prevent infinite re-renders
      const hasChanged = updated.some((upd, i) => {
        return employees[i] && upd.accruedDays.annual !== employees[i].accruedDays.annual;
      });

      if (hasChanged) {
        setEmployees(updated);
        localStorage.setItem('echobees_employees', JSON.stringify(updated));
      }
    };

    if (employees.length > 0) {
      recalculateAllAccruals();
    }
  }, [employees]);

  // On page mount, parse local storage (user's computer personal storage) and fetch from Node API
  useEffect(() => {
    // Recover login session from local computer storage
    const savedSession = localStorage.getItem('echobees_session');
    if (savedSession) {
      try {
        const parsedSec = JSON.parse(savedSession);
        setLoggedInUser(parsedSec);
        if (parsedSec.role === 'hr') {
          setIsAdminMode(true);
        } else {
          setIsAdminMode(false);
          setCurrentEmployeeId(parsedSec.employeeId || 'emp-1');
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load lists from local computer (localStorage) & synchronize with Express API
    const loadAndSyncWithBackend = async () => {
      let localEmp: Employee[] = [];
      let localReq: LeaveRequest[] = [];

      const savedEmp = localStorage.getItem('echobees_employees');
      const savedReq = localStorage.getItem('echobees_requests');

      if (savedEmp) {
        try { localEmp = JSON.parse(savedEmp); } catch (e) { console.error(e); }
      }
      if (savedReq) {
        try { localReq = JSON.parse(savedReq); } catch (e) { console.error(e); }
      }

      // If we got items from computer local storage, preheat the state so the page remains instantly responsive
      if (localEmp.length > 0) {
        setEmployees(localEmp);
      }
      if (localReq.length > 0) {
        setRequests(localReq);
      }

      // Fetch official fresh ledger copies from full-stack REST API
      try {
        const empRes = await fetch('/api/employees');
        const reqRes = await fetch('/api/requests');
        if (empRes.ok && reqRes.ok) {
          const apiEmps = await empRes.json();
          const apiReqs = await reqRes.json();

          setEmployees(apiEmps);
          setRequests(apiReqs);
          localStorage.setItem('echobees_employees', JSON.stringify(apiEmps));
          localStorage.setItem('echobees_requests', JSON.stringify(apiReqs));
        }
      } catch (err) {
        console.warn("Express API unreachable. Operating in fallback offline computer local storage mode.");
      }
    };

    loadAndSyncWithBackend();
  }, []);

  // Background polling loop to ensure multi-device registrations are instantly synchronized to HR dashboard
  useEffect(() => {
    if (!loggedInUser) return;

    let active = true;
    const interval = setInterval(async () => {
      try {
        const empRes = await fetch('/api/employees');
        const reqRes = await fetch('/api/requests');
        if (empRes.ok && reqRes.ok && active) {
          const apiEmps = await empRes.json();
          const apiReqs = await reqRes.json();

          // Deep comparison via serialization checks to prevent redundant component re-render loops
          const isEmpsChanged = JSON.stringify(employees) !== JSON.stringify(apiEmps);
          const isReqsChanged = JSON.stringify(requests) !== JSON.stringify(apiReqs);

          if (isEmpsChanged || isReqsChanged) {
            setEmployees(apiEmps);
            setRequests(apiReqs);
            localStorage.setItem('echobees_employees', JSON.stringify(apiEmps));
            localStorage.setItem('echobees_requests', JSON.stringify(apiReqs));
          }
        }
      } catch (e) {
        // Safe network silent omission
      }
    }, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [loggedInUser, employees, requests]);

  const handleLoginSuccess = (user: { role: 'hr' | 'employee'; employeeId?: string; name: string; email: string }) => {
    setLoggedInUser(user);
    localStorage.setItem('echobees_session', JSON.stringify(user));
    
    // Dispatch Spring Boot log trigger
    window.dispatchEvent(new CustomEvent('springboot-log', {
      detail: {
        level: 'INFO',
        message: `AUTH SUCCESS: User [${user.name}] with authentication role [${user.role === 'hr' ? 'HR_LEAD' : 'EMPLOYEE'}] launched active spring boot session context.`,
        autoOpen: true
      }
    }));

    if (user.role === 'hr') {
      setIsAdminMode(true);
      showToast(`Authenticated as Admin successfully. Welcome, ${user.name}!`, 'success');
    } else {
      setIsAdminMode(false);
      setCurrentEmployeeId(user.employeeId || 'emp-1');
      showToast(`Authenticated successfully. Welcome, ${user.name}!`, 'success');
    }
  };

  const handleLogoutSequence = () => {
    // Dispatch Spring Boot log trigger
    window.dispatchEvent(new CustomEvent('springboot-log', {
      detail: {
        level: 'INFO',
        message: `SESSION TERMINATED: Revoked security token context for previous user session. Cache clean successful.`,
        autoOpen: false
      }
    }));

    setLoggedInUser(null);
    localStorage.removeItem('echobees_session');
    showToast('Secure session logged out.', 'info');
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 5050);
  };

  // Handle leave application submissions
  const handleAddNewLeaveRequest = async (
    newRequest: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status' | 'createdAt'>
  ) => {
    const employee = employees.find((e) => e.id === currentEmployeeId);
    if (!employee) return;

    const requestObj: LeaveRequest = {
      ...newRequest,
      id: `req-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      status: LeaveStatus.PENDING, // Starts as pending, needs manager action
      createdAt: new Date().toISOString()
    };

    // Dispatch Spring Boot log trigger
    window.dispatchEvent(new CustomEvent('springboot-log', {
      detail: {
        level: 'INFO',
        message: `JPA TRANSACTION: Initiating insert on entity [com.echobees.hrms.model.LeaveRequest]`
      }
    }));
    window.dispatchEvent(new CustomEvent('springboot-log', {
      detail: {
        level: 'SQL',
        logger: 'org.hibernate.SQL',
        message: `INSERT INTO leave_requests (id, employee_id, employee_name, type, start_date, end_date, total_days, half_day, status, reason, created_at) VALUES ('${requestObj.id}', '${requestObj.employeeId}', '${requestObj.employeeName.replace(/'/g, "''")}', '${requestObj.type}', '${requestObj.startDate}', '${requestObj.endDate}', ${requestObj.totalDays}, ${requestObj.halfDay}, 'PENDING', '${requestObj.reason.replace(/'/g, "''")}', '${requestObj.createdAt}')`,
        autoOpen: true
      }
    }));

    // Append to local requests and server sync
    const nextRequests = [requestObj, ...requests];
    await syncToLocalAndBackend(employees, nextRequests);
    showToast('Leave request submitted successfully. Awaiting Manager Approval.', 'success');
  };

  // Manager action: Approve or reject leave requests
  const handleManagerAction = async (requestId: string, approve: boolean) => {
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return;

    const nextStatus = approve ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;

    // Dispatch Spring Boot review log trigger
    window.dispatchEvent(new CustomEvent('springboot-log', {
      detail: {
        level: 'INFO',
        message: `MANAGER ACTION: Processing state change approval [${approve ? 'APPROVED' : 'REJECTED'}] for leave request ID ${requestId}`
      }
    }));
    window.dispatchEvent(new CustomEvent('springboot-log', {
      detail: {
        level: 'SQL',
        logger: 'org.hibernate.SQL',
        message: `UPDATE leave_requests SET status = '${nextStatus}', approved_at = '${new Date().toISOString()}' WHERE id = '${requestId}'`
      }
    }));

    let updatedRequests = requests.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: nextStatus,
          approvedAt: approve ? new Date().toISOString() : undefined
        };
      }
      return req;
    });

    let updatedEmployees = [...employees];

    // If approved, update the employee's usedDays pool!
    if (approve) {
      const employee = employees.find((e) => e.id === targetReq.employeeId);
      if (employee) {
        const nextUsed = employee.usedDays[targetReq.type] + targetReq.totalDays;
        
        window.dispatchEvent(new CustomEvent('springboot-log', {
          detail: {
            level: 'SQL',
            logger: 'org.hibernate.SQL',
            message: `UPDATE employee_used_days SET days_count = ${Number(nextUsed.toFixed(1))} WHERE employee_id = '${employee.id}' AND leave_type = '${targetReq.type}'`,
            autoOpen: true
          }
        }));

        updatedEmployees = employees.map((e) =>
          e.id === employee.id
            ? {
                ...e,
                usedDays: {
                  ...e.usedDays,
                  [targetReq.type]: Number(nextUsed.toFixed(1))
                }
              }
            : e
        );
      }

      await syncToLocalAndBackend(updatedEmployees, updatedRequests);
      showToast(`Approved leave request for ${targetReq.employeeName}. Accrual limits updated.`, 'success');
    } else {
      await syncToLocalAndBackend(updatedEmployees, updatedRequests);
      showToast(`Rejected leave request for ${targetReq.employeeName}.`, 'info');
    }
  };

  // Manager action: Adjust employee total Yearly allowance limits
  const handleAdjustAllowance = async (employeeId: string, delta: number) => {
    const targetEmp = employees.find(e => e.id === employeeId);
    if (targetEmp) {
      const nextAllowance = Math.max(10, Math.min(50, targetEmp.annualAllowance + delta));
      window.dispatchEvent(new CustomEvent('springboot-log', {
        detail: {
          level: 'SQL',
          logger: 'org.hibernate.SQL',
          message: `UPDATE employees SET annual_allowance = ${nextAllowance} WHERE id = '${employeeId}'`,
          autoOpen: true
        }
      }));
    }

    const nextEmployees = employees.map((e) =>
      e.id === employeeId
        ? {
            ...e,
            annualAllowance: Math.max(10, Math.min(50, e.annualAllowance + delta))
          }
        : e
    );
    await syncToLocalAndBackend(nextEmployees, requests);
    showToast(`Yearly leave allowance updated successfully.`, 'success');
  };

  const handleVerifyEmployee = async (employeeId: string) => {
    const updatedEmployees = employees.map((emp) =>
      emp.id === employeeId ? { ...emp, isPendingReview: false } : emp
    );
    // Persist list locally and update in-memory Node state
    setEmployees(updatedEmployees);
    localStorage.setItem('echobees_employees', JSON.stringify(updatedEmployees));

    try {
      const response = await fetch('/api/employees/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: employeeId, isPendingReview: false })
      });

      if (response.ok) {
        showToast('Employee account verified & fully activated!', 'success');
        const parsedRes = await response.json();
        const emp = parsedRes.employee;
        
        // Push custom hibernate logging trigger to logging console!
        window.dispatchEvent(new CustomEvent('springboot-log', {
          detail: {
            level: 'INFO',
            logger: 'org.hibernate.engine.transaction.internal.TransactionImpl',
            message: `TRANSACTION COMPLETE: Updated active employee role assignment context for [${emp.name} - ${emp.email}]. Synchronized Hikari connection.`,
            autoOpen: true
          }
        }));
      } else {
        showToast('Error syncing profile settings with server.', 'error');
      }
    } catch (err) {
      showToast('Offline fallback: verified in-memory locally.', 'success');
    }
  };

  // Handlers for registering new people and syncing them
  const handleRegisterSuccess = (newEmployee: Employee) => {
    const nextEmployees = [...employees, newEmployee];
    syncToLocalAndBackend(nextEmployees, requests);
  };

  const activeEmployee = employees.find((e) => e.id === currentEmployeeId) || employees[0];
  const personalRequests = requests.filter((r) => r.employeeId === currentEmployeeId);

  // Separate Login Gate integration check
  if (!loggedInUser) {
    return (
      <LoginScreen 
        employees={employees} 
        onLoginSuccess={handleLoginSuccess} 
        onRegisterSuccess={handleRegisterSuccess} 
      />
    );
  }

  return (
    <div id="hr-portal-root" className="min-h-screen bg-radial from-[#FCFCFA] via-[#F7F5EE] to-[#EDE9DC] text-[#1F190F] flex flex-col font-sans relative overflow-hidden transition-colors duration-200">
      
      {/* Abstract warm golden honey and amber ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-200/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-orange-100/5 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Alert Banner */}
      <AnimatePresence>
        {alert && (
          <motion.div
            id="toast-notification-panel"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xs shadow-lg border bg-[#FAF9F5]/95 border-[#DECEB6]/60 backdrop-blur-md"
          >
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            ) : alert.type === 'error' ? (
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
            ) : (
              <Clock className="w-4.5 h-4.5 text-amber-600 shrink-0" />
            )}
            <span className="text-xs font-semibold text-[#1F190F]">
              {alert.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Professional Administrative Header */}
      <header id="main-admin-navigation" className="bg-[#FAF9F5]/90 border-b border-[#DECEB6]/60 backdrop-blur-md px-6 py-4 sticky top-0 z-30 relative shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo / Title Pairings */}
          <div className="flex items-center gap-3">
            <EchobeesLogo size="sm" />
            <div>
              <h1 className="text-2xl font-serif text-[#1F190F] tracking-tight flex items-center gap-2 leading-none">
                <motion.span
                  initial={{ scale: 0.3, y: 15, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 285, damping: 13, delay: 0.1 }}
                  className="inline-block relative"
                >
                  echo<span className="font-black italic text-amber-600 drop-shadow-[0_0_12px_rgba(217,119,6,0.22)]">bees</span>
                </motion.span>
              </h1>
              <div className="flex items-center gap-1.5 mt-1.55">
                <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" />
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#615542] font-mono font-bold">
                  Secure Leave Management Portal
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Security Session Badge */}
          <div className="flex flex-wrap items-center gap-3.5">
            {/* Display session info */}
            <div className="flex items-center gap-2 bg-[#FCFBF8] border border-[#DECEB6]/50 px-3 py-1.5 rounded-xs shadow-xs">
              <User className="w-3.5 h-3.5 text-[#615542] shrink-0" />
              <div className="text-left font-mono">
                <span className="block text-[10px] font-bold text-[#1F190F] leading-none">
                  {loggedInUser.name}
                </span>
                <span className="block text-[8px] text-[#615542] uppercase tracking-wider font-semibold mt-0.5">
                  Role: {loggedInUser?.role === 'hr' ? 'HR Administrator' : 'Staff Employee'}
                </span>
              </div>
            </div>

            {/* Custom controls based on separate HR/Employee layout authorization */}
            {loggedInUser?.role === 'hr' ? (
              <>
                {/* HR Auditing Employee scope selector */}
                <div className="flex items-center gap-2 bg-[#FCFBF8] pl-3 pr-2 py-1.5 rounded-xs border border-[#DECEB6]/60 shadow-xs">
                  <span className="text-[9px] text-[#615542] uppercase font-mono tracking-wider">
                    Auditing File:
                  </span>
                  <select
                    id="viewing-profile-picker"
                    value={currentEmployeeId}
                    onChange={(e) => setCurrentEmployeeId(e.target.value)}
                    className="bg-transparent border-none text-xs font-semibold text-[#1F190F] focus:outline-hidden outline-hidden cursor-pointer"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id} className="bg-[#FAF9F5] text-[#1F190F]">
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dashboard selector */}
                <button
                  id="admin-role-toggle"
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xs text-[11px] font-bold uppercase tracking-widest border transition shadow-xs ${
                    isAdminMode
                      ? 'bg-[#1F190F] text-[#FCFCFA] hover:bg-[#342D1F] border-transparent'
                      : 'bg-white text-[#1F190F] border-[#DECEB6] hover:bg-[#FAF9F5]'
                  } cursor-pointer`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{isAdminMode ? 'Exit Admin Mode' : 'HR Corporate Desk'}</span>
                </button>
              </>
            ) : null}

            {/* Global secure logout action */}
            <button
              onClick={handleLogoutSequence}
              className="flex items-center gap-2 px-3 py-2 bg-transparent hover:bg-rose-50 border border-rose-200 hover:border-rose-300 text-rose-700 rounded-xs text-[11px] font-bold uppercase tracking-wider transition cursor-pointer shadow-xs"
              title="Terminate Security Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Area limits */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Active Employee Personal Highlight bar (Skipped if Manager board override is active) */}
        {!isAdminMode && (
          <motion.section
            id="user-profile-header-summary"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#FAF9F5]/95 rounded-xs border border-[#DECEB6]/60 p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md backdrop-blur-md z-10"
          >
            <div className="flex items-center gap-4">
              <motion.img
                whileHover={{ scale: 1.05 }}
                referrerPolicy="no-referrer"
                src={activeEmployee.avatar}
                alt={activeEmployee.name}
                className="w-16 h-16 rounded-xs border border-[#DECEB6]/50 object-cover grayscale hover:grayscale-0 transition-all duration-300"
              />
              <div>
                <h2 className="text-2xl font-serif italic text-[#1F190F] leading-none">
                  {activeEmployee.name}
                </h2>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2.5 text-xs text-[#615542] items-center">
                  <span className="flex items-center gap-1.5 text-[#1F190F] font-semibold">
                    <Briefcase className="w-3.5 h-3.5 text-[#615542]" />
                    <span>{activeEmployee.role}</span>
                  </span>
                  <span className="text-[#DECEB6]/60">•</span>
                  <span>{activeEmployee.department}</span>
                  <span className="text-[#DECEB6]/60">•</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#615542]">Joined: {activeEmployee.joinedDate}</span>
                </div>
              </div>
            </div>

            {/* Leaves Allocation Pools Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 self-stretch md:self-auto md:w-auto min-w-[320px]">
              {Object.values(LeaveType).map((type, index) => {
                const cInfo = getLeaveTypeColor(type);
                const accrued = activeEmployee.accruedDays[type];
                const used = activeEmployee.usedDays[type];
                const available = Math.max(0, Number((accrued - used).toFixed(1)));

                return (
                  <motion.div
                    key={type}
                    id={`stat-badge-${type}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 18,
                      opacity: { duration: 0.3, delay: index * 0.05 },
                      y: { duration: 0.3, delay: index * 0.05 }
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      borderColor: cInfo.hex,
                      boxShadow: `0 0 22px ${cInfo.hex}15`,
                      backgroundColor: '#FAF9F5'
                    }}
                    style={{ willChange: "transform" }}
                    className="bg-[#FCFBF8] p-4 rounded-xs border border-[#DECEB6]/50 flex flex-col items-center justify-center text-center cursor-default group transition-colors duration-200 shadow-xs"
                  >
                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#615542] mb-1.5 font-sans group-hover:text-[#1F190F] transition-colors duration-200">
                      {getLeaveTypeLabel(type).split(' ')[0]}
                    </span>
                    <span className="text-2xl font-light text-[#1F190F] font-serif flex items-baseline gap-1">
                      <motion.span
                        key={available}
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block"
                      >
                        {available}
                      </motion.span>
                      <span className="text-[10px] text-[#615542] font-sans uppercase tracking-widest font-normal">Days</span>
                    </span>
                    <span className="text-[10px] text-[#615542] font-mono mt-1 group-hover:text-[#1F190F] transition-colors duration-200">
                      {used}d / {accrued}d used
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Dynamic Route Switching transitions (Manager vs Employee UI Panel) */}
        <AnimatePresence mode="wait">
          {isAdminMode ? (
            /* MANAGER SCREEN PANEL */
            <motion.div
              id="manager-dashboard-view"
              key="manager-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ManagerView
                requests={requests}
                employees={employees}
                onAction={handleManagerAction}
                onAdjustAllowance={handleAdjustAllowance}
                onVerifyEmployee={handleVerifyEmployee}
              />
            </motion.div>
          ) : (
            /* EMPLOYEE SCREEN PANEL */
            <motion.div
              id="employee-dashboard-view"
              key="employee-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Top Row: Request Form & Accrual Calculator / Sync Box */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Submit Application Form */}
                <div className="lg:col-span-4 space-y-6">
                  <LeaveRequestForm
                    employee={activeEmployee}
                    onSubmit={handleAddNewLeaveRequest}
                    existingRequests={requests}
                  />
                </div>

                {/* Schedule Hub view calendar */}
                <div className="lg:col-span-8">
                  <CalendarView
                    requests={personalRequests}
                    teamRequests={requests}
                  />
                </div>
              </div>

              {/* Middle Row: Forecaster Simulation slider */}
              <AccrualSimulator employee={activeEmployee} />

              {/* Bottom Row: History Log & Decision Mailbox side-by-side */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Leave History Log */}
                <div className="lg:col-span-7 flex flex-col">
                  <section
                    id="leave-history-log-card"
                    className="bg-[#FAF9F5]/90 rounded-xs border border-[#DECEB6]/60 p-6 shadow-md backdrop-blur-md z-10 relative h-full flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-[#FCFBF8] border border-[#DECEB6]/50 rounded-xs text-[#1F190F] shadow-xs">
                          <History className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-serif italic text-[#1F190F] tracking-tight">
                            Your Leave History ledger
                          </h3>
                          <p className="text-[10px] uppercase tracking-widest text-[#615542] mt-1">
                            View details and approval tracks of your requested blocks.
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto font-sans">
                        {personalRequests.length === 0 ? (
                          <div className="text-center py-6 text-[#615542] text-xs font-sans">
                            No leave requests registered. Apply for a leave above to make a track record.
                          </div>
                        ) : (
                          <table className="w-full text-left text-sm border-collapse">
                            <thead>
                              <tr className="text-[9px] uppercase tracking-[0.2em] text-[#615542] border-b border-[#DECEB6]/50 pb-2 mb-3 font-bold">
                                <th className="py-2.5 px-3 font-semibold">Category</th>
                                <th className="py-2.5 px-3 font-semibold">Interval / Dates</th>
                                <th className="py-2.5 px-3 text-center font-semibold">Work Days</th>
                                <th className="py-2.5 px-3 font-semibold">Comment / Purpose</th>
                                <th className="py-2.5 px-3 text-right font-semibold">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DECEB6]/30">
                              <AnimatePresence initial={false}>
                                {personalRequests.map((req, idx) => {
                                  const tCol = getLeaveTypeColor(req.type);
                                  const isApproved = req.status === LeaveStatus.APPROVED;
                                  return (
                                    <motion.tr
                                      layout
                                      key={req.id}
                                      id={`history-tr-${req.id}`}
                                      initial={{ opacity: 0, y: 12 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, x: -10 }}
                                      transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.2) }}
                                      className="hover:bg-[#FCFBF8]/80 transition text-xs text-[#1F190F]"
                                    >
                                      <td className="py-3 px-3">
                                        <span className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold border uppercase ${tCol.bg} ${tCol.text} ${tCol.border}`}>
                                          {getLeaveTypeLabel(req.type)}
                                        </span>
                                      </td>
                                      <td className="py-3 px-3 font-mono text-xs text-[#1F190F]">
                                        {req.startDate} <span className="text-[#615542]">to</span> {req.endDate}
                                      </td>
                                      <td className="py-3 px-3 text-center font-bold text-xs text-[#1F190F]">
                                        {req.totalDays}
                                      </td>
                                      <td className="py-3 px-3 text-xs text-[#615542] italic">
                                        {req.reason || '—'}
                                      </td>
                                      <td className="py-3 px-3 text-right">
                                        <span className={`inline-block px-2.5 py-0.5 rounded-xs text-[9px] font-bold uppercase border ${
                                          req.status === LeaveStatus.APPROVED
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : req.status === LeaveStatus.PENDING
                                            ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                          {req.status}
                                        </span>
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
                  </section>
                </div>

                {/* Email Notifications Mockup Inbox */}
                <div className="lg:col-span-5 flex flex-col">
                  <EmailNotificationsMockup
                    personalRequests={personalRequests}
                    activeEmployee={activeEmployee}
                  />
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Modern Compact Minimal Footer */}
      <footer id="main-portal-footer" className="bg-[#FAF9F5]/80 border-t border-[#DECEB6]/50 px-10 py-6 mt-12 shrink-0 flex justify-between z-10 relative">
        <div className="text-[10px] text-[#615542] uppercase tracking-widest">
          © 2026 Echobees Enterprise | Secure Corporate Portal
        </div>
        <div className="text-[10px] text-[#615542] uppercase tracking-widest flex gap-4">
          <span className="hover:text-amber-850 cursor-pointer select-none font-bold">Policy Handbook</span>
          <span className="hover:text-amber-850 cursor-pointer select-none font-bold">Support</span>
        </div>
      </footer>

    </div>
  );
}
