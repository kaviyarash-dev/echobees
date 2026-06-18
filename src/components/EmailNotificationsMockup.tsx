import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  MailOpen, 
  Inbox, 
  ChevronRight, 
  AlertCircle, 
  Check, 
  Trash2, 
  ExternalLink, 
  User, 
  Calendar, 
  Clock, 
  ShieldCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { LeaveRequest, Employee, LeaveStatus } from '../types';
import { getLeaveTypeColor, getLeaveTypeLabel } from '../utils/accrual';

interface EmailNotificationsMockupProps {
  personalRequests: LeaveRequest[];
  activeEmployee: Employee;
}

interface SimulatedEmail {
  id: string; // matches Request ID
  from: string;
  fromName: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  isRead: boolean;
  status: LeaveStatus;
  request: LeaveRequest;
}

export function EmailNotificationsMockup({ personalRequests, activeEmployee }: EmailNotificationsMockupProps) {
  const [readEmailIds, setReadEmailIds] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SimulatedEmail | null>(null);
  const [toastEmail, setToastEmail] = useState<SimulatedEmail | null>(null);
  const [prevRequestStates, setPrevRequestStates] = useState<Record<string, LeaveStatus>>({});

  // 1. Recover read email states from local storage
  useEffect(() => {
    const saved = localStorage.getItem(`echobees_read_emails_${activeEmployee.id}`);
    if (saved) {
      try {
        setReadEmailIds(JSON.parse(saved));
      } catch (e) {
        console.error("Error reading notifications read state", e);
      }
    }
  }, [activeEmployee.id]);

  // 2. Monitor for changes in statuses to trigger a desktop email popup notification!
  useEffect(() => {
    // Collect the resolved requests
    const resolved = personalRequests.filter(
      (r) => r.status === LeaveStatus.APPROVED || r.status === LeaveStatus.REJECTED
    );

    // Track state mutations
    let newlyResolvedEmail: SimulatedEmail | null = null;
    const nextStates: Record<string, LeaveStatus> = {};

    resolved.forEach((req) => {
      nextStates[req.id] = req.status;

      // If we had a previous state, and it was PENDING (not yet solved), and now it resolved
      const prevState = prevRequestStates[req.id];
      if (prevState && prevState === LeaveStatus.PENDING) {
        // Trigger notification
        newlyResolvedEmail = compileEmail(req, activeEmployee, false);
      }
    });

    // Save previous states
    // Initialize any ongoing ones
    personalRequests.forEach((req) => {
      nextStates[req.id] = req.status;
    });

    // Only update state if it changed from initial load
    if (Object.keys(prevRequestStates).length > 0) {
      if (newlyResolvedEmail) {
        setToastEmail(newlyResolvedEmail);
        // Auto-dismiss desktop toaster after 10 seconds
        setTimeout(() => {
          setToastEmail(null);
        }, 10000);
      }
    }

    setPrevRequestStates(nextStates);
  }, [personalRequests, activeEmployee]);

  // Handle marking an email as read
  const handleMarkAsRead = (id: string) => {
    if (!readEmailIds.includes(id)) {
      const nextRead = [...readEmailIds, id];
      setReadEmailIds(nextRead);
      localStorage.setItem(`echobees_read_emails_${activeEmployee.id}`, JSON.stringify(nextRead));
    }
  };

  // Reset all unread status for testing
  const handleResetUnread = () => {
    setReadEmailIds([]);
    localStorage.removeItem(`echobees_read_emails_${activeEmployee.id}`);
  };

  // Compile individual leave request data into a mock corporate HTML email style
  function compileEmail(req: LeaveRequest, emp: Employee, isRead: boolean): SimulatedEmail {
    const isApp = req.status === LeaveStatus.APPROVED;
    const leaveLabel = getLeaveTypeLabel(req.type).toLowerCase();
    
    const subject = isApp
      ? `[APPROVED] Your ${leaveLabel} leave application starting ${req.startDate} is confirmed`
      : `[REJECTED] Update regarding your ${leaveLabel} leave request for ${req.startDate}`;

    const decisionTime = req.approvedAt 
      ? new Date(req.approvedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
      : new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    // Enterprise mock email HTML-style content
    const body = `
      Dear ${emp.name},
      
      We are writing to officially communicate the administrative decision regarding your leave application request (Ref: HR-${req.id.toUpperCase()}).

      Your application for ${req.totalDays} day(s) of ${getLeaveTypeLabel(req.type).toUpperCase()} leave has been reviewed by your department manager and Human Resources.

      --- LEAVE SPECIFICATIONS ---
      Type of Absence:  ${getLeaveTypeLabel(req.type)} Leave
      Duration:         ${req.startDate} through ${req.endDate} (${req.totalDays} business day(s))
      Reason Stated:    ${req.reason || '"No detailed comment provided"'}
      Status Adjusted:  ${req.status.toUpperCase()}
      Action Date:      ${decisionTime}
      ----------------------------

      ${isApp 
        ? `DECISION MEMORANDUM:
        This leave request has been approved. Your vacation allowance ledger is automatically debited. Our corporate calendar system has been synchronized, and your status metadata on internal messaging tools will reflect OOO (Out of Office) during this block. Please complete any key handovers with your team before logging out.` 
        : `DECISION MEMORANDUM:
        After evaluating team resource capacity, your request is unfortunately rejected. This typically occurs because other crew members are away during the same timeframe, or due to critical delivery deadlines. Please align directly with your supervisor to find an alternative date.`
      }

      Thank you for your professionalism.

      Respectfully,
      Human Resources Administration
      Echobees Cloud Systems Inc.
      -----------------
      This email is an automated transmission from the Secure HR Portal. Direct replies are routed to policy-bot@corporate.echobees.com.
    `;

    return {
      id: req.id,
      from: 'decision-tracking@corporate.echobees.com',
      fromName: 'Echobees Human Resources',
      to: emp.email,
      subject,
      date: req.approvedAt ? new Date(req.approvedAt).toLocaleDateString() : new Date().toLocaleDateString(),
      body,
      isRead,
      status: req.status,
      request: req
    };
  }

  // Filter requests that are resolved and build mock email list
  const resolvedRequests = personalRequests.filter(
    (r) => r.status === LeaveStatus.APPROVED || r.status === LeaveStatus.REJECTED
  );

  const emails: SimulatedEmail[] = resolvedRequests.map((req) => {
    const isRead = readEmailIds.includes(req.id);
    return compileEmail(req, activeEmployee, isRead);
  });

  const unreadCount = emails.filter((e) => !e.isRead).length;

  return (
    <div id="email-mockup-section" className="bg-[#FAF9F5]/90 border border-[#DECEB6]/60 rounded-xs p-6 shadow-md backdrop-blur-md relative z-10 flex flex-col h-full">
      
      {/* Dynamic desktop-style notification alert overlay */}
      <AnimatePresence>
        {toastEmail && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
            className="fixed bottom-6 right-6 z-55 max-w-sm w-full bg-white border-2 border-amber-600 rounded-sm shadow-2xl p-4 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-700" />
            <div className="flex gap-3">
              <div className="p-2 bg-amber-50 rounded-xs text-amber-600 h-fit">
                <Mail className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-amber-700 font-bold uppercase">
                    New Outlook Alert
                  </span>
                  <button 
                    onClick={() => setToastEmail(null)}
                    className="text-gray-400 hover:text-gray-650 cursor-pointer p-0.5 text-xs font-mono"
                  >
                    [x]
                  </button>
                </div>
                <h4 className="text-xs font-extrabold text-[#1F190F] truncate mt-1">
                  {toastEmail.subject}
                </h4>
                <p className="text-[10px] text-[#615542] line-clamp-2 mt-1 leading-normal font-medium">
                  {toastEmail.fromName} has processed status for leave request ref HR-{toastEmail.id.toUpperCase()}.
                </p>
                <div className="flex gap-2.5 mt-3 justify-end">
                  <button
                    onClick={() => {
                      handleMarkAsRead(toastEmail.id);
                      setSelectedEmail(toastEmail);
                      setToastEmail(null);
                    }}
                    className="px-2.5 py-1 bg-amber-550 hover:bg-amber-650 text-white rounded-xs font-mono text-[9px] font-bold uppercase cursor-pointer"
                  >
                    Open Mail
                  </button>
                  <button
                    onClick={() => setToastEmail(null)}
                    className="px-2.5 py-1 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xs font-mono text-[9px] font-bold uppercase cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Area */}
      <div className="flex items-center justify-between border-b border-[#DECEB6]/30 pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Mail className="w-4.5 h-4.5 text-amber-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1 bg-rose-500 text-white text-[8px] font-bold px-1 rounded-full animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#1F190F] font-mono flex items-center gap-1.5">
              <span>Decision Mailbox</span>
              <span className="text-[10px] font-sans font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 rounded-xs">
                Mockup
              </span>
            </h3>
            <p className="text-[9px] text-[#615542] font-mono font-semibold">
              Official workspace decision statements synchronized live.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {readEmailIds.length > 0 && (
            <button
              onClick={handleResetUnread}
              title="Reset all emails to Unread"
              className="text-[#615542] hover:text-[#1F190F] transition p-1 hover:bg-amber-50 rounded-xs flex items-center gap-1 text-[8px] font-mono font-extrabold uppercase"
            >
              <RotateCcw className="w-3 h-3 text-[#615542]" />
              Reset
            </button>
          )}
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5">
            SMTP Active
          </span>
        </div>
      </div>

      {/* Inbox Body */}
      <div className="flex-1 overflow-y-auto max-h-[295px] pr-1.5 space-y-2">
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-[#FCFBF8] border border-[#DECEB6]/40 rounded-xs shadow-xs min-h-[170px]">
            <Inbox className="w-8 h-8 text-[#DECEB6] stroke-[1.5] mb-2" />
            <h4 className="text-xs font-bold text-[#1F190F] uppercase tracking-wider">
              No leave decision mails
            </h4>
            <p className="text-[10px] text-[#615542] mt-1 font-semibold max-w-[220px] leading-relaxed">
              When a manager approves or rejects your application, the mockup email decision notification will instantly populate here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#DECEB6]/20">
            {emails.map((email) => {
              const isApp = email.status === LeaveStatus.APPROVED;
              return (
                <div
                  key={email.id}
                  onClick={() => {
                    handleMarkAsRead(email.id);
                    setSelectedEmail(email);
                  }}
                  className={`py-3 px-3 flex gap-2.5 items-start cursor-pointer hover:bg-[#F2EDE2]/40 transition duration-150 relative group ${
                    !email.isRead ? 'bg-amber-50/25 border-l-2 border-amber-600' : 'border-l-2 border-transparent'
                  }`}
                >
                  {/* Status Indicator Dot */}
                  <div className="mt-0.5 h-4 w-4 relative shrink-0 flex items-center justify-center">
                    {!email.isRead ? (
                      <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse absolute" />
                    ) : (
                      <MailOpen className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-700 transition-colors" />
                    )}
                  </div>

                  {/* Mail description */}
                  <div className="flex-1 min-w-0 font-sans">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-[#1F190F] group-hover:text-amber-800 transition-colors">
                        Echobees HR Decision
                      </span>
                      <span className="text-[9px] font-mono text-[#615542] whitespace-nowrap">
                        {email.date}
                      </span>
                    </div>

                    <h4 className={`text-xs mt-1 truncate ${!email.isRead ? 'font-extrabold text-[#1F190F]' : 'font-semibold text-gray-700'}`}>
                      {email.subject}
                    </h4>

                    <p className="text-[10px] text-[#615542] line-clamp-1 mt-0.5 font-medium leading-relaxed">
                      {email.body.split('--- LEAVE SPECIFICATIONS ---')[0].trim()}
                    </p>

                    {/* Meta tag */}
                    <div className="flex gap-1.5 mt-1.5">
                      <span className={`text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs border ${
                        isApp 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {email.status}
                      </span>
                      <span className="text-[8px] font-mono text-gray-500 font-semibold uppercase">
                        Ref: HR-{email.id.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 self-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* HTML Email Modal Reader Overlay */}
      <AnimatePresence>
        {selectedEmail && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-55">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-[#FCFCFA] border-2 border-[#DECEB6] rounded-xs shadow-2xl overflow-hidden self-center flex flex-col font-sans max-h-[85vh]"
            >
              {/* Mail Application Header UI Layout */}
              <div className="bg-[#1F190F] text-[#FCFCFA] p-4 flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-600 rounded-xs text-white">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-black font-mono tracking-widest text-[#FAF9F5]">
                    Secure Work Email Client
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="px-2 py-1 border border-[#DECEB6]/50 bg-white/10 hover:bg-white/20 text-[#FAF9F5] hover:text-white transition font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer rounded-xs"
                >
                  Close Message [Esc]
                </button>
              </div>

              {/* Envelope Header Fields info */}
              <div className="bg-[#FAF9F5] p-5 border-b border-[#DECEB6]/45 font-sans shrink-0">
                <div className="space-y-1.5 text-xs text-[#1F190F]">
                  <div className="flex">
                    <span className="w-16 font-mono text-gray-500 uppercase tracking-wider font-bold">From:</span>
                    <span className="font-bold flex items-center gap-1.5">
                      {selectedEmail.fromName} 
                      <span className="text-[10px] text-amber-700 font-semibold font-mono select-all">&lt;{selectedEmail.from}&gt;</span>
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-16 font-mono text-gray-500 uppercase tracking-wider font-bold">To:</span>
                    <span className="font-semibold select-all text-gray-700">{selectedEmail.to}</span>
                  </div>
                  <div className="flex">
                    <span className="w-16 font-mono text-gray-500 uppercase tracking-wider font-bold">Date:</span>
                    <span className="font-mono font-bold text-gray-700">{selectedEmail.request.approvedAt ? new Date(selectedEmail.request.approvedAt).toUTCString() : new Date().toUTCString()}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-16 font-mono text-gray-500 uppercase tracking-wider shrink-0 font-bold mt-0.5">Subject:</span>
                    <span className="font-extrabold text-[#1F190F] leading-tight select-all">{selectedEmail.subject}</span>
                  </div>
                </div>
              </div>

              {/* High-Fidelity HR Letterhead Container */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#FCFBF8]">
                <div className="bg-white border border-[#DECEB6]/50 p-6 md:p-8 max-w-xl mx-auto shadow-xs rounded-xs relative">
                  
                  {/* Decorative corporate letterhead header */}
                  <div className="flex items-center justify-between border-b-2 border-amber-600/60 pb-4 mb-6">
                    <div>
                      <h2 className="text-lg font-serif tracking-tight text-slate-800 flex items-center gap-1 z-10">
                        echo<span className="font-bold italic text-amber-600">bees</span>
                      </h2>
                      <p className="text-[8px] font-mono text-slate-600 font-bold uppercase tracking-widest mt-0.5">
                        Human Capital Assurance Division
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-slate-900 text-[#FAF9F5] px-2 py-0.5 text-[8.5px] font-mono uppercase tracking-widest font-extrabold">
                        Confidential
                      </span>
                      <p className="text-[8px] font-mono text-gray-400 mt-1 uppercase font-bold">
                        Internal ID: Ref-{selectedEmail.id.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Watermark Logo absolute */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-2 pointer-events-none text-slate-900 scale-150">
                    <ShieldCheck className="w-48 h-48 text-[#1f190f]/5" />
                  </div>

                  {/* Letter content */}
                  <div className="space-y-4 text-xs md:text-sm text-slate-800 font-sans leading-relaxed relative z-10 whitespace-pre-wrap select-text">
                    {/* Parse body with nicer layout */}
                    <p className="font-semibold text-slate-900 border-b border-dashed border-gray-150 pb-2">
                      Dear {activeEmployee.name},
                    </p>
                    <p className="leading-relaxed">
                      We are writing to officially communicate the administrative decision regarding your leave application request (Ref: HR-{selectedEmail.id.toUpperCase()}).
                    </p>

                    {/* Table of metrics */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xs my-4 space-y-2 font-mono text-xs">
                      <div className="grid grid-cols-2 pb-1.5 border-b border-slate-200/50">
                        <span className="text-slate-500 font-bold">TYPE OF ABSENCE:</span>
                        <span className="text-slate-900 font-bold uppercase">{getLeaveTypeLabel(selectedEmail.request.type)} LEAVE</span>
                      </div>
                      <div className="grid grid-cols-2 pb-1.5 border-b border-slate-200/50">
                        <span className="text-slate-500 font-bold">BEGIN DATE:</span>
                        <span className="text-slate-900 font-bold">{selectedEmail.request.startDate}</span>
                      </div>
                      <div className="grid grid-cols-2 pb-1.5 border-b border-slate-200/50">
                        <span className="text-slate-500 font-bold">END DATE:</span>
                        <span className="text-slate-900 font-bold">{selectedEmail.request.endDate}</span>
                      </div>
                      <div className="grid grid-cols-2 pb-1.5 border-b border-slate-200/50">
                        <span className="text-slate-500 font-bold">TOTAL DAYS DEBITED:</span>
                        <span className="text-slate-900 font-bold">{selectedEmail.request.totalDays} day(s)</span>
                      </div>
                      <div className="grid grid-cols-2 pb-1.5 border-b border-slate-200/50">
                        <span className="text-slate-500 font-bold">DECISION STATUS:</span>
                        <span className={`font-black uppercase ${selectedEmail.status === LeaveStatus.APPROVED ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {selectedEmail.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-slate-500 font-bold">STATEMENT / COMMENT:</span>
                        <span className="text-slate-950 font-medium italic">{selectedEmail.request.reason || '"No detailed comment provided"'}</span>
                      </div>
                    </div>

                    <div className="leading-relaxed">
                      {selectedEmail.status === LeaveStatus.APPROVED ? (
                        <p className="bg-emerald-50/50 border border-emerald-200 p-3 text-slate-800 rounded-xs">
                          <strong>DECISION MEMORANDUM:</strong> This leave request has been approved. Your vacation allowance ledger has been updated, and your team schedule calendar is synchronized automatically. Please align with your direct teammates to delegate active responsibilities during your absence.
                        </p>
                      ) : (
                        <p className="bg-rose-50/50 border border-rose-200 p-3 text-slate-800 rounded-xs">
                          <strong>DECISION MEMORANDUM:</strong> After evaluating department shift schedules and current project release targets, your leave request is rejected. Please check other dates or communicate with your representative if this requires immediate escalation.
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-dashed border-gray-200 text-xs">
                      <p className="font-bold text-slate-700">Digital Validation Stamp Checked:</p>
                      <p className="text-[9px] font-mono text-gray-500 mt-1 uppercase font-semibold">
                        HASH VALIDITY: MD5_ECHO_DECISION_PORTAL_STAMP_SYS_{selectedEmail.id.toUpperCase()}
                      </p>
                    </div>

                    {/* Official Signatures */}
                    <div className="flex pt-6 justify-between text-xs font-serif italic text-slate-600">
                      <div>
                        <p className="underline underline-offset-4 decoration-amber-600/50">Admin System Bot</p>
                        <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 not-italic mt-1">
                          Automated Decisor
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="underline underline-offset-4 decoration-amber-600/50">{selectedEmail.fromName}</p>
                        <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 not-italic mt-1">
                          Human Capital Board
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* Reader Quick Mock Operations footer */}
              <div className="bg-[#FAF9F5] border-t border-[#DECEB6]/45 p-4 flex justify-between items-center shrink-0">
                <span className="text-[9px] font-mono font-bold text-[#615542] uppercase tracking-wider">
                  Secure S/MIME Signature Verified ✓
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      alert("Self-Service Ticket Print: Receipt acknowledged. PDF generation simulator logged.");
                    }}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-[#DECEB6] font-mono text-[9px] font-bold uppercase tracking-wider cursor-pointer rounded-xs"
                  >
                    Ack Receipt & Print
                  </button>
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="px-4 py-1.5 bg-[#1F190F] hover:bg-[#342D1F] text-white font-mono text-[9px] font-bold uppercase tracking-wider cursor-pointer rounded-xs"
                  >
                    Close
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
