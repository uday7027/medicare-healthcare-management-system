package com.medicare.medicare.Controller;

import com.medicare.medicare.Entity.Staff;
import com.medicare.medicare.Entity.User;
import com.medicare.medicare.Service.StaffService;
import com.medicare.medicare.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<?> createOrUpdateStaff(@RequestBody Map<String, String> request, Authentication auth) {
        String email = auth.getName();
        User loggedUser = userService.getAllUsers()
                .stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!loggedUser.getRole().name().equals("STAFF")) {
            return ResponseEntity.status(403).body("Only staff can create/update their profile");
        }

        String department = request.get("department");
        String designation = request.get("designation");

        Staff staff = Staff.builder()
                .user(loggedUser)
                .department(department)
                .designation(designation)
                .build();

        Staff savedStaff = staffService.createOrUpdateStaff(staff);
        return ResponseEntity.ok(savedStaff);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        String email = auth.getName();
        User user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        Staff staff = staffService.getStaffByUser(user);
        return ResponseEntity.ok(staff);
    }

    @GetMapping
    public ResponseEntity<?> getAllStaff() {
        List<Staff> staffList = staffService.getAllStaff();
        return ResponseEntity.ok(staffList);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateStaffProfile(@RequestBody Map<String, String> request,
                                                Authentication auth) {
        String email = auth.getName();
        User user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get existing staff profile
        Staff staff = staffService.getStaffByUser(user);

        // Update User fields
        if (request.containsKey("name")) user.setName(request.get("name"));
        if (request.containsKey("phone")) user.setPhone(request.get("phone"));

        // Save updated user
        userService.save(user);

        // Update Staff fields
        if (request.containsKey("department")) staff.setDepartment(request.get("department"));
        if (request.containsKey("designation")) staff.setDesignation(request.get("designation"));

        // Save updated staff
        Staff updatedStaff = staffService.createOrUpdateStaff(staff);

        return ResponseEntity.ok(updatedStaff);
    }


}
