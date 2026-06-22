package com.medicare.medicare.Entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.medicare.medicare.Entity.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(
        name = "appointments",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"doctor_id", "appointment_date", "start_time", "end_time"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate; // Only the date (e.g., 2025-10-22)

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime; // Appointment start time (e.g., 10:30)

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime; // Appointment end time (e.g., 11:00)

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    private String mode; // "offline" or "online"

    @Column(name = "meeting_room")
    private String meetingRoom;

    @Column(name = "meeting_link")
    private String meetingLink;

    @Column(name = "meeting_enabled")
    private Boolean meetingEnabled = false;

    private LocalDateTime createdAt = LocalDateTime.now();
    @OneToMany(
            mappedBy = "appointment",
            cascade = CascadeType.ALL
    )
    @JsonManagedReference
    private List<Notes> notes;
}
