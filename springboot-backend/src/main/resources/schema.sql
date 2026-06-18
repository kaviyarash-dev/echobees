-- Echobees HRMS MySQL database init script
CREATE DATABASE IF NOT EXISTS echobees_db;
USE echobees_db;

-- 1. Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(255),
    department VARCHAR(255),
    joined_date VARCHAR(50),
    avatar VARCHAR(500),
    annual_allowance INT
);

-- 2. Create employee accrued days map table
CREATE TABLE IF NOT EXISTS employee_accrued_days (
    employee_id VARCHAR(50),
    leave_type VARCHAR(50),
    days_count DOUBLE,
    PRIMARY KEY (employee_id, leave_type),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 3. Create employee used days map table
CREATE TABLE IF NOT EXISTS employee_used_days (
    employee_id VARCHAR(50),
    leave_type VARCHAR(50),
    days_count DOUBLE,
    PRIMARY KEY (employee_id, leave_type),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 4. Create leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50),
    employee_name VARCHAR(255),
    type VARCHAR(50),
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    total_days DOUBLE,
    half_day BOOLEAN,
    status VARCHAR(50),
    reason TEXT,
    created_at VARCHAR(100),
    approved_at VARCHAR(100)
);

-- Sample Database seed data
INSERT IGNORE INTO employees (id, name, email, role, department, joined_date, avatar, annual_allowance) VALUES
('emp-1', 'John Doe', 'john.doe@corporate.com', 'Principal Product Designer', 'Product Design', '2024-01-15', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', 24),
('emp-2', 'Jane Smith', 'jane.smith@corporate.com', 'Engineering Lead', 'Engineering Services', '2024-11-01', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', 26),
('emp-3', 'Sarah Connor', 'sarah.connor@corporate.com', 'Infrastructure Security Specialist', 'Engineering Services', '2026-01-01', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', 25);

INSERT IGNORE INTO employee_accrued_days (employee_id, leave_type, days_count) VALUES
('emp-1', 'annual', 0.0), ('emp-1', 'sick', 10.0), ('emp-1', 'parental', 30.0), ('emp-1', 'unpaid', 90.0),
('emp-2', 'annual', 0.0), ('emp-2', 'sick', 10.0), ('emp-2', 'parental', 30.0), ('emp-2', 'unpaid', 90.0),
('emp-3', 'annual', 0.0), ('emp-3', 'sick', 10.0), ('emp-3', 'parental', 30.0), ('emp-3', 'unpaid', 90.0);

INSERT IGNORE INTO employee_used_days (employee_id, leave_type, days_count) VALUES
('emp-1', 'annual', 5.0), ('emp-1', 'sick', 1.5), ('emp-1', 'parental', 0.0), ('emp-1', 'unpaid', 0.0),
('emp-2', 'annual', 8.0), ('emp-2', 'sick', 2.0), ('emp-2', 'parental', 0.0), ('emp-2', 'unpaid', 0.0),
('emp-3', 'annual', 0.0), ('emp-3', 'sick', 0.0), ('emp-3', 'parental', 0.0), ('emp-3', 'unpaid', 0.0);

INSERT IGNORE INTO leave_requests (id, employee_id, employee_name, type, start_date, end_date, total_days, half_day, status, reason, created_at, approved_at) VALUES
('req-1', 'emp-1', 'John Doe', 'annual', '2026-06-25', '2026-06-27', 3.0, false, 'approved', 'Family summer trip sync with kids.', '2026-06-10T10:00:00Z', '2026-06-10T15:00:00Z'),
('req-2', 'emp-2', 'Jane Smith', 'sick', '2026-06-19', '2026-06-20', 2.0, false, 'approved', 'Dental wisdom tooth extraction session.', '2026-06-15T09:30:00Z', '2026-06-15T12:00:00Z'),
('req-3', 'emp-1', 'John Doe', 'parental', '2026-07-10', '2026-07-20', 7.0, false, 'pending', 'Welcoming newborn baby home.', '2026-06-17T11:45:00Z', NULL),
('req-4', 'emp-3', 'Sarah Connor', 'annual', '2026-06-22', '2026-06-24', 3.0, false, 'pending', 'Off-grid security clearance audit prep.', '2026-06-18T01:00:00Z', NULL);
