package com.medicare.medicare.Service;

import com.medicare.medicare.Entity.Patient;
import com.medicare.medicare.Entity.User;
import com.medicare.medicare.Repository.PatientRepository;
import com.medicare.medicare.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    // Create or update patient profile
    public Patient createOrUpdatePatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public Patient getPatientByUser(User user) {
        return patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    // Safe lookup when patient profile may not exist
    public Optional<Patient> getPatientByUserOptional(User user) {
        return patientRepository.findByUser(user);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public void save(Patient patient) {
        patientRepository.save(patient);
    }
}