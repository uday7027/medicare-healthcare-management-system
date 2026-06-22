package com.medicare.medicare.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String specialty;
    private String qualification;

    // Doctor working schedule
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "doctor_available_days", joinColumns = @JoinColumn(name = "doctor_id"))
    @Column(name = "day")
    @Enumerated(EnumType.STRING)
    private Set<DayOfWeek> availableDays; // e.g., MONDAY, TUESDAY, etc.

    private LocalTime startTime; // Example: 09:00
    private LocalTime endTime;   // Example: 17:00

    private LocalDateTime createdAt = LocalDateTime.now();
}
