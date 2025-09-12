package signup.sign.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import signup.sign.model.User;
import signup.sign.repository.UserRepository;
import jakarta.servlet.http.HttpSession;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody User user, HttpSession session) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        userRepository.save(user);
        session.setAttribute("user", user);

        return ResponseEntity.ok(Map.of(
                "message", "User Registered Successfully",
                "user", user));
    }

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user, HttpSession session) {
        User dbUser = userRepository.findByEmail(user.getEmail());

        if (dbUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Email not registered"));
        } else if (!dbUser.getPassword().equals(user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Incorrect password"));
        }

        session.setAttribute("user", dbUser);

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "user", dbUser));
    }

    // Get current logged-in user
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }
        return ResponseEntity.ok(user);
    }

    // Logout endpoint
    @PostMapping("/logout")
    public ResponseEntity<String> logoutUser(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logout successful");
    }
}
