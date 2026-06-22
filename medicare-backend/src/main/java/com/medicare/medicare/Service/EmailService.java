package com.medicare.medicare.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOTP(String toEmail, String otp) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(toEmail);

        message.setSubject("Medicare Email Verification");

        message.setText(
                "Your OTP is: " + otp +
                        "\nThis OTP expires in 5 minutes."
        );

        mailSender.send(message);
    }
}