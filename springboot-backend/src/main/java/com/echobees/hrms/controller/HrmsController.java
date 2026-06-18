package com.echobees.hrms.controller;

import com.echobees.hrms.model.Employee;
import com.echobees.hrms.model.LeaveRequest;
import com.echobees.hrms.repository.EmployeeRepository;
import com.echobees.hrms.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HrmsController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    // GET all employees
    @GetMapping("/employees")
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // POST bulk synchronisation setup
    @PostMapping("/sync")
    public ResponseEntity<?> syncData(@RequestBody Map<String, Object> body) {
        try {
            if (body.containsKey("employees")) {
                List<Map<String, Object>> empsData = (List<Map<String, Object>>) body.get("employees");
                for (Map<String, Object> empMap : empsData) {
                    Employee employee = new Employee();
                    employee.setId((String) empMap.get("id"));
                    employee.setName((String) empMap.get("name"));
                    employee.setEmail((String) empMap.get("email"));
                    employee.setRole((String) empMap.get("role"));
                    employee.setDepartment((String) empMap.get("department"));
                    employee.setJoinedDate((String) empMap.get("joinedDate"));
                    employee.setAvatar((String) empMap.get("avatar"));
                    employee.setAnnualAllowance((Integer) empMap.get("annualAllowance"));
                    
                    if (empMap.get("accruedDays") instanceof Map) {
                        employee.setAccruedDays((Map<String, Double>) empMap.get("accruedDays"));
                    }
                    if (empMap.get("usedDays") instanceof Map) {
                        employee.setUsedDays((Map<String, Double>) empMap.get("usedDays"));
                    }
                    employeeRepository.save(employee);
                }
            }

            if (body.containsKey("requests")) {
                List<Map<String, Object>> reqsData = (List<Map<String, Object>>) body.get("requests");
                for (Map<String, Object> reqMap : reqsData) {
                    LeaveRequest req = new LeaveRequest();
                    req.setId((String) reqMap.get("id"));
                    req.setEmployeeId((String) reqMap.get("employeeId"));
                    req.setEmployeeName((String) reqMap.get("employeeName"));
                    req.setType((String) reqMap.get("type"));
                    req.setStartDate((String) reqMap.get("startDate"));
                    req.setEndDate((String) reqMap.get("endDate"));
                    req.setTotalDays(Double.valueOf(reqMap.get("totalDays").toString()));
                    req.setHalfDay((Boolean) reqMap.get("halfDay"));
                    req.setStatus((String) reqMap.get("status"));
                    req.setReason((String) reqMap.get("reason"));
                    req.setCreatedAt((String) reqMap.get("createdAt"));
                    if (reqMap.get("approvedAt") != null) {
                        req.setApprovedAt((String) reqMap.get("approvedAt"));
                    }
                    leaveRequestRepository.save(req);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Echobees state successfully synchronized to MySQL!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResp = new HashMap<>();
            errorResp.put("success", false);
            errorResp.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResp);
        }
    }

    // POST add a single request
    @PostMapping("/requests")
    public ResponseEntity<?> addRequest(@RequestBody LeaveRequest leaveRequest) {
        if (leaveRequest.getId() == null) {
            leaveRequest.setId("req-" + System.currentTimeMillis());
        }
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return ResponseEntity.ok(saved);
    }

    // POST update approval action
    @PostMapping("/requests/action")
    public ResponseEntity<?> requestAction(@RequestBody Map<String, Object> action) {
        String id = (String) action.get("id");
        String status = (String) action.get("status");
        String approvedAt = (String) action.get("approvedAt");

        Optional<LeaveRequest> requestOpt = leaveRequestRepository.findById(id);
        if (requestOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Request not found"));
        }

        LeaveRequest leave = requestOpt.get();
        leave.setStatus(status);
        if (approvedAt != null) {
            leave.setApprovedAt(approvedAt);
        }
        leaveRequestRepository.save(leave);

        // If approved, update active employee usedDays counter
        if ("approved".equals(status)) {
            Optional<Employee> empOpt = employeeRepository.findById(leave.getEmployeeId());
            if (empOpt.isPresent()) {
                Employee emp = empOpt.get();
                Double currentUsed = emp.getUsedDays().getOrDefault(leave.getType(), 0.0);
                emp.getUsedDays().put(leave.getType(), currentUsed + leave.getTotalDays());
                employeeRepository.save(emp);
            }
        }

        return ResponseEntity.ok(Map.of("success", true, "request", leave));
    }

    // POST credential identification logic
    @PostMapping("/auth/login")
    public ResponseEntity<?> authLogin(@RequestBody Map<String, String> creds) {
        String email = creds.get("email");
        String password = creds.get("password");
        String role = creds.get("role");

        if ("hr".equals(role)) {
            if ("hr@echobees.com".equals(email) && "admin123".equals(password)) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "role", "hr",
                        "name", "Echobees HR Lead (Spring Connection)",
                        "email", "hr@echobees.com"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "error", "Invalid HR credentials. Default is hr@echobees.com / admin123"));
            }
        } else {
            Optional<Employee> empOpt = employeeRepository.findByEmailIgnoreCase(email);
            if (empOpt.isPresent()) {
                Employee emp = empOpt.get();
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "role", "employee",
                        "employeeId", emp.getId(),
                        "name", emp.getName(),
                        "email", emp.getEmail()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "error", "Employee email not found in database records."));
            }
        }
    }

    // POST register new user account
    @PostMapping("/auth/register")
    public ResponseEntity<?> authRegister(@RequestBody Map<String, String> data) {
        String name = data.get("name");
        String email = data.get("email");
        String role = data.get("role");
        String department = data.get("department");
        String avatar = data.get("avatar");

        if (name == null || name.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Name and email are required fields."));
        }

        Optional<Employee> existing = employeeRepository.findByEmailIgnoreCase(email);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "error", "An account with this email already exists."));
        }

        String nextId = "emp-" + System.currentTimeMillis();
        Employee emp = new Employee();
        emp.setId(nextId);
        emp.setName(name);
        emp.setEmail(email.trim().toLowerCase());
        emp.setRole(role != null && !role.trim().isEmpty() ? role : "Junior Engineer");
        emp.setDepartment(department != null && !department.trim().isEmpty() ? department : "Engineering Services");
        emp.setJoinedDate("2026-06-18"); // Registered context today
        emp.setAvatar(avatar != null && !avatar.trim().isEmpty() ? avatar : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200");
        emp.setAnnualAllowance(25);

        // Core accrued bounds setup
        Map<String, Double> accrued = new HashMap<>();
        accrued.put("annual", 0.0);
        accrued.put("sick", 10.0);
        accrued.put("parental", 30.0);
        accrued.put("unpaid", 90.0);
        emp.setAccruedDays(accrued);

        // Core used bounds setup
        Map<String, Double> used = new HashMap<>();
        used.put("annual", 0.0);
        used.put("sick", 0.0);
        used.put("parental", 0.0);
        used.put("unpaid", 0.0);
        emp.setUsedDays(used);

        Employee saved = employeeRepository.save(emp);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Employee registered successfully!",
                "employeeId", saved.getId(),
                "role", "employee",
                "name", saved.getName(),
                "email", saved.getEmail()
        ));
    }
}
