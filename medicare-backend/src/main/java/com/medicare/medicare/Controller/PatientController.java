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
    public ResponseEntity<?> createPatient(@RequestBody Map<String, String> request, Authentication auth) {

        // Fetch logged-in user (assume email as principal)
        String email = auth.getName();
        User user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only PATIENT role can create their profile
        if (user.getRole() != null && !user.getRole().name().equals("PATIENT")) {
            return ResponseEntity.status(403).body("Only patients can create their profile");
        }

        String name = request.get("name");
        int age = Integer.parseInt(request.get("age"));
        String gender = request.get("gender");
        String contactNumber = request.get("contactNumber");
        String address = request.get("address");

        Patient patient = Patient.builder()
                .user(user)
                .age(age)
                .gender(gender)
                .contactNumber(contactNumber)
                .address(address)
                .build();

        Patient savedPatient = patientService.createOrUpdatePatient(patient);

        return ResponseEntity.ok(savedPatient);
    }


    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        String email = auth.getName();
        User user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        Patient patient = patientService.getPatientByUser(user);
        return ResponseEntity.ok(patient);
    }

    @GetMapping
    public ResponseEntity<?> getAllPatients() {
        List<Patient> patients = patientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request, Authentication auth) {
        String email = auth.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Patient patient = patientService.getPatientByUser(user);

        // Update patient fields
        if (request.containsKey("phone")) patient.setContactNumber(request.get("phone"));
        if (request.containsKey("age")) patient.setAge(Integer.parseInt(request.get("age")));
        if (request.containsKey("gender")) patient.setGender(request.get("gender"));
        if (request.containsKey("address")) patient.setAddress(request.get("address"));

        // Update user name if provided
        if (request.containsKey("name")) user.setName(request.get("name"));

        // Save changes
        userService.save(user);
        patientService.save(patient);

        return ResponseEntity.ok(patient);
    }
}
