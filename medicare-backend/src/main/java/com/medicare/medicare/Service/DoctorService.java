package com.medicare.medicare.Service;

import com.medicare.medicare.Entity.Doctor;
import com.medicare.medicare.Entity.User;
import com.medicare.medicare.Repository.DoctorRepository;
import com.medicare.medicare.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    // Create or Update Doctor
    public Doctor createOrUpdateDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    // Get Doctor by ID
    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    //  Get Doctor by User
    public Doctor getDoctorByUser(User user) {
        return doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    // Get All Doctors
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // =================== Get All Doctors with User Info (for frontend) ===================
    public List<Map<String, Object>> getAllDoctorsWithUser() {
        List<Doctor> doctors = doctorRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Doctor doc : doctors) {
            Optional<User> userOpt = userRepository.findById(doc.getUser().getId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                Map<String, Object> map = new HashMap<>();
                map.put("id", doc.getId());
                map.put("userId", user.getId());
                map.put("name", user.getName()); // user name
                map.put("specialty", doc.getSpecialty());
                map.put("qualification", doc.getQualification());

                //  Updated fields for availability
                map.put("availableDays", doc.getAvailableDays()); // MONDAY, TUESDAY, etc.
                map.put("startTime", doc.getStartTime()); // e.g., 09:00
                map.put("endTime", doc.getEndTime());     // e.g., 17:00

                result.add(map);
            }
        }
        return result;
    }

    // =================== Get Doctors by Specialty ===================
    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        return doctorRepository.findBySpecialty(specialty);
    }

    // =================== Helper: Check if Doctor is Available on a Given Day ===================
    public boolean isDoctorAvailableOnDay(Doctor doctor, DayOfWeek day) {
        return doctor.getAvailableDays() != null && doctor.getAvailableDays().contains(day);
    }

    // =================== Helper: Get Doctor Working Hours ===================
    public Map<String, LocalTime> getDoctorWorkingHours(Doctor doctor) {
        Map<String, LocalTime> hours = new HashMap<>();
        hours.put("startTime", doctor.getStartTime());
        hours.put("endTime", doctor.getEndTime());
        return hours;
    }
}
