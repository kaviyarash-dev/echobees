import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, User, Key, Mail, ChevronRight, CheckCircle, CheckCircle2, Info, Lock, Server, Database, ArrowLeft, Briefcase, Building, Sparkles } from 'lucide-react';
import { Employee, LeaveType } from '../types';
import { EchobeesLogo } from './EchobeesLogo';

interface LoginScreenProps {
  employees: Employee[];
  onLoginSuccess: (user: { role: 'hr' | 'employee'; employeeId?: string; name: string; email: string }) => void;
  onRegisterSuccess: (employee: Employee) => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
];

const DEPARTMENT_OPTIONS = [
  'Engineering Services',
  'Product Design',
  'Talent Acquisition',
  'Security & Operations',
  'Finance & Legal'
];

export function LoginScreen({ employees, onLoginSuccess, onRegisterSuccess }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'employee' | 'hr'>('employee');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('Junior Software Engineer');
  const [regDept, setRegDept] = useState('Engineering Services');
  const [regAvatar, setRegAvatar] = useState(AVATAR_OPTIONS[0]);

  const [employeeEmail, setEmployeeEmail] = useState('');
  const [hrEmail, setHrEmail] = useState('hr@echobees.com');
  const [hrPassword, setHrPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmployeeLogin = async (emailToSubmit: string) => {
    if (!emailToSubmit.trim()) {
      setError('Please provide a valid registered corporate email address.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSubmit.trim(), role: 'employee' })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        onLoginSuccess({
          role: 'employee',
          employeeId: resData.employeeId,
          name: resData.name,
          email: resData.email
        });
      } else {
        setError(resData.error || 'Server error verifying corporate ID.');
      }
    } catch (err) {
      setError('Connection failure matching server security ledger.');
    } finally {
      setLoading(false);
    }
  };

  const handleHrLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrEmail.trim() || !hrPassword.trim()) {
      setError('Both administrator email and secret key are required.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: hrEmail.trim(), password: hrPassword.trim(), role: 'hr' })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        onLoginSuccess({
          role: 'hr',
          name: resData.name,
          email: resData.email
        });
      } else {
        setError(resData.error || 'Invalid credential configuration.');
      }
    } catch (err) {
      setError('Connection failure matching administrator certificate.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setError('Full Name and Corporate Email are required properties.');
      return;
    }
    if (!regEmail.endsWith('@corporate.com') && !regEmail.endsWith('@echobees.com') && !regEmail.includes('@')) {
      setError('Please provide a valid authorized corporate email address.');
      return;
    }
    setError(null);
    setLoading(true);

    // Hibernate/JPA registration log-tail mock stream trigger
    window.dispatchEvent(new CustomEvent('springboot-log', {
      detail: {
        level: 'INFO',
        message: `JPA TRANSACTION: Initiating insert on new corporate user object [com.echobees.hrms.model.Employee]`
      }
    }));

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          role: regRole.trim(),
          department: regDept,
          avatar: regAvatar
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        // Trigger logger details simulating Hibernate SQL inserts
        window.dispatchEvent(new CustomEvent('springboot-log', {
          detail: {
            level: 'SQL',
            logger: 'org.hibernate.SQL',
            message: `INSERT INTO employees (id, name, email, role, department, joined_date, avatar, annual_allowance) VALUES ('${resData.employeeId}', '${regName.replace(/'/g, "''")}', '${regEmail.replace(/'/g, "''")}', '${regRole.replace(/'/g, "''")}', '${regDept}', '2026-06-18', '${regAvatar}', 25)`,
            autoOpen: true
          }
        }));

        window.dispatchEvent(new CustomEvent('springboot-log', {
          detail: {
            level: 'SQL',
            logger: 'org.hibernate.SQL',
            message: `INSERT INTO employee_accrued_days (employee_id, leave_type, days_count) VALUES ('${resData.employeeId}', 'annual', 0.0), ('${resData.employeeId}', 'sick', 10.0), ('${resData.employeeId}', 'parental', 30.0), ('${resData.employeeId}', 'unpaid', 90.0)`
          }
        }));

        window.dispatchEvent(new CustomEvent('springboot-log', {
          detail: {
            level: 'INFO',
            message: `DATABASE SYNCHRONIZED: Successfully created dynamic hibernate mapping for registered identity with security token ID ${resData.employeeId}. HikariPool connection validated.`
          }
        }));

        // Propagate registered employee back to the global app state
        onRegisterSuccess(resData.employee);

        setSuccess(`Registration successful! Account generated for ${regName}`);
        setEmployeeEmail(regEmail.trim().toLowerCase());
        
        // Clear registration properties
        setRegName('');
        setRegEmail('');
        
        // Auto-switch back to login after short delay
        setTimeout(() => {
          setIsRegistering(false);
          setSuccess(null);
        }, 1500);

      } else {
        setError(resData.error || 'Registration failed from server.');
      }
    } catch (err) {
      setError('Could not connect to database container to persist registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-radial from-[#FCFCFA] via-[#F7F5EE] to-[#EDE9DC] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Abstract warm golden honey and amber ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-200/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-orange-100/5 rounded-full blur-3xl pointer-events-none" />

      {/* Animated Pop-Up Logo Echobees with premium hardware-accelerated lag-free transitions */}
      <motion.div
        id="echobees-animated-logo"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.1
            }
          }
        }}
        className="flex flex-col items-center gap-2.5 mb-8 select-none"
      >
        <div className="flex items-center gap-4">
          <motion.div
            variants={{
              hidden: { scale: 0.85, rotate: -8, opacity: 0 },
              visible: { 
                scale: 1, 
                rotate: 0, 
                opacity: 1,
                transition: { ease: [0.16, 1, 0.3, 1], duration: 0.7 }
              }
            }}
            style={{ willChange: "transform, opacity" }}
          >
            <EchobeesLogo size="lg" />
          </motion.div>

          <div className="flex flex-col">
            <h1 className="text-4xl font-serif text-[#1F190F] tracking-tight leading-none flex items-center">
              {/* Animated letters for "echo" - premium cubic-bezier ease */}
              {["e", "c", "h", "o"].map((char, index) => (
                <motion.span
                  key={`echo-${index}`}
                  variants={{
                    hidden: { y: 12, opacity: 0, scale: 0.9 },
                    visible: { 
                      y: 0, 
                      opacity: 1, 
                      scale: 1,
                      transition: { ease: [0.16, 1, 0.3, 1], duration: 0.55 }
                    }
                  }}
                  style={{ willChange: "transform, opacity" }}
                  className="inline-block text-[#1F190F]"
                >
                  {char}
                </motion.span>
              ))}
              
              {/* Highlight colors for "bees" with elegant drop-shadow blooms */}
              {["b", "e", "e", "s"].map((char, index) => (
                <motion.span
                  key={`bees-${index}`}
                  variants={{
                    hidden: { y: -12, opacity: 0, scale: 1.1, rotate: -4 },
                    visible: { 
                      y: 0, 
                      opacity: 1, 
                      scale: 1,
                      rotate: 0,
                      transition: { ease: [0.16, 1, 0.3, 1], duration: 0.55 }
                    }
                  }}
                  style={{ willChange: "transform, opacity" }}
                  className="inline-block text-amber-600 italic font-black drop-shadow-[0_0_12px_rgba(217,119,6,0.22)]"
                >
                  {char}
                </motion.span>
              ))}
            </h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-amber-800/80 mt-1 font-mono flex items-center gap-1 font-bold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-650 animate-pulse" />
              Secure Leave Architecture
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Authentication Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#FAF9F5]/95 border border-[#DECEB6]/60 p-6 md:p-8 rounded-sm shadow-[0_20px_50px_rgba(40,30,10,0.06)] relative z-10 overflow-hidden backdrop-blur-md"
      >
        {/* Feedback Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="bg-rose-50 border border-rose-200/85 p-3 rounded-xs flex items-start gap-2.5 text-rose-850 font-mono text-[11px]">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="bg-emerald-50 border border-emerald-200/85 p-3 rounded-xs flex items-start gap-2.5 text-emerald-850 font-mono text-[11px]">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-650 shrink-0 mt-0.5 animate-bounce" />
                <span>{success}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isRegistering ? (
            /* ================= LOGIN INTERFACE ================= */
            <motion.div
              key="login-interface"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Tab Selection Row */}
              <div className="flex bg-[#F2EDE2] border border-[#DECEB6]/45 p-1 rounded-sm mb-6 relative">
                <button
                  type="button"
                  onClick={() => { setActiveTab('employee'); setError(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-wider relative z-10 transition-colors duration-200 cursor-pointer ${
                    activeTab === 'employee' ? 'text-[#1F190F] font-extrabold' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Employee Access</span>
                  {activeTab === 'employee' && (
                    <motion.div
                      layoutId="authTabIndicator"
                      className="absolute inset-0 bg-[#FCFCFA] rounded-xs -z-10 shadow-xs"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('hr'); setError(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-wider relative z-10 transition-colors duration-200 cursor-pointer ${
                    activeTab === 'hr' ? 'text-[#1F190F] font-extrabold' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>HR Administration</span>
                  {activeTab === 'hr' && (
                    <motion.div
                      layoutId="authTabIndicator"
                      className="absolute inset-0 bg-[#FCFCFA] rounded-xs -z-10 shadow-xs"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </div>

              {activeTab === 'employee' ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#615542] font-bold mb-2">
                      Corporate Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={employeeEmail}
                        onChange={(e) => setEmployeeEmail(e.target.value)}
                        placeholder="name@corporate.com"
                        className="w-full bg-[#FCFBF8] border border-[#DECEB6] rounded-xs py-2.5 pl-9 pr-4 text-xs font-mono text-[#1F190F] outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500/10 transition-all duration-300 placeholder:text-gray-400 shadow-inner"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEmployeeLogin(employeeEmail);
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleEmployeeLogin(employeeEmail)}
                    disabled={loading}
                    className="w-full py-3 bg-[#1F190F] text-[#FCFCFA] hover:bg-[#342D1F] font-bold uppercase tracking-widest text-[10px] rounded-xs transition-all duration-300 hover:scale-[1.015] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm font-sans"
                  >
                    <span>{loading ? 'Authenticating Gateway...' : 'Enter Leave Workspace'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Register link specifically for Employees */}
                  <div className="text-center pt-3 border-t border-[#DECEB6]/30 space-y-2">
                    <p className="text-[10px] text-gray-500 font-mono">
                      New to Echobees workforce system?
                    </p>
                    <button
                      type="button"
                      onClick={() => { setIsRegistering(true); setError(null); }}
                      className="text-amber-700 hover:text-amber-600 text-xs font-bold uppercase tracking-wider hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
                      <span>Register User profile</span>
                    </button>
                  </div>

                  {/* Quick click roster demo guides */}
                  <div className="pt-4 border-t border-[#DECEB6]/30">
                    <span className="block text-[8.5px] uppercase tracking-widest text-[#615542] font-mono mb-2">
                      Registered Employees (Instant Pass Click)
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                      {employees.map((emp) => (
                        <button
                          key={emp.id}
                          onClick={() => {
                            setEmployeeEmail(emp.email);
                            handleEmployeeLogin(emp.email);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xs bg-[#FAF9F5] border border-[#DECEB6]/30 hover:border-[#DECEB6]/70 hover:bg-[#FCFBF8] transition-all text-left text-xs cursor-pointer group animate-fade-in shadow-xs"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              referrerPolicy="no-referrer"
                              src={emp.avatar}
                              alt={emp.name}
                              className="w-6 h-6 rounded-none object-cover border border-[#DECEB6]/35 grayscale group-hover:grayscale-0 transition-all"
                            />
                            <div>
                              <span className="block text-[11px] font-bold text-[#1F190F] group-hover:text-amber-700 transition-colors">
                                {emp.name}
                              </span>
                              <span className="block text-[8px] text-gray-500 font-mono leading-none">
                                {emp.email}
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono uppercase text-gray-400 group-hover:text-amber-800 transition-colors">
                            {emp.department.split(' ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Tab 2: HR Administrator Verification */
                <form onSubmit={handleHrLogin} className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-[#615542] font-bold mb-2">
                        HR Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={hrEmail}
                          onChange={(e) => setHrEmail(e.target.value)}
                          placeholder="hr@echobees.com"
                          className="w-full bg-[#FCFBF8] border border-[#DECEB6] rounded-xs py-2.5 pl-9 pr-4 text-xs font-mono text-[#1F190F] outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500/10 transition-all duration-300 placeholder:text-gray-400 shadow-inner"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-[#615542] font-bold mb-2">
                        Secret Admin Passkey
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Key className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          required
                          value={hrPassword}
                          onChange={(e) => setHrPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#FCFBF8] border border-[#DECEB6] rounded-xs py-2.5 pl-9 pr-4 text-xs font-mono text-[#1F190F] outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500/10 transition-all duration-300 placeholder:text-gray-400 shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#FAF9F5] p-2.5 border border-[#DECEB6]/40 rounded-xs flex items-start gap-2 text-gray-600 font-mono text-[9px] leading-relaxed">
                    <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>Provide authorized address <strong className="text-[#1F190F]">hr@echobees.com</strong> with security token <strong className="text-[#1F190F]">admin123</strong> to enter administrator mode.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#1F190F] text-[#FCFCFA] hover:bg-[#342D1F] font-bold uppercase tracking-widest text-[10px] rounded-xs transition-all duration-300 hover:scale-[1.015] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm font-sans"
                  >
                    <span>{loading ? 'Verifying Admin Access...' : 'Verify Security Access'}</span>
                    <Shield className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            /* ================= REGISTRATION INTERFACE ================= */
            <motion.div
              key="registration-interface"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Back Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-[#DECEB6]/30">
                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); setError(null); }}
                  className="p-1 text-gray-500 hover:text-[#1F190F] transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-sm font-bold text-[#1F190F] uppercase tracking-wider">
                    Register Employee Profile
                  </h3>
                  <p className="text-[9px] text-[#615542] font-mono">
                    Registers profile identity inside the secure corporate directory
                  </p>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                {/* Full name input */}
                <div>
                  <label className="block text-[8.5px] uppercase tracking-wider text-[#615542] font-bold mb-1">
                    Employee Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-[#FCFBF8] border border-[#DECEB6] rounded-xs py-2 px-3.5 pl-9 text-xs font-mono text-[#1F190F] outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500/10 transition-all duration-300 shadow-inner"
                    />
                  </div>
                </div>

                {/* Corporate email input */}
                <div>
                  <label className="block text-[8.5px] uppercase tracking-wider text-[#615542] font-bold mb-1">
                    Corporate Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="type"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="jane.doe@corporate.com"
                      className="w-full bg-[#FCFBF8] border border-[#DECEB6] rounded-xs py-2 px-3.5 pl-9 text-xs font-mono text-[#1F190F] outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500/10 transition-all duration-300 shadow-inner"
                    />
                  </div>
                </div>

                {/* Role and Department Row */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[8.5px] uppercase tracking-wider text-[#615542] font-bold mb-1">
                      Professional Role
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                        <Briefcase className="w-3 h-3" />
                      </div>
                      <input
                        type="text"
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        placeholder="Security Analyst"
                        className="w-full bg-[#FCFBF8] border border-[#DECEB6] rounded-xs py-2 px-2.5 pl-8 text-xs font-mono text-[#1F190F] outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500/10 transition-all duration-300 shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8.5px] uppercase tracking-wider text-[#615542] font-bold mb-1">
                      Department
                    </label>
                    <div className="relative">
                      <select
                        value={regDept}
                        onChange={(e) => setRegDept(e.target.value)}
                        className="w-full h-[33.5px] bg-[#FCFBF8] border border-[#DECEB6] rounded-xs py-1.5 px-2.5 text-xs font-mono text-[#1F190F] outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500/10 transition-all duration-300 shadow-inner"
                      >
                        {DEPARTMENT_OPTIONS.map(dept => (
                          <option key={dept} value={dept} className="bg-[#FAF9F5] text-[#1F190F]">{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Selective avatar visual selection */}
                <div>
                  <label className="block text-[8.5px] uppercase tracking-wider text-[#615542] font-bold mb-1.5 flex items-center justify-between">
                    <span>Choose Professional Face</span>
                    <span className="text-[8px] font-mono text-amber-700 font-normal">Grid selected</span>
                  </label>
                  <div className="grid grid-cols-6 gap-2 bg-[#FCFBF9] border border-[#DECEB6]/55 p-2 rounded-xs">
                    {AVATAR_OPTIONS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRegAvatar(av)}
                        className={`relative aspect-square focus:outline-hidden transition-all cursor-pointer ${
                          regAvatar === av ? 'ring-2 ring-amber-600 scale-105' : 'opacity-55 hover:opacity-100 scale-95'
                        }`}
                      >
                        <img
                          referrerPolicy="no-referrer"
                          src={av}
                          alt={`option-${idx}`}
                          className="w-full h-full object-cover border border-[#DECEB6]/30"
                        />
                        {regAvatar === av && (
                          <div className="absolute inset-0 bg-amber-600/10 border border-amber-600 flex items-center justify-center">
                            <span className="bg-amber-600 p-0.5 rounded-full text-white">
                              <CheckCircle className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#FAF9F5] p-2 border border-[#DECEB6]/30 rounded-xs flex items-start gap-1.5 text-gray-500 font-mono text-[9px] leading-relaxed">
                  <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>Submitting registers your profile details in the secure database server database instantly.</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#1F190F] text-[#FCFCFA] hover:bg-[#342D1F] font-bold uppercase tracking-widest text-[10px] rounded-xs transition-all duration-300 hover:scale-[1.015] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                >
                  <span>{loading ? 'Registering Account...' : 'Register Corporate Account'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer details */}
      <div className="mt-8 text-center text-gray-500 font-mono text-[9px] uppercase tracking-widest relative z-10 select-none">
        <span>Echobees secure system ledger &copy; {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
