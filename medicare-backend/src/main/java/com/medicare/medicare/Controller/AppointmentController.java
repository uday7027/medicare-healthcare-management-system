package com.medicare.medicare.Controller;

import com.medicare.medicare.Entity.*;
import com.medicare.medicare.Repository.*;
import com.medicare.medicare.Entity.enums.AppointmentStatus;
import com.medicare.medicare.Service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.medicare.medicare.dto.*;
import com.medicare.medicare.Service.NoShowPredictionService;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.medicare.medicare.Entity.Notes;
import com.medicare.medicare.dto.NotesRequest;

import com.medicare.medicare.Entity.Notes;
import com.medicare.medicare.dto.NotesRequest;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final PatientService patientService;
    private final DoctorService doctorService;
    private final UserService userService;
    private final StaffService staffService;
    private final NoShowPredictionService noShowPredictionService;

    @Autowired
    private PatientService patientRepository;

    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody Map<String, String> request,
                                             Authentication auth) {

        String email = auth.getName();
        User user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getRole().name().equals("PATIENT")) {
            return ResponseEntity.status(403).body("Only patients can book appointments");
        }

        Long doctorId = Long.parseLong(request.get("doctorId"));
        LocalDate appointmentDate = LocalDate.parse(request.get("appointmentDate"));
        LocalTime startTime = LocalTime.parse(request.get("startTime"));
        String mode = request.get("mode");

        Doctor doctor = doctorService.getDoctorById(doctorId);
        DayOfWeek selectedDay =
                appointmentDate.getDayOfWeek();

