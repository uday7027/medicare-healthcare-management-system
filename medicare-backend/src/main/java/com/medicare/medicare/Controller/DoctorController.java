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


    // =========================================================
    // CREATE / UPDATE DOCTOR PROFILE
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createOrUpdateDoctor(
            @RequestBody Map<String, Object> request,
            Authentication auth) {

        String email = auth.getName();

        User user = userService.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Only doctors can create/update doctor profile
        if (user.getRole() == null ||
                !user.getRole().name().equals("DOCTOR")) {

            return ResponseEntity
                    .status(403)
                    .body("Only doctors can create/update their profile");
        }

        /*
         * Find existing doctor.
         * If no Doctor record exists, create one.
         */
        Doctor doctor = doctorService
                .getDoctorByUserOptional(user)
                .orElseGet(() ->
                        Doctor.builder()
                                .user(user)
                                .build()
                );

        updateDoctorFields(doctor, request);

        Doctor savedDoctor =
                doctorService.createOrUpdateDoctor(doctor);

        return ResponseEntity.ok(savedDoctor);
    }


    // =========================================================
    // UPDATE DOCTOR PROFILE
    // =========================================================

    @PutMapping
    public ResponseEntity<?> updateDoctorProfile(
            @RequestBody Map<String, Object> request,
            Authentication auth) {

        String email = auth.getName();

        User user = userService.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Only doctors can update their profile
        if (user.getRole() == null ||
                !user.getRole().name().equals("DOCTOR")) {

            return ResponseEntity
                    .status(403)
                    .body("Only doctors can update their profile");
        }

        /*
         * Get existing profile.
         * If missing, create it automatically.
         */
        Doctor doctor = doctorService
                .getDoctorByUserOptional(user)
                .orElseGet(() ->
                        Doctor.builder()
                                .user(user)
                                .build()
                );

        updateDoctorFields(doctor, request);

        Doctor updatedDoctor =
                doctorService.createOrUpdateDoctor(doctor);

        return ResponseEntity.ok(updatedDoctor);
    }


    // =========================================================
    // GET MY PROFILE
    // =========================================================

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(
            Authentication auth) {

        String email = auth.getName();

        User user = userService.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Optional<Doctor> optionalDoctor =
                doctorService.getDoctorByUserOptional(user);

        if (optionalDoctor.isEmpty()) {

            return ResponseEntity
                    .status(404)
                    .body("Doctor profile not found");
        }

        Doctor doctor = optionalDoctor.get();

        Map<String, Object> userMap = new HashMap<>();

        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole());

        Map<String, Object> response = new HashMap<>();

        response.put("id", doctor.getId());
        response.put("specialty", doctor.getSpecialty());
        response.put("qualification", doctor.getQualification());
        response.put("availableDays", doctor.getAvailableDays());
        response.put("startTime", doctor.getStartTime());
        response.put("endTime", doctor.getEndTime());
        response.put("user", userMap);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET ALL DOCTORS WITH USER
    // =========================================================

    @GetMapping("/with-user")
    public ResponseEntity<List<Map<String, Object>>>
    getAllDoctorsWithUser() {

        List<Doctor> doctors =
                doctorService.getAllDoctors();

        List<Map<String, Object>> result =
                doctors.stream()
                        .map(doc -> {

                            Map<String, Object> map =
                                    new HashMap<>();

                            map.put("id", doc.getId());
                            map.put(
                                    "specialty",
                                    doc.getSpecialty()
                            );
                            map.put(
                                    "qualification",
                                    doc.getQualification()
                            );

                            Map<String, Object> userMap =
                                    new HashMap<>();

                            userMap.put(
                                    "id",
                                    doc.getUser().getId()
                            );

                            userMap.put(
                                    "name",
                                    doc.getUser().getName()
                            );

                            userMap.put(
                                    "email",
                                    doc.getUser().getEmail()
                            );

                            map.put("user", userMap);

                            return map;
                        })
                        .toList();

        return ResponseEntity.ok(result);
    }


    // =========================================================
    // HELPER METHOD
    // =========================================================

    private void updateDoctorFields(
            Doctor doctor,
            Map<String, Object> request) {

        // Specialty
        if (request.containsKey("specialty")) {

            Object value =
                    request.get("specialty");

            if (value != null) {
                doctor.setSpecialty(
                        value.toString()
                );
            }
        }


        // Qualification
        if (request.containsKey("qualification")) {

            Object value =
                    request.get("qualification");

            if (value != null) {
                doctor.setQualification(
                        value.toString()
                );
            }
        }


        // Available Days
        if (request.containsKey("availableDays")) {

            Object value =
                    request.get("availableDays");

            if (value instanceof List<?>) {

                List<?> daysList =
                        (List<?>) value;

                Set<DayOfWeek> daysSet =
                        new HashSet<>();

                for (Object day : daysList) {

                    if (day != null) {

                        daysSet.add(
                                DayOfWeek.valueOf(
                                        day.toString()
                                                .toUpperCase()
                                )
                        );
                    }
                }

                doctor.setAvailableDays(daysSet);
            }
        }


        // Start Time
        if (request.containsKey("startTime")) {

            Object value =
                    request.get("startTime");

            if (value != null &&
                    !value.toString().isBlank()) {

                doctor.setStartTime(
                        LocalTime.parse(
                                value.toString()
                        )
                );
            }
        }


        // End Time
        if (request.containsKey("endTime")) {

            Object value =
                    request.get("endTime");

            if (value != null &&
                    !value.toString().isBlank()) {

                doctor.setEndTime(
                        LocalTime.parse(
                                value.toString()
                        )
                );
            }
        }
    }
}