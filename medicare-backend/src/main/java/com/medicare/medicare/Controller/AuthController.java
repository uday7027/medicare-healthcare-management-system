package com.medicare.medicare.Controller;

import com.medicare.medicare.Entity.User;
import com.medicare.medicare.Entity.enums.Role;
import com.medicare.medicare.Service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String phone = request.get("phone");
        String password = request.get("password");
        String roleStr = request.get("role");

        if (name == null || email == null || password == null || roleStr == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        Role role;
        try {
            role = Role.valueOf(roleStr.toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid role");
        }

        User user = User.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .password(password)
                .role(role)
                .build();

        authService.register(user);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "OTP sent to email"
                )
        );
    }

    // =================== Login ===================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing email or password"));
        }

        try {
            String token = authService.login(email, password);

            User user = authService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", Map.of(
                            "id", user.getId(),
                            "name", user.getName(),
                            "email", user.getEmail(),
                            "role", user.getRole()
                    )
            ));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(
            @RequestBody Map<String, String> request
    ) {

        String email = request.get("email");

        String otp = request.get("otp");

        if(email == null || otp == null) {

            return ResponseEntity.badRequest()
                    .body("Email and OTP required");
        }

        try {

            String response =
                    authService.verifyOTP(email, otp);

            return ResponseEntity.ok(
                    Map.of("message", response)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOTP(
            @RequestBody Map<String, String> request
    ) {

        String email = request.get("email");

        if(email == null) {

            return ResponseEntity.badRequest()
                    .body("Email is required");
        }

        try {

            String response =
                    authService.resendOTP(email);

            return ResponseEntity.ok(
                    Map.of("message", response)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(
            @RequestBody Map<String, String> body
    ) {

        try {

            String token = body.get("token");

            return ResponseEntity.ok(
                    authService.googleLogin(token)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    @PostMapping("/select-role")
    public ResponseEntity<?> selectRole(
            @RequestBody Map<String, String> body
    ) {

        String email = body.get("email");

        String role = body.get("role");

        return ResponseEntity.ok(
                authService.selectRole(
                        email,
                        role
                )
        );
    }
}