// CHECK DOCTOR AVAILABILITY
        if (
                doctor.getAvailableDays() == null
                        ||
                        !doctor.getAvailableDays().contains(selectedDay)
        ) {

            return ResponseEntity.badRequest().body(

                    Map.of(
                            "message",
                            "Doctor is not available on "
                                    + selectedDay
                    )
            );
        }
        Patient patient = patientService.getPatientByUser(user);

        /* ================= ML INTEGRATION ================= */

        NoShowPredictionRequest mlRequest = new NoShowPredictionRequest();
        mlRequest.setAppointmentDate(appointmentDate.toString());
        mlRequest.setScheduledDate(LocalDate.now().toString());
        mlRequest.setMode(mode);
        mlRequest.setMissedVisits(patient.getMissed_visits());
        mlRequest.setGender(patient.getGender());
        mlRequest.setAge(patient.getAge());

        NoShowPredictionResponse prediction =
                noShowPredictionService.predict(mlRequest);

        double noShowProb = prediction.getNo_show_probability();
        double showProb = prediction.getShow_probability();

        /* ============ BLOCK BOOKING IF HIGH RISK ============ */

        if (noShowProb > 0.5) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message", "High probability of no-show",
                            "noShowProbability", noShowProb,
                            "showProbability", showProb,
                            "decision", "BLOCKED",
                            "suggestion", "Try nearby dates or different time slots"
                    )
            );
        }

        /* ================= BOOK APPOINTMENT ================= */

        Appointment appointment = Appointment.builder()
                .doctor(doctor)
                .patient(patient)
                .appointmentDate(appointmentDate)
                .startTime(startTime)
                .endTime(startTime.plusMinutes(30))
                .mode(mode)
                .status(AppointmentStatus.SCHEDULED)
                .build();

        Appointment booked = appointmentService.bookAppointment(appointment);

        return ResponseEntity.ok(
                Map.of(
                        "message", "Appointment booked successfully",
                        "appointment", booked,
                        "noShowProbability", noShowProb,
                        "showProbability", showProb,
                        "decision", "BOOKED"
                )
        );
    }


    // Available Slots
    @GetMapping("/slots")
    public ResponseEntity<?> getAvailableSlots(@RequestParam Long doctorId, @RequestParam String date) {
        Doctor doctor = doctorService.getDoctorById(doctorId);
        LocalDate appointmentDate = LocalDate.parse(date);
        List<String> slots = appointmentService.getAvailableSlotsForDoctor(doctor, appointmentDate);
        return ResponseEntity.ok(slots);
    }

    // View Appointments
    @GetMapping("/my")
    public ResponseEntity<?> myAppointments(Authentication auth) {
        String email = auth.getName();
        User user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        switch (user.getRole()) {
            case PATIENT -> {
                Patient patient = patientService.getPatientByUser(user);
                return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patient));
            }
            case DOCTOR -> {
                Doctor doctor = doctorService.getDoctorByUser(user);
                return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(doctor));
            }
            case STAFF -> {
                Staff staff = staffService.getStaffByUser(user);
                return ResponseEntity.ok(appointmentService.getAppointmentsByStaff(staff));
            }
            default -> {
                return ResponseEntity.status(403).body("Role not allowed to view appointments");
            }
        }
    }

    // Update Appointment Status (for Staff)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request, Authentication auth) {
        String email = auth.getName();
        User user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getRole().name().equals("STAFF")) {
            return ResponseEntity.status(403).body("Only staff can update appointment status");
        }

        AppointmentStatus status = AppointmentStatus.valueOf(request.get("status").toUpperCase());
        Appointment updated = appointmentService.updateStatus(id, status);

        // ✅ increment missed visits if cancelled
        if (status == AppointmentStatus.CANCELLED) {
            Patient patient = updated.getPatient();
            patient.setMissed_visits(patient.getMissed_visits() + 1);
            patientRepository.save(patient);
        }

        // Return user-friendly messages based on action
        String message;
        switch (status) {
            case CANCELLED -> message = "Appointment canceled successfully.";
            case COMPLETED -> message = "Appointment marked as completed.";
            case SCHEDULED -> message = "Appointment rescheduled or confirmed.";
            default -> message = "Appointment status updated.";
        }

        return ResponseEntity.ok(Map.of(
                "message", message,
                "appointment", updated
        ));
    }
    @PostMapping("/{id}/notes")
    public ResponseEntity<?> addNotes(
            @PathVariable Long id,
            @RequestBody NotesRequest request
    ) {

        Notes notes =
                appointmentService.addNote(
                        id,
                        request.getNoteText()
                );

        return ResponseEntity.ok(notes);
    }

    @GetMapping("/{id}/notes")
    public ResponseEntity<?> getNotes(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                appointmentService
                        .getAppointmentNotes(id)
        );
    }

    @PutMapping("/notes/{noteId}")
    public ResponseEntity<?> updateNote(
            @PathVariable Long noteId,
            @RequestBody NotesRequest request
    ) {

        Notes updatedNote =
                appointmentService.updateNote(
                        noteId,
                        request.getNoteText()
                );

        return ResponseEntity.ok(
                updatedNote
        );
    }

    @DeleteMapping("/notes/{noteId}")
    public ResponseEntity<?> deleteNote(
            @PathVariable Long noteId
    ) {

        appointmentService.deleteNote(
                noteId
        );

        return ResponseEntity.ok(
                "Note deleted"
        );
    }

    @PutMapping("/enable-meeting/{id}")
    public ResponseEntity<?> enableMeeting(
            @PathVariable Long id
    ) {

        Appointment appointment =
                appointmentService.enableMeeting(id);

        return ResponseEntity.ok(appointment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(
            @PathVariable Long id,
            Authentication auth
    ) {

        String email = auth.getName();

        User user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ONLY PATIENT CAN DELETE
        if (!user.getRole().name().equals("PATIENT")) {

            return ResponseEntity
                    .status(403)
                    .body("Only patients can delete appointments");
        }

        Patient patient = patientService.getPatientByUser(user);

        Appointment appointment =
                appointmentService.getAppointmentById(id);

        // SECURITY CHECK
        if (!appointment.getPatient().getId().equals(patient.getId())) {

            return ResponseEntity
                    .status(403)
                    .body("You can delete only your own appointments");
        }

        // OPTIONAL:
        // Prevent deleting completed appointments

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {

            return ResponseEntity
                    .badRequest()
                    .body("Completed appointments cannot be deleted");
        }

        appointmentService.deleteAppointment(id);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Appointment deleted successfully"
                )
        );
    }

}