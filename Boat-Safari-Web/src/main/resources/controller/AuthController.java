package com.boatsafari.controller;

import com.boatsafari.model.Role;
import com.boatsafari.model.User;
import com.boatsafari.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;

@Controller
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/register")
    public String showRegister(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("roles", new Role[]{Role.CUSTOMER, Role.STAFF});
        return "register";
    }

    @PostMapping("/register")
    public String doRegister(@Valid @ModelAttribute("user") User form,
                             BindingResult result,
                             @RequestParam("rawPassword") String rawPassword,
                             Model model) {
        if (result.hasErrors()) {
            model.addAttribute("roles", new Role[]{Role.CUSTOMER, Role.STAFF});
            model.addAttribute("error", "Please correct the errors.");
            return "register";
        }
        if (userRepository.findByUsername(form.getUsername()).isPresent()) {
            model.addAttribute("roles", new Role[]{Role.CUSTOMER, Role.STAFF});
            model.addAttribute("error", "Username already exists");
            return "register";
        }
        form.setPasswordHash(encoder.encode(rawPassword));
        userRepository.save(form);
        return "redirect:/login?registered";
    }

    @GetMapping("/login")
    public String showLogin(Model model) {
        model.addAttribute("roles", Role.values());
        return "login";
    }

    @PostMapping("/login")
    public String doLogin(@RequestParam String username,
                          @RequestParam String password,
                          @RequestParam Role role,
                          HttpSession session,
                          Model model) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty() || !encoder.matches(password, userOpt.get().getPasswordHash()) || userOpt.get().getRole() != role) {
            model.addAttribute("roles", Role.values());
            model.addAttribute("error", "Invalid credentials or role");
            return "login";
        }
        User user = userOpt.get();
        session.setAttribute("userId", user.getId());
        session.setAttribute("username", user.getUsername());
        session.setAttribute("role", user.getRole());
        return "redirect:/dashboard";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login?logout";
    }
}
