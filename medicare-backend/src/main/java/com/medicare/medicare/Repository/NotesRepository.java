package com.medicare.medicare.Repository;

import com.medicare.medicare.Entity.Notes;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotesRepository
        extends JpaRepository<Notes, Long> {

    List<Notes> findByAppointmentId(
            Long appointmentId
    );
}