package com.medicare.medicare.Service;

import com.medicare.medicare.Entity.*;
import com.medicare.medicare.Entity.enums.Role;
import com.medicare.medicare.Repository.*;
import com.medicare.medicare.Security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;

import com.google.api.client.http.javanet.NetHttpTransport;

import com.google.api.client.json.gson.GsonFactory;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;

import org.springframework.beans.factory.annotation.Value;

import java.util.Collections;

import java.util.Map;

import java.util.Optional;

import static com.medicare.medicare.Entity.enums.Role.*;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DoctorService doctorService;
    private final PatientService patientService;
    private final StaffService staffService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    @Value("${google.client.id}")
    private String googleClientId;

    //  Register new user
    public User register(User user) {

        Optional<User> existingUser =
                userRepository.findByEmail(user.getEmail());


        if(existingUser.isPresent()) {

            User existing = existingUser.get();

            // Already verified user
            if(existing.isVerified()) {

                throw new RuntimeException(
                        "Email already in use"
                );
            }


            String newOtp = String.valueOf(
                    (int)(Math.random() * 900000) + 100000
            );

            existing.setOtp(newOtp);

            existing.setOtpExpiry(
                    java.time.LocalDateTime.now()
                            .plusMinutes(5)
            );

            userRepository.save(existing);

            emailService.sendOTP(
                    existing.getEmail(),
                    newOtp
            );

            throw new RuntimeException(
                    "Account already exists but not verified. New OTP sent to email."
            );
        }


        // Encode password
        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        // Generate OTP
        String otp = String.valueOf(
                (int)(Math.random() * 900000) + 100000
        );

        user.setOtp(otp);

        user.setOtpExpiry(
                java.time.LocalDateTime.now()
                        .plusMinutes(5)
        );

        user.setVerified(false);

        // Save user
        User savedUser = userRepository.save(user);

        // Send OTP Email
        emailService.sendOTP(
                savedUser.getEmail(),
                otp
        );

        return savedUser;
    }

    // Login user -> return JWT token
    public String login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if(!user.isVerified()) {
            throw new RuntimeException(
                    "Please verify your email first"
            );
        }

        return jwtTokenProvider.generateToken(user.getEmail(), user.getRole());
    }

    // Fetch user by email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public String verifyOTP(String email, String otp) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if(user.isVerified()) {
            return "User already verified";
        }

        if(!user.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if(user.getOtpExpiry()
                .isBefore(java.time.LocalDateTime.now())) {

            throw new RuntimeException("OTP Expired");
        }

        user.setVerified(true);

        user.setOtp(null);

        user.setOtpExpiry(null);

        User savedUser = userRepository.save(user);

        // Create role-based records AFTER verification

        switch (savedUser.getRole()) {

            case DOCTOR -> {
                Doctor doctor = new Doctor();
                doctor.setUser(savedUser);
                doctorService.createOrUpdateDoctor(doctor);
            }

            case PATIENT -> {
                Patient patient = new Patient();
                patient.setUser(savedUser);
                patientService.createOrUpdatePatient(patient);
            }

            case STAFF -> {
                Staff staff = new Staff();
                staff.setUser(savedUser);
                staffService.createOrUpdateStaff(staff);
            }

            default -> throw new RuntimeException("Invalid role");
        }

        return "Email verified successfully";
    }
    public String resendOTP(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if(user.isVerified()) {
            throw new RuntimeException(
                    "User already verified"
            );
        }

        String otp = String.valueOf(
                (int)(Math.random() * 900000) + 100000
        );

        user.setOtp(otp);

        user.setOtpExpiry(
                java.time.LocalDateTime.now().plusMinutes(5)
        );

        userRepository.save(user);

        emailService.sendOTP(user.getEmail(), otp);

        return "OTP resent successfully";
    }

    public Map<String, Object> googleLogin(
            String googleToken
    ) throws Exception {
        System.out.println("Received Google Token: " + googleToken);
        System.out.println("Google Client ID: " + googleClientId);

        GoogleIdTokenVerifier verifier =
                new GoogleIdTokenVerifier.Builder(
                        new NetHttpTransport(),
                        GsonFactory.getDefaultInstance()
                )
                        .setAudience(
                                Collections.singletonList(
                                        googleClientId
                                )
                        )
                        .build();

        GoogleIdToken idToken =
                verifier.verify(googleToken);

        if(idToken == null) {

            System.out.println("Google token verification failed");

            throw new RuntimeException(
                    "Invalid Google Token"
            );
        }

        Payload payload = idToken.getPayload();

        String email = payload.getEmail();

        String name =
                (String) payload.get("name");

        Optional<User> optionalUser =
                userRepository.findByEmail(email);

        User user;

        // Existing user
        if(optionalUser.isPresent()) {

            user = optionalUser.get();

        }

        // New user
        else {

            user = new User();

            user.setEmail(email);

            user.setName(name);

            user.setVerified(true);

            // No role yet
            user.setRole(null);

            user.setPassword("");

            user = userRepository.save(user);
        }


        if(user.getRole() == null) {

            Map<String, Object> userMap =
                    new java.util.HashMap<>();

            userMap.put("id", user.getId());

            userMap.put("name", user.getName());

            userMap.put("email", user.getEmail());

            // role is intentionally null
            userMap.put("role", null);

            return Map.of(

                    "needsRoleSelection", true,

                    "user", userMap
            );
        }

        String jwt =
                jwtTokenProvider.generateToken(
                        user.getEmail(),
                        user.getRole()
                );

        return Map.of(

                "token", jwt,

                "needsRoleSelection", false,

                "user", Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                )
        );
    }

    public Map<String, Object> selectRole(
            String email,
            String roleStr
    ) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));

        Role role =
                Role.valueOf(roleStr);

        user.setRole(role);

        userRepository.save(user);

        // =========================
        // CREATE ROLE-SPECIFIC RECORD
        // =========================

        switch (role) {

            case DOCTOR -> {

                Doctor doctor = new Doctor();

                doctor.setUser(user);

                doctorService.createOrUpdateDoctor(
                        doctor
                );
            }

            case PATIENT -> {

                Patient patient = new Patient();

                patient.setUser(user);

                patientService.createOrUpdatePatient(
                        patient
                );
            }

            case STAFF -> {

                Staff staff = new Staff();

                staff.setUser(user);

                staffService.createOrUpdateStaff(
                        staff
                );
            }
        }

        // =========================
        // GENERATE JWT AFTER ROLE SELECTION
        // =========================

        String jwt =
                jwtTokenProvider.generateToken(
                        user.getEmail(),
                        user.getRole()
                );

        return Map.of(

                "token", jwt,

                "user", Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                )
        );
    }
}
