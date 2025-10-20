package com.boatsafari.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @GetMapping({"/", "/dashboard"})
    public String dashboard(HttpSession session, Model model) {
        Object username = session.getAttribute("username");
        Object role = session.getAttribute("role");
        model.addAttribute("username", username);
        model.addAttribute("role", role);
        return "dashboard";
    }
}
