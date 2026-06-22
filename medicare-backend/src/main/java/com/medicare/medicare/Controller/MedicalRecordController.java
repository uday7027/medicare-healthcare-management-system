package com.medicare.medicare.Controller;

import com.medicare.medicare.Entity.MedicalRecord;
import com.medicare.medicare.Entity.Patient;
import com.medicare.medicare.Entity.User;
import com.medicare.medicare.Service.MedicalRecordService;
import com.medicare.medicare.Service.PatientService;
import com.medicare.medicare.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService recordService;
    private final PatientService patientService;
    private final UserService userService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadRecord(@RequestParam("file") MultipartFile file,
                                          @RequestParam("patientId") Long patientId,
                                          Authentication auth) {
        String email = auth.getName();
        User user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        Patient patient = patientService.getPatientById(patientId);

        if (!user.getRole().name().equals("STAFF") && !patient.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Not authorized to upload for this patient");
        }

        MedicalRecord record = MedicalRecord.builder()
                .patient(patient)
                .filename(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .storagePath("dummy/path/" + file.getOriginalFilename()) // For now
                .encrypted(false)
                .build();

        MedicalRecord savedRecord = recordService.uploadRecord(record);
        return ResponseEntity.ok(savedRecord);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getRecords(@PathVariable Long patientId, Authentication auth) {
        String email = auth.getName();
        User user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        Patient patient = patientService.getPatientById(patientId);

        if (!user.getRole().name().equals("STAFF") && !patient.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Not authorized to view records for this patient");
        }

        List<MedicalRecord> records = recordService.getRecordsByPatient(patient);
        return ResponseEntity.ok(records);
    }
}
