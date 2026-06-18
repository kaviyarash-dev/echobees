import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Initial Starting Data (In-Memory Database)
interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  joinedDate: string;
  avatar: string;
  annualAllowance: number;
  accruedDays: Record<string, number>;
  usedDays: Record<string, number>;
  isPendingReview?: boolean;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  halfDay: boolean;
  status: string;
  reason: string;
  createdAt: string;
  approvedAt?: string;
  gcalEventId?: string;
}

let employeesList: Employee[] = [
  {
    id: 'emp-1',
    name: 'John Doe',
    email: 'john.doe@corporate.com',
    role: 'Principal Product Designer',
    department: 'Product Design',
    joinedDate: '2024-01-15',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    annualAllowance: 24,
    accruedDays: { annual: 0, sick: 10, parental: 30, unpaid: 90 },
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
    joinedDate: '2026-01-01',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    annualAllowance: 25,
    accruedDays: { annual: 0, sick: 10, parental: 30, unpaid: 90 },
    usedDays: { annual: 0, sick: 0, parental: 0, unpaid: 0 }
  }
];

let leaveRequestsList: LeaveRequest[] = [
  {
    id: 'req-1',
    employeeId: 'emp-1',
    employeeName: 'John Doe',
    type: 'annual',
    startDate: '2026-06-25',
    endDate: '2026-06-27',
    totalDays: 3,
    halfDay: false,
    status: 'approved',
    reason: 'Family summer trip sync with kids.',
    createdAt: '2026-06-10T10:00:00Z',
    gcalEventId: 'sbox-1'
  },
  {
    id: 'req-2',
    employeeId: 'emp-2',
    employeeName: 'Jane Smith',
    type: 'sick',
    startDate: '2026-06-19',
    endDate: '2026-06-20',
    totalDays: 2,
    halfDay: false,
    status: 'approved',
    reason: 'Dental wisdom tooth extraction session.',
    createdAt: '2026-06-15T09:30:00Z',
    gcalEventId: 'sbox-2'
  },
  {
    id: 'req-3',
    employeeId: 'emp-1',
    employeeName: 'John Doe',
    type: 'parental',
    startDate: '2026-07-10',
    endDate: '2026-07-20',
    totalDays: 7,
    halfDay: false,
    status: 'pending',
    reason: 'Welcoming newborn baby home.',
    createdAt: '2026-06-17T11:45:00Z'
  },
  {
    id: 'req-4',
    employeeId: 'emp-3',
    employeeName: 'Sarah Connor',
    type: 'annual',
    startDate: '2026-06-22',
    endDate: '2026-06-24',
    totalDays: 3,
    halfDay: false,
    status: 'pending',
    reason: 'Off-grid security clearance audit prep.',
    createdAt: '2026-06-18T01:00:00Z'
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request parser
  app.use(express.json());

  // API 1: List all employees
  app.get("/api/employees", (req, res) => {
    res.json(employeesList);
  });

  // API 2: Bulk replace or initialize (used for robust computer storage backup syncing)
  app.post("/api/sync", (req, res) => {
    const { employees, requests } = req.body;
    if (employees && Array.isArray(employees)) {
      employeesList = employees;
    }
    if (requests && Array.isArray(requests)) {
      leaveRequestsList = requests;
    }
    res.json({ success: true, employeesCount: employeesList.length, requestsCount: leaveRequestsList.length });
  });

  // API 3: Update employee allowance or values
  app.post("/api/employees/update", (req, res) => {
    const { id, annualAllowance, usedDays, isPendingReview } = req.body;
    const emp = employeesList.find(e => e.id === id);
    if (emp) {
      if (typeof annualAllowance === 'number') emp.annualAllowance = annualAllowance;
      if (usedDays) emp.usedDays = { ...emp.usedDays, ...usedDays };
      if (isPendingReview !== undefined) emp.isPendingReview = isPendingReview;
      res.json({ success: true, employee: emp });
    } else {
      res.status(404).json({ success: false, error: "Employee not found" });
    }
  });

  // API 4: List all leave requests
  app.get("/api/requests", (req, res) => {
    res.json(leaveRequestsList);
  });

  // API 5: Add new leave request
  app.post("/api/requests", (req, res) => {
    const newReq = req.body;
    if (!newReq.id) {
      newReq.id = `req-${Date.now()}`;
    }
    leaveRequestsList.unshift(newReq);
    res.json({ success: true, request: newReq });
  });

  // API 6: Approve or Reject leave request
  app.post("/api/requests/action", (req, res) => {
    const { id, status, approvedAt, gcalEventId } = req.body;
    const leave = leaveRequestsList.find(r => r.id === id);
    if (leave) {
      leave.status = status;
      if (approvedAt) leave.approvedAt = approvedAt;
      if (gcalEventId) leave.gcalEventId = gcalEventId;
      
      // If approved, update the employee's usedDays
      if (status === 'approved') {
        const emp = employeesList.find(e => e.id === leave.employeeId);
        if (emp) {
          emp.usedDays[leave.type] = Number((Number(emp.usedDays[leave.type] || 0) + Number(leave.totalDays)).toFixed(1));
        }
      }
      res.json({ success: true, request: leave });
    } else {
      res.status(404).json({ success: false, error: "Leave request not found" });
    }
  });

  // API 7: Separate login system authenticate mapping
  app.post("/api/auth/login", (req, res) => {
    const { email, password, role } = req.body; // role: 'hr' | 'employee'
    
    if (role === 'hr') {
      // HR validation: simple professional default
      if (email === 'hr@echobees.com' && password === 'admin123') {
        return res.json({
          success: true,
          role: 'hr',
          name: 'Echobees HR Lead',
          email: 'hr@echobees.com'
        });
      } else {
        return res.status(401).json({ success: false, error: "Invalid HR credentials. Use email: hr@echobees.com / pass: admin123" });
      }
    } else {
      // Employee validation: matching existing email list or fallback
      const emp = employeesList.find(e => e.email.toLowerCase() === email.toLowerCase());
      if (emp) {
        return res.json({
          success: true,
          role: 'employee',
          employeeId: emp.id,
          name: emp.name,
          email: emp.email
        });
      } else {
        return res.status(401).json({ success: false, error: "Employee email not found. Please check registered emails." });
      }
    }
  });

  // API 8: Separate registration mapping
  app.post("/api/auth/register", (req, res) => {
    const { name, email, role, department, avatar } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ success: false, error: "Name and email are required fields." });
    }

    const exists = employeesList.some(e => e.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }

    const nextId = `emp-${Date.now()}`;
    const newEmp: Employee = {
      id: nextId,
      name,
      email: email.trim().toLowerCase(),
      role: role || "Junior Software Engineer",
      department: department || "Engineering Services",
      joinedDate: "2026-06-18",
      avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      isPendingReview: true,
      annualAllowance: 25,
      accruedDays: { annual: 0, sick: 10, parental: 30, unpaid: 90 },
      usedDays: { annual: 0, sick: 0, parental: 0, unpaid: 0 }
    };

    employeesList.push(newEmp);
    res.json({
      success: true,
      message: "Employee registered successfully!",
      employeeId: nextId,
      role: 'employee',
      name: newEmp.name,
      email: newEmp.email,
      employee: newEmp
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Echobees Fullstack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
