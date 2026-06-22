package com.medicare.medicare.Service;

import com.medicare.medicare.Entity.Staff;
import com.medicare.medicare.Entity.User;
import com.medicare.medicare.Repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;

    public Staff createOrUpdateStaff(Staff staff) {
        return staffRepository.save(staff);
    }

    public Staff getStaffById(Long id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
    }

    public Staff getStaffByUser(User user) {
        return staffRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
    }

    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }
}
