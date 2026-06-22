package com.medicare.medicare.Repository;

import com.medicare.medicare.Entity.Staff;
import com.medicare.medicare.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {

    Optional<Staff> findByUser(User user);
}
