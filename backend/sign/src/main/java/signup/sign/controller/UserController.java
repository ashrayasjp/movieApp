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
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "message", "User Registered Successfully",
                "username", user.getUsername(),
                "email", user.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user, HttpSession session) {

        User dbUser = userRepository.findByEmail(user.getEmail());
        if (dbUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Email not Registered"));
        } else if (!dbUser.getPassword().equals(user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Incorrect Password"));
        } else {
            session.setAttribute("username", dbUser.getUsername());
            session.setAttribute("email", dbUser.getEmail());

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "username", dbUser.getUsername(),
                    "email", dbUser.getEmail()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logoutUser(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logout Successful");
    }
}
