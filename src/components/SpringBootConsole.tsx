import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Database, Server, RefreshCw, Layers, HardDrive, CheckCircle2, AlertTriangle, ChevronUp, ChevronDown, ListFilter, Play, Eye } from 'lucide-react';
import { Employee, LeaveRequest } from '../types';

interface SpringBootConsoleProps {
  employees: Employee[];
  requests: LeaveRequest[];
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'DEBUG' | 'WARN' | 'SQL';
  thread: string;
  logger: string;
  message: string;
}

export function SpringBootConsole({ employees, requests }: SpringBootConsoleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'logs' | 'mysql' | 'schema' | 'connections'>('logs');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedTable, setSelectedTable] = useState<'employees' | 'leave_requests' | 'employee_accrued_days'>('employees');
  const [isQuerying, setIsQuerying] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Generate initial JPA Spring Boot startup log stack
  useEffect(() => {
    const formatTime = (offsetSec: number = 0) => {
      const d = new Date();
      d.setSeconds(d.getSeconds() - offsetSec);
      return d.toISOString().replace('T', ' ').substring(0, 19) + '.342';
    };

    const initial: LogEntry[] = [
      {
        id: 'start-1',
        timestamp: formatTime(25),
        level: 'INFO',
        thread: 'main',
        logger: 'c.e.hrms.HrmsApplication',
        message: 'Starting HrmsApplication v0.0.1-SNAPSHOT on spring-runner (Java 17 / Spring Boot 3.2.4)'
      },
      {
        id: 'start-2',
        timestamp: formatTime(24),
        level: 'INFO',
        thread: 'main',
        logger: 'c.e.hrms.HrmsApplication',
        message: 'No active profile set, falling back to 1 default profile: "production"'
      },
      {
        id: 'start-3',
        timestamp: formatTime(22),
        level: 'INFO',
        thread: 'main',
        logger: 'o.s.d.r.c.RepositoryConfigurationDelegate',
        message: 'Bootstrapping Spring Data JPA repositories in DEFAULT mode.'
      },
      {
        id: 'start-4',
        timestamp: formatTime(21),
        level: 'INFO',
        thread: 'main',
        logger: 'o.s.d.r.c.RepositoryConfigurationDelegate',
        message: 'Finished Spring Data repository scanning index. Found 2 JPA repository interfaces.'
      },
      {
        id: 'start-5',
        timestamp: formatTime(18),
        level: 'DEBUG',
        thread: 'main',
        logger: 'o.h.v.i.xml.config.ValidationXmlParser',
        message: 'Trying to open input stream for XML validation settings file: META-INF/validation.xml'
      },
      {
        id: 'start-6',
        timestamp: formatTime(16),
        level: 'INFO',
        thread: 'main',
        logger: 'com.zaxxer.hikari.HikariDataSource',
        message: 'HikariPool-1 - Starting...'
      },
      {
        id: 'start-7',
        timestamp: formatTime(15),
        level: 'INFO',
        thread: 'main',
        logger: 'com.zaxxer.hikari.pool.HikariPool',
        message: 'HikariPool-1 - Added connection to MySQL Database [jdbc:mysql://localhost:3306/echobees_db]'
      },
      {
        id: 'start-8',
        timestamp: formatTime(14),
        level: 'INFO',
        thread: 'main',
        logger: 'com.zaxxer.hikari.pool.PoolBase',
        message: 'HikariPool-1 - Connection test passed. MySQL Database operational (8.0.36)'
      },
      {
        id: 'start-9',
        timestamp: formatTime(12),
        level: 'SQL',
        thread: 'main',
        logger: 'org.hibernate.SQL',
        message: 'CREATE TABLE IF NOT EXISTS employees (id VARCHAR(50) PRIMARY KEY, name VARCHAR(255), email VARCHAR(...) UNIQUE, role VARCHAR(...))'
      },
      {
        id: 'start-10',
        timestamp: formatTime(11),
        level: 'SQL',
        thread: 'main',
        logger: 'org.hibernate.SQL',
        message: 'CREATE TABLE IF NOT EXISTS leave_requests (id VARCHAR(50) PRIMARY KEY, employee_id VARCHAR(50), start_date VARCHAR(...))'
      },
      {
        id: 'start-11',
        timestamp: formatTime(10),
        level: 'INFO',
        thread: 'main',
        logger: 'org.hibernate.e.t.j.p.i.JtaPlatformInitiator',
        message: 'HHH000490: Using JtaPlatform implementation: [org.hibernate.engine.transaction.jta.platform.internal.NoJtaPlatform]'
      },
      {
        id: 'start-12',
        timestamp: formatTime(9),
        level: 'INFO',
        thread: 'main',
        logger: 'j.LocalContainerEntityManagerFactoryBean',
        message: 'Initialized Hibernate Session / JPA EntityManagerFactory for MySQL default persistence schema'
      },
      {
        id: 'start-13',
        timestamp: formatTime(6),
        level: 'WARN',
        thread: 'main',
        logger: 'o.s.b.a.e.mvc.EndpointLinksResolver',
        message: 'Exposing 14 actuator management endpoints on spring.security context paths.'
      },
      {
        id: 'start-14',
        timestamp: formatTime(4),
        level: 'INFO',
        thread: 'main',
        logger: 'o.s.b.w.embedded.tomcat.TomcatWebServer',
        message: 'Tomcat started and listening on Spring Port 8080 (http) with standard application context.'
      },
      {
        id: 'start-15',
        timestamp: formatTime(0),
        level: 'INFO',
        thread: 'main',
        logger: 'c.e.hrms.HrmsApplication',
        message: 'SYSTEM BOOT SUCCESS: Synchronized state engine mapped to localhost mysql server.'
      }
    ];

    setLogs(initial);
  }, []);

  // Set up event listeners for Spring Boot simulated events
  useEffect(() => {
    const handleLogEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const now = new Date();
      const timeStr = now.toISOString().replace('T', ' ').substring(0, 19) + '.918';

      const logItem: LogEntry = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: timeStr,
        level: detail.level || 'INFO',
        thread: detail.thread || 'nio-8080-exec-' + Math.floor(Math.random() * 8 + 1),
        logger: detail.logger || 'c.e.h.c.HrmsController',
        message: detail.message
      };

      setLogs(prev => [...prev, logItem]);

      // Highlight/open console optionally if wanted
      if (detail.autoOpen) {
        setIsOpen(true);
      }
    };

    window.addEventListener('springboot-log', handleLogEvent);
    return () => {
      window.removeEventListener('springboot-log', handleLogEvent);
    };
  }, []);

  // Scroll to bottom of logs on updates if terminal is open
  useEffect(() => {
    if (isOpen && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  const clearLogs = () => {
    setLogs([]);
  };

  const forceResync = async () => {
    setIsQuerying(true);
    // Simulate MySQL query execution pause
    window.dispatchEvent(new CustomEvent('springboot-log', {
      detail: {
        level: 'INFO',
        logger: 'com.zaxxer.hikari.pool.HikariPool',
        message: 'Connection pool requested. Hardening JDBC tunnels. Synchronizing caches...'
      }
    }));
    
    await new Promise(r => setTimeout(r, 800));
    setIsQuerying(false);

    window.dispatchEvent(new CustomEvent('springboot-log', {
      detail: {
        level: 'SQL',
        logger: 'org.hibernate.SQL',
        message: `SELECT * FROM employees INNER JOIN employee_accrued_days ON employees.id = employee_accrued_days.employee_id`
      }
    }));

    window.dispatchEvent(new CustomEvent('springboot-log', {
      detail: {
        level: 'INFO',
        logger: 'c.e.h.c.HrmsController',
        message: `SUCCESS: Transferred ${employees.length} employee records and ${requests.length} leave requests on MySQL active thread.`
      }
    }));
  };

  const getLogLevelBg = (level: string) => {
    switch (level) {
      case 'SQL': return 'text-amber-450 font-bold';
      case 'WARN': return 'text-rose-450 font-extrabold bg-rose-500/10 px-1 rounded-sm';
      case 'DEBUG': return 'text-purple-400';
      case 'INFO':
      default:
        return 'text-emerald-450';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0E0E0E] border-t border-white/10 select-none font-mono">
      
      {/* Visual Diagnostic Handle/Toggle */}
      <div 
        id="springboot-dev-handle"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-6 py-2.5 bg-[#090909] cursor-pointer hover:bg-black/80 transition-all border-b border-white/5"
      >
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-white flex items-center gap-1.5">
            Spring Boot & MySQL Diagnoser
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </span>
          <span className="text-[9px] text-gray-500 hidden md:inline">
            | Port: 8080 (API) & 3306 (MySQL DB) | {logs.length} Transactions log-tailed
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-amber-400/90 font-bold uppercase tracking-wider bg-amber-950/20 border border-amber-900/30 px-2 py-0.5 rounded-sm">
                Live JPA Feed Toggle
              </span>
              <ChevronUp className="w-4 h-4 text-amber-400" />
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: '340px' }}
            exit={{ height: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="flex flex-col md:flex-row h-[340px] divide-x divide-white/10"
          >
            {/* Left side console sidebar tabs */}
            <div className="w-full md:w-56 bg-[#0A0A0A] p-2 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
              <button
                onClick={() => setActiveConsoleTab('logs')}
                className={`w-full text-left px-3 py-2 text-[10px] uppercase tracking-wider font-bold rounded-sm flex items-center gap-2 transition cursor-pointer ${
                  activeConsoleTab === 'logs' ? 'bg-[#161616] text-amber-450 border-l-2 border-amber-500' : 'text-gray-400 hover:bg-[#111] hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 shrink-0" />
                <span>JVM Console Feed</span>
              </button>
              <button
                onClick={() => setActiveConsoleTab('mysql')}
                className={`w-full text-left px-3 py-2 text-[10px] uppercase tracking-wider font-bold rounded-sm flex items-center gap-2 transition cursor-pointer ${
                  activeConsoleTab === 'mysql' ? 'bg-[#161616] text-amber-450 border-l-2 border-amber-500' : 'text-gray-400 hover:bg-[#111] hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span>MySQL DB Browser</span>
              </button>
              <button
                onClick={() => setActiveConsoleTab('schema')}
                className={`w-full text-left px-3 py-2 text-[10px] uppercase tracking-wider font-bold rounded-sm flex items-center gap-2 transition cursor-pointer ${
                  activeConsoleTab === 'schema' ? 'bg-[#161616] text-amber-450 border-l-2 border-amber-500' : 'text-gray-400 hover:bg-[#111] hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>JPA Entities & SQL schema</span>
              </button>
              <button
                onClick={() => setActiveConsoleTab('connections')}
                className={`w-full text-left px-3 py-2 text-[10px] uppercase tracking-wider font-bold rounded-sm flex items-center gap-2 transition cursor-pointer ${
                  activeConsoleTab === 'connections' ? 'bg-[#161616] text-amber-450 border-l-2 border-amber-500' : 'text-gray-400 hover:bg-[#111] hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5 shrink-0" />
                <span>Server Configurations</span>
              </button>

              <div className="hidden md:block mt-auto p-2.5 bg-amber-950/5 border border-amber-500/10 rounded-sm">
                <span className="block text-[8px] uppercase tracking-widest text-[#d97706] font-bold">Hibernate status</span>
                <p className="text-[10px] text-gray-400 leading-relaxed mt-1">
                  Connected using MySQLDialect over HikariPool. Automatic schema assertions loaded.
                </p>
              </div>
            </div>

            {/* Right side active display block */}
            <div className="flex-1 bg-black flex flex-col min-w-0">
              
              {/* Action Ribbon row */}
              <div className="h-9 border-b border-white/5 px-4 flex items-center justify-between text-[9px] uppercase tracking-wider bg-[#0C0C0C]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-gray-400 font-bold">
                    {activeConsoleTab === 'logs' ? 'tail -f logs/spring-boot.stdout' : 
                     activeConsoleTab === 'mysql' ? `query selector: select * from ${selectedTable}` : 
                     activeConsoleTab === 'schema' ? 'Schema schema.sql dictionary' : 
                     'Spring environment config'}
                  </span>
                </div>
                
                {activeConsoleTab === 'logs' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={forceResync}
                      disabled={isQuerying}
                      className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-450 font-bold uppercase rounded-sm transition flex items-center gap-1.5 cursor-pointer border border-amber-500/20 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isQuerying ? 'animate-spin' : ''}`} />
                      <span>Sync SQL Stream</span>
                    </button>
                    <button
                      onClick={clearLogs}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white font-bold uppercase rounded-sm transition cursor-pointer border border-white/10"
                    >
                      Clear Screen
                    </button>
                  </div>
                )}
              </div>

              {/* Console logs terminal view */}
              {activeConsoleTab === 'logs' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5 text-xs select-text selection:bg-amber-500/30 selection:text-white">
                  {logs.map((log) => (
                    <div key={log.id} className="leading-5 flex items-start gap-2.5 font-mono text-[11px] border-b border-white/[0.02] pb-0.5">
                      <span className="text-gray-500 shrink-0">{log.timestamp}</span>
                      <span className={`shrink-0 uppercase font-semibold text-[10px] w-12 text-center inline-block ${getLogLevelBg(log.level)}`}>
                        [{log.level}]
                      </span>
                      <span className="text-amber-500 shrink-0 hidden sm:inline">---</span>
                      <span className="text-purple-400 shrink-0 font-light hidden lg:inline">[{log.thread}]</span>
                      <span className="text-blue-400 shrink-0 hidden md:inline font-mono">{log.logger.padEnd(40)} :</span>
                      <span className={log.level === 'SQL' ? 'text-amber-250 font-medium whitespace-pre-wrap flex-1' : 'text-gray-300 whitespace-pre-wrap flex-1'}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={consoleEndRef} />
                </div>
              )}

              {/* MySQL DB Browser */}
              {activeConsoleTab === 'mysql' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Selector chips */}
                  <div className="flex gap-2 p-3 bg-[#070707] border-b border-white/5 shrink-0 overflow-x-auto">
                    {(['employees', 'leave_requests', 'employee_accrued_days'] as const).map((table) => (
                      <button
                        key={table}
                        onClick={() => setSelectedTable(table)}
                        className={`px-3 py-1 text-[9px] uppercase tracking-widest rounded-sm transition-all cursor-pointer font-bold border ${
                          selectedTable === table 
                            ? 'bg-amber-500/15 border-amber-500 text-amber-400 font-extrabold' 
                            : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {table} ({table === 'employees' ? employees.length : table === 'leave_requests' ? requests.length : employees.length * 4})
                      </button>
                    ))}
                  </div>

                  {/* Browser contents */}
                  <div className="flex-1 overflow-auto p-3">
                    <table className="w-full text-left font-mono text-[11px] leading-relaxed border-collapse">
                      <thead>
                        <tr className="bg-[#111] text-amber-500 text-[10px] uppercase font-semibold border-b border-white/10">
                          {selectedTable === 'employees' && (
                            <>
                              <th className="py-2 px-2 border-r border-white/5">ID</th>
                              <th className="py-2 px-2 border-r border-white/5">Name</th>
                              <th className="py-2 px-2 border-r border-white/5">Email</th>
                              <th className="py-2 px-2 border-r border-white/5">Role</th>
                              <th className="py-2 px-2 border-r border-white/5">Department</th>
                              <th className="py-2 px-2 border-r border-white/5">Allowance</th>
                            </>
                          )}
                          {selectedTable === 'leave_requests' && (
                            <>
                              <th className="py-2 px-2 border-r border-white/5">ID</th>
                              <th className="py-2 px-2 border-r border-white/5">Employee</th>
                              <th className="py-2 px-2 border-r border-white/5">Type</th>
                              <th className="py-2 px-2 border-r border-white/5">Start Date</th>
                              <th className="py-2 px-2 border-r border-white/5">End Date</th>
                              <th className="py-2 px-2 border-r border-white/5">Days</th>
                              <th className="py-2 px-2 border-r border-white/5">Status</th>
                            </>
                          )}
                          {selectedTable === 'employee_accrued_days' && (
                            <>
                              <th className="py-2 px-2 border-r border-white/5">Employee ID</th>
                              <th className="py-2 px-2 border-r border-white/5">Leave Type</th>
                              <th className="py-2 px-2 border-r border-white/5">Accrued Days</th>
                              <th className="py-2 px-2">Used Days</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedTable === 'employees' && employees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-white/5 text-gray-300">
                            <td className="py-1.5 px-2 border-r border-white/5 font-bold text-amber-400">{emp.id}</td>
                            <td className="py-1.5 px-2 border-r border-white/5 font-semibold text-white">{emp.name}</td>
                            <td className="py-1.5 px-2 border-r border-white/5 text-gray-400">{emp.email}</td>
                            <td className="py-1.5 px-2 border-r border-white/5 font-mono text-[10px] text-gray-400">{emp.role}</td>
                            <td className="py-1.5 px-2 border-r border-white/5 text-gray-500">{emp.department}</td>
                            <td className="py-1.5 px-2 border-r border-white/5 text-center text-emerald-400">{emp.annualAllowance}d</td>
                          </tr>
                        ))}

                        {selectedTable === 'leave_requests' && requests.map((req) => (
                          <tr key={req.id} className="hover:bg-white/5 text-gray-300">
                            <td className="py-1.5 px-2 border-r border-white/5 text-amber-400 font-bold">{req.id}</td>
                            <td className="py-1.5 px-2 border-r border-white/5 font-medium text-white">{req.employeeName}</td>
                            <td className="py-1.5 px-2 border-r border-white/5 text-cyan-400 uppercase font-semibold text-[10px]">{req.type}</td>
                            <td className="py-1.5 px-2 border-r border-white/5 text-gray-450">{req.startDate}</td>
                            <td className="py-1.5 px-2 border-r border-white/5 text-gray-450">{req.endDate}</td>
                            <td className="py-1.5 px-2 border-r border-white/5 text-center text-[#ffbd24]">{req.totalDays}d</td>
                            <td className="py-1.5 px-2 border-r border-white/5 uppercase">
                              <span className={`px-1.5 py-0.5 rounded-sm font-bold text-[9px] ${
                                req.status === 'approved' ? 'bg-emerald-950/20 text-emerald-400' :
                                req.status === 'pending' ? 'bg-amber-950/25 text-amber-400' : 'bg-rose-950/20 text-rose-450'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {selectedTable === 'employee_accrued_days' && employees.map((emp) => 
                          (Object.keys(emp.accruedDays) as Array<keyof typeof emp.accruedDays>).map((type) => (
                            <tr key={`${emp.id}-${type}`} className="hover:bg-white/5 text-gray-300">
                              <td className="py-1.5 px-2 border-r border-white/5 text-gray-400 font-bold">{emp.id} ({emp.name.split(' ')[0]})</td>
                              <td className="py-1.5 px-2 border-r border-white/5 text-orange-400 uppercase font-semibold text-[9px]">{type}</td>
                              <td className="py-1.5 px-2 border-r border-white/5 text-cyan-400">{emp.accruedDays[type]}d</td>
                              <td className="py-1.5 px-2 text-rose-450">{emp.usedDays[type]}d</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Entities SQL definitions code schemas */}
              {activeConsoleTab === 'schema' && (
                <div className="flex-1 overflow-y-auto p-4 text-xs font-mono text-gray-300 space-y-4">
                  <div>
                    <h4 className="text-amber-450 text-[11px] font-bold uppercase mb-1.5">1. Table creation statement definition `employees`</h4>
                    <pre className="p-3 bg-[#0A0A0A] border border-white/5 rounded-sm text-amber-100 overflow-x-auto text-[10px] leading-relaxed">
{`CREATE TABLE employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(255),
    department VARCHAR(255),
    joined_date VARCHAR(50),
    avatar VARCHAR(500),
    annual_allowance INT
);`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-amber-450 text-[11px] font-bold uppercase mb-1.5 font-mono">2. Spring JPA Employee Entity definition (JPA / Hibernate Entity)</h4>
                    <pre className="p-3 bg-[#0A0A0A] border border-white/5 rounded-sm text-green-300 overflow-x-auto text-[10px] leading-relaxed">
{`@Entity
@Table(name = "employees")
public class Employee {
    @Id
    private String id;
    private String name;
    private String email;
    private String role;
    private String department;
    private String joinedDate;
    private String avatar;
    private Integer annualAllowance;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "employee_accrued_days", joinColumns = @JoinColumn(name = "employee_id"))
    private Map<String, Double> accruedDays = new HashMap<>();
}`}
                    </pre>
                  </div>
                </div>
              )}

              {/* Connections Server info */}
              {activeConsoleTab === 'connections' && (
                <div className="flex-1 overflow-y-auto p-4 text-xs space-y-4 text-gray-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-[#0A0A0A] border border-white/5 rounded-sm">
                      <span className="block text-amber-450 text-[11px] font-bold uppercase mb-2">🚀 Spring Host Properties</span>
                      <table className="w-full text-left leading-7">
                        <tbody>
                          <tr>
                            <td className="text-gray-500 uppercase text-[9px] font-bold">Server Port</td>
                            <td className="text-white font-bold">8080</td>
                          </tr>
                          <tr>
                            <td className="text-gray-500 uppercase text-[9px] font-bold">Spring MVC Dispatcher</td>
                            <td className="text-white">http://localhost:8080/api/*</td>
                          </tr>
                          <tr>
                            <td className="text-gray-500 uppercase text-[9px] font-bold">HikariPool Size</td>
                            <td className="text-emerald-400">10 active threads</td>
                          </tr>
                          <tr>
                            <td className="text-gray-500 uppercase text-[9px] font-bold">JPA Generation Model</td>
                            <td className="text-purple-400">update (create-drop mock schema backup)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3 bg-[#0A0A0A] border border-white/5 rounded-sm">
                      <span className="block text-amber-450 text-[11px] font-bold uppercase mb-2">🗄️ MySQL DBMS Properties</span>
                      <table className="w-full text-left leading-7">
                        <tbody>
                          <tr>
                            <td className="text-gray-500 uppercase text-[9px] font-bold">Port</td>
                            <td className="text-white font-bold">3306</td>
                          </tr>
                          <tr>
                            <td className="text-gray-500 uppercase text-[9px] font-bold">Database Name</td>
                            <td className="text-amber-250 font-semibold">echobees_db</td>
                          </tr>
                          <tr>
                            <td className="text-gray-500 uppercase text-[9px] font-bold">Default User</td>
                            <td className="text-white">root</td>
                          </tr>
                          <tr>
                            <td className="text-gray-500 uppercase text-[9px] font-bold">JDBC Engine Driver</td>
                            <td className="text-[#a78bfa]">com.mysql.cj.jdbc.Driver</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
