package com.medicare.medicare.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // MANY NOTES -> ONE APPOINTMENT
    @ManyToOne
    @JoinColumn(
            name = "appointment_id",
            nullable = false
    )
    @JsonBackReference
    private Appointment appointment;

    @Column(columnDefinition = "TEXT")
    private String noteText;

    private LocalDateTime createdAt =
            LocalDateTime.now();
}