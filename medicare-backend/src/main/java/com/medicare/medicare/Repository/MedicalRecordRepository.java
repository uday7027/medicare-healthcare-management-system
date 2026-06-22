package com.medicare.medicare.Repository;

import com.medicare.medicare.Entity.MedicalRecord;
import com.medicare.medicare.Entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    List<MedicalRecord> findByPatient(Patient patient);
}
