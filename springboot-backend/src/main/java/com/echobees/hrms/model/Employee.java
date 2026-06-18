package com.echobees.hrms.model;

import jakarta.persistence.*;
import java.util.HashMap;
import java.util.Map;

@Entity
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
    @MapKeyColumn(name = "leave_type")
    @Column(name = "days_count")
    private Map<String, Double> accruedDays = new HashMap<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "employee_used_days", joinColumns = @JoinColumn(name = "employee_id"))
    @MapKeyColumn(name = "leave_type")
    @Column(name = "days_count")
    private Map<String, Double> usedDays = new HashMap<>();

    // Default Constructor
    public Employee() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getJoinedDate() { return joinedDate; }
    public void setJoinedDate(String joinedDate) { this.joinedDate = joinedDate; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public Integer getAnnualAllowance() { return annualAllowance; }
    public void setAnnualAllowance(Integer annualAllowance) { this.annualAllowance = annualAllowance; }

    public Map<String, Double> getAccruedDays() { return accruedDays; }
    public void setAccruedDays(Map<String, Double> accruedDays) { this.accruedDays = accruedDays; }

    public Map<String, Double> getUsedDays() { return usedDays; }
    public void setUsedDays(Map<String, Double> usedDays) { this.usedDays = usedDays; }
}
