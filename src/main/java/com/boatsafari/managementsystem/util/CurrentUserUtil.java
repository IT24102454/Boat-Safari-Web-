// src/main/java/com/boatsafari/managementsystem/util/CurrentUserUtil.java
package com.boatsafari.managementsystem.util;

import com.boatsafari.managementsystem.model.User;
import com.boatsafari.managementsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserUtil {

    @Autowired
    private UserRepository userRepository;

    public String getCurrentEmail() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) return null;
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal instanceof String ? (String) principal : null;
    }

    public User getCurrentUser() {
        String email = getCurrentEmail();
        if (email == null) {
            throw new IllegalArgumentException("Not authenticated. Please login again.");
        }
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("Account not found for: " + email + ". Please login again.");
        }
        return user;
    }
}