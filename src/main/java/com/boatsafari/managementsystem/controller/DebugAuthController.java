// src/main/java/com/boatsafari/managementsystem/controller/DebugAuthController.java
package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.util.CurrentUserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DebugAuthController {

    @Autowired
    private CurrentUserUtil currentUserUtil;

    @GetMapping("/me")
    public Map<String, Object> me() {
        String email = currentUserUtil.getCurrentEmail();
        return Map.of("email", email == null ? "" : email);
    }
}