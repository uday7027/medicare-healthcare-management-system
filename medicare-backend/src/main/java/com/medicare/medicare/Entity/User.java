package com.medicare.medicare.Entity;

import com.medicare.medicare.Entity.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String password;

    // =========================
    // EMAIL VERIFICATION FIELDS
    // =========================

    @Column(nullable = false)
    private boolean verified = false;

    private String otp;

    private LocalDateTime otpExpiry;

    private LocalDateTime createdAt = LocalDateTime.now();
}