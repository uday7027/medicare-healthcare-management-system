package com.medicare.medicare.Controller;

import com.medicare.medicare.Entity.Doctor;
import com.medicare.medicare.Entity.User;
import com.medicare.medicare.Service.AppointmentService;
import com.medicare.medicare.Service.DoctorService;
import com.medicare.medicare.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.*;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final UserService userService;
    private final AppointmentService appointmentService;

    // Create or Update Doctor
    @PostMapping
    public ResponseEntity<?> createOrUpdateDoctor(@RequestBody Map<String, Object> request,
                                                  Authentication auth) {

        String email = auth.getName();
        User user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getRole().name().equals("DOCTOR")) {
            return ResponseEntity.status(403).body("Only doctors can create/update their profile");
        }

        // Check if doctor already exists
        Doctor doctor;
        try {
            doctor = doctorService.getDoctorByUser(user);
        } catch (RuntimeException e) {
            doctor = Doctor.builder().user(user).build();
        }

        // Update fields if provided
        if (request.containsKey("specialty")) doctor.setSpecialty((String) request.get("specialty"));
        if (request.containsKey("qualification")) doctor.setQualification((String) request.get("qualification"));

        // Handle availableDays (convert List<String> to Set<DayOfWeek>)
        if (request.containsKey("availableDays")) {
            List<String> daysList = (List<String>) request.get("availableDays");
            Set<DayOfWeek> daysSet = new HashSet<>();
            for (String dayStr : daysList) {
                daysSet.add(DayOfWeek.valueOf(dayStr.toUpperCase()));
            }
            doctor.setAvailableDays(daysSet);
        }

        // Handle optional times
        if (request.containsKey("startTime")) doctor.setStartTime(LocalTime.parse((String) request.get("startTime")));
        if (request.containsKey("endTime")) doctor.setEndTime(LocalTime.parse((String) request.get("endTime")));

        Doctor savedDoctor = doctorService.createOrUpdateDoctor(doctor);
        return ResponseEntity.ok(savedDoctor);
    }

    // Update doctor profile explicitly
    @PutMapping
    public ResponseEntity<?> updateDoctorProfile(@RequestBody Map<String, Object> request,
                                                 Authentication auth) {

        String email = auth.getName();
        User user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getRole().name().equals("DOCTOR")) {
            return ResponseEntity.status(403).body("Only doctors can update their profile");
        }

        // Get existing doctor
        Doctor doctor = doctorService.getDoctorByUser(user);

        // Update fields if present
        if (request.containsKey("specialty")) doctor.setSpecialty((String) request.get("specialty"));
        if (request.containsKey("qualification")) doctor.setQualification((String) request.get("qualification"));

        if (request.containsKey("availableDays")) {
            List<String> daysList = (List<String>) request.get("availableDays");
            Set<DayOfWeek> daysSet = new HashSet<>();
            for (String dayStr : daysList) {
                daysSet.add(DayOfWeek.valueOf(dayStr.toUpperCase()));
            }
            doctor.setAvailableDays(daysSet);
        }

        if (request.containsKey("startTime")) doctor.setStartTime(LocalTime.parse((String) request.get("startTime")));
        if (request.containsKey("endTime")) doctor.setEndTime(LocalTime.parse((String) request.get("endTime")));

        Doctor updatedDoctor = doctorService.createOrUpdateDoctor(doctor);
        return ResponseEntity.ok(updatedDoctor);
    }

    // Get my profile
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        String email = auth.getName();
        User user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        Doctor doctor = doctorService.getDoctorByUser(user);

        Map<String, Object> response = Map.of(
                "id", doctor.getId(),
                "specialty", doctor.getSpecialty(),
                "qualification", doctor.getQualification(),
                "availableDays", doctor.getAvailableDays(),
                "startTime", doctor.getStartTime(),
                "endTime", doctor.getEndTime(),
                "user", Map.of(
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                )
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/with-user")
    public ResponseEntity<List<Map<String, Object>>> getAllDoctorsWithUser() {
        List<Doctor> doctors = doctorService.getAllDoctors();

        // Map doctors to include user info
        List<Map<String, Object>> result = doctors.stream().map(doc -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", doc.getId());
            map.put("specialty", doc.getSpecialty());
            map.put("qualification", doc.getQualification());
            map.put("user", Map.of(
                    "id", doc.getUser().getId(),
                    "name", doc.getUser().getName(),
                    "email", doc.getUser().getEmail()
            ));
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }
}

