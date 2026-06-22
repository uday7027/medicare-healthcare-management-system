package com.medicare.medicare.Service;

import com.medicare.medicare.Entity.Appointment;
import com.medicare.medicare.Entity.Doctor;
import com.medicare.medicare.Entity.Patient;
import com.medicare.medicare.Entity.Staff;
import com.medicare.medicare.Entity.Notes;
import com.medicare.medicare.Entity.enums.AppointmentStatus;

import java.util.UUID;

import com.medicare.medicare.Repository.AppointmentRepository;
import com.medicare.medicare.Repository.NotesRepository;
import com.medicare.medicare.Entity.Appointment;
import com.medicare.medicare.Entity.Notes;

import java.util.List;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    private final NotesRepository notesRepository;

    // =====================================================
    // BOOK APPOINTMENT
    // =====================================================


    public Appointment bookAppointment(
            Appointment appointment
    ) {

        List<Appointment> conflicts =
                appointmentRepository
                        .findByDoctorAndAppointmentDateTimeBetween(
                                appointment.getDoctor(),
                                appointment.getAppointmentDate(),
                                appointment.getStartTime(),
                                appointment.getEndTime()
                        );

        if (!conflicts.isEmpty()) {

            throw new RuntimeException(
                    "Doctor already booked for this time slot"
            );
        }

        // Default status
        if (appointment.getStatus() == null) {

            appointment.setStatus(
                    AppointmentStatus.SCHEDULED
            );
        }

        // ============================================
        // GENERATE MEETING ROOM FOR ONLINE APPOINTMENT
        // ============================================

        if (
                appointment.getMode() != null
                        &&
                        appointment.getMode().equalsIgnoreCase("online")
        ) {

            String roomName =
                    "consult-" + UUID.randomUUID();

            String meetingLink =
                    "https://meet.jit.si/" + roomName;

            appointment.setMeetingRoom(
                    roomName
            );

            appointment.setMeetingLink(
                    meetingLink
            );

            appointment.setMeetingEnabled(
                    false
            );
        }

        return appointmentRepository.save(
                appointment
        );
    }

    // =====================================================
    // GENERATE AVAILABLE SLOTS
    // =====================================================

    public List<String> getAvailableSlotsForDoctor(
            Doctor doctor,
            LocalDate date
    ) {

        List<String> slots =
                new ArrayList<>();

        int slotMinutes = 30;

        if (doctor.getStartTime() == null
                || doctor.getEndTime() == null) {

            return slots;
        }

        LocalTime start =
                doctor.getStartTime();

        LocalTime end =
                doctor.getEndTime();

        // Existing appointments
        List<Appointment> appointments =
                appointmentRepository
                        .findByDoctorAndAppointmentDateTimeBetween(
                                doctor,
                                date,
                                start,
                                end
                        );

        // Generate slots
        for (
                LocalTime time = start;

                time.plusMinutes(slotMinutes)
                        .compareTo(end) <= 0;

                time = time.plusMinutes(slotMinutes)
        ) {

            LocalTime slotStart = time;

            LocalTime slotEnd =
                    time.plusMinutes(slotMinutes);

            boolean conflict =
                    appointments.stream().anyMatch(
                            appt ->
                                    slotStart.isBefore(
                                            appt.getEndTime()
                                    )
                                            &&
                                            slotEnd.isAfter(
                                                    appt.getStartTime()
                                            )
                    );

            if (!conflict) {

                slots.add(
                        slotStart.toString()
                );
            }
        }

        return slots;
    }

    // =====================================================
    // GET APPOINTMENTS BY PATIENT
    // =====================================================

    public List<Appointment> getAppointmentsByPatient(
            Patient patient
    ) {

        return appointmentRepository
                .findByPatient(patient);
    }

    // =====================================================
    // GET APPOINTMENTS BY DOCTOR
    // =====================================================

    public List<Appointment> getAppointmentsByDoctor(
            Doctor doctor
    ) {

        return appointmentRepository
                .findByDoctor(doctor);
    }

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    public Appointment updateStatus(
            Long id,
            AppointmentStatus status
    ) {

        Appointment appointment =
                appointmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found"
                                )
                        );

        appointment.setStatus(status);

        return appointmentRepository.save(
                appointment
        );
    }

    // =====================================================
    // GET APPOINTMENTS BY STAFF
    // =====================================================

    public List<Appointment> getAppointmentsByStaff(
            Staff staff
    ) {

        return appointmentRepository.findAll();
    }

    // =====================================================
// ADD NOTE
// =====================================================

    public Notes addNote(
            Long appointmentId,
            String noteText
    ) {

        Appointment appointment =
                appointmentRepository.findById(
                        appointmentId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Appointment not found"
                        )
                );

        Notes notes = Notes.builder()
                .appointment(appointment)
                .noteText(noteText)
                .build();

        return notesRepository.save(notes);
    }

// =====================================================
// GET NOTES BY APPOINTMENT
// =====================================================

    public List<Notes> getAppointmentNotes(
            Long appointmentId
    ) {

        return notesRepository.findByAppointmentId(
                appointmentId
        );
    }

    public Notes updateNote(
            Long noteId,
            String noteText
    ){
        Notes note =
                notesRepository.findById(
                        noteId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Note not found"
                        )
                );

        note.setNoteText(noteText);

        return notesRepository.save(note);
    }

    public void deleteNote(
            Long noteId
    ){
        notesRepository.deleteById(
                noteId);
    }

    public Appointment enableMeeting(
            Long appointmentId
    ) {

        Appointment appointment =
                appointmentRepository.findById(
                        appointmentId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Appointment not found"
                        )
                );

        appointment.setMeetingEnabled(true);

        return appointmentRepository.save(
                appointment
        );
    }

    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }

    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Appointment not found"));
    }
}