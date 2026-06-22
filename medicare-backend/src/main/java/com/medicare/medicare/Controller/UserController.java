package com.medicare.medicare.Controller;

import com.medicare.medicare.Entity.User;
import com.medicare.medicare.Entity.enums.Role;
import com.medicare.medicare.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/staff")
    public ResponseEntity<?> getAllStaff() {
        List<User> staff = userService.getAllUsers()
                .stream()
                .filter(u -> u.getRole() == Role.STAFF)
                .toList();
        return ResponseEntity.ok(staff);
    }

}
