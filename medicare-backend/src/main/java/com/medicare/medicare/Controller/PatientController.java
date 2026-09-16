package com.medicare.medicare.Controller;

import com.medicare.medicare.Entity.Patient;
import com.medicare.medicare.Entity.User;
import com.medicare.medicare.Service.PatientService;
import com.medicare.medicare.Service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<?> createPatient(
            @RequestBody Map<String, String> request,
            Authentication auth) {

        String email = auth.getName();

        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only PATIENT role can create their profile
        if (user.getRole() != null &&
                !user.getRole().name().equals("PATIENT")) {

            return ResponseEntity
                    .status(403)
                    .body("Only patients can create their profile");
        }

        String name = request.get("name");
        String ageValue = request.get("age");
        String gender = request.get("gender");
        String contactNumber = request.get("contactNumber");
        String address = request.get("address");

        if (name != null) {
            user.setName(name);
            userService.save(user);
        }

        Patient patient = patientService
                .getPatientByUserOptional(user)
                .orElseGet(() -> Patient.builder()
                        .user(user)
                        .build());

        if (ageValue != null && !ageValue.isBlank()) {
            patient.setAge(Integer.parseInt(ageValue));
        }

        if (gender != null) {
            patient.setGender(gender);
        }

        if (contactNumber != null) {
            patient.setContactNumber(contactNumber);
        }

        if (address != null) {
            patient.setAddress(address);
        }

        Patient savedPatient = patientService.createOrUpdatePatient(patient);

        return ResponseEntity.ok(savedPatient);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication auth) {

        String email = auth.getName();

        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return patientService.getPatientByUserOptional(user)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.status(404)
                                .body("Patient profile not found"));
    }

    @GetMapping
    public ResponseEntity<?> getAllPatients() {

        List<Patient> patients = patientService.getAllPatients();

        return ResponseEntity.ok(patients);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> request,
            Authentication auth) {

        String email = auth.getName();

        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        /*
         * Find existing patient.
         * If the user does not have a Patient profile yet,
         * create one automatically.
         */
        Patient patient = patientService
                .getPatientByUserOptional(user)
                .orElseGet(() -> Patient.builder()
                        .user(user)
                        .build());

        // Update patient fields
        if (request.containsKey("phone")) {
            patient.setContactNumber(request.get("phone"));
        }

        if (request.containsKey("contactNumber")) {
            patient.setContactNumber(request.get("contactNumber"));
        }

        if (request.containsKey("age")) {
            String age = request.get("age");

            if (age != null && !age.isBlank()) {
                patient.setAge(Integer.parseInt(age));
            }
        }

        if (request.containsKey("gender")) {
            patient.setGender(request.get("gender"));
        }

        if (request.containsKey("address")) {
            patient.setAddress(request.get("address"));
        }

        // Update user name
        if (request.containsKey("name")) {
            String name = request.get("name");

            if (name != null && !name.isBlank()) {
                user.setName(name);
            }
        }

        // Save both entities
        userService.save(user);

        Patient savedPatient = patientService.createOrUpdatePatient(patient);

        return ResponseEntity.ok(savedPatient);
    }
}