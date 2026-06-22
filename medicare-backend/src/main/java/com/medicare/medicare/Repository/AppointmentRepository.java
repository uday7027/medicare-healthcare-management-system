package com.medicare.medicare.Repository;

import com.medicare.medicare.Entity.Appointment;
import com.medicare.medicare.Entity.Doctor;
import com.medicare.medicare.Entity.Patient;
import com.medicare.medicare.Entity.Staff;
import com.medicare.medicare.Entity.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // ✅ Find all appointments for a given patient
    List<Appointment> findByPatient(Patient patient);

    // ✅ Find all appointments for a given doctor
    List<Appointment> findByDoctor(Doctor doctor);

    // ✅ Find appointments by status (e.g., SCHEDULED, COMPLETED)
    List<Appointment> findByStatus(AppointmentStatus status);

    // ✅ Find all appointments for a doctor on a specific date
    List<Appointment> findByDoctorAndAppointmentDate(Doctor doctor, LocalDate appointmentDate);

    // ✅ Conflict check: ensures no overlapping appointment for the same doctor on the same date (excluding canceled)
    @Query("""
        SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END
        FROM Appointment a
        WHERE a.doctor = :doctor
          AND a.appointmentDate = :date
          AND a.status <> com.medicare.medicare.Entity.enums.AppointmentStatus.CANCELLED
          AND (
            (:startTime < a.endTime AND :endTime > a.startTime)
          )
    """)
    boolean existsByDoctorAndAppointmentDateAndTimeOverlap(
            @Param("doctor") Doctor doctor,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    // ✅ Fetch overlapping appointments but ignore canceled ones
    @Query("""
        SELECT a FROM Appointment a
        WHERE a.doctor = :doctor
          AND a.appointmentDate = :date
          AND a.status <> com.medicare.medicare.Entity.enums.AppointmentStatus.CANCELLED
          AND a.startTime < :endTime
          AND a.endTime > :startTime
    """)
    List<Appointment> findByDoctorAndAppointmentDateTimeBetween(
            @Param("doctor") Doctor doctor,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );
}
