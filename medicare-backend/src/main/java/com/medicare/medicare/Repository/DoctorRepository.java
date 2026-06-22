package com.medicare.medicare.Repository;

import com.medicare.medicare.Entity.Doctor;
import com.medicare.medicare.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByUser(User user);

    List<Doctor> findBySpecialty(String specialty);
}
