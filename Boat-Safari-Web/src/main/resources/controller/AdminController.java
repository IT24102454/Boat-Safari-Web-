package com.boatsafari.controller;

import com.boatsafari.model.Feedback;
import com.boatsafari.model.Role;
import com.boatsafari.repository.FeedbackRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final FeedbackRepository feedbackRepository;

    public AdminController(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    private boolean isAdmin(HttpSession session) {
        Object role = session.getAttribute("role");
        return role == Role.ADMIN;
    }

    @GetMapping
    public String adminHome(HttpSession session, Model model) {
        if (!isAdmin(session)) return "redirect:/login";
        model.addAttribute("feedbacks", feedbackRepository.findAll());
        return "admin";
    }

    @PostMapping("/feedback/{id}/reply")
    public String reply(@PathVariable Long id, @RequestParam String reply, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/login";
        Feedback fb = feedbackRepository.findById(id).orElse(null);
        if (fb != null) {
            fb.setAdminReply(reply);
            feedbackRepository.save(fb);
        }
        return "redirect:/admin";
    }

    @PostMapping("/feedback/{id}/delete")
    public String delete(@PathVariable Long id, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/login";
        feedbackRepository.deleteById(id);
        return "redirect:/admin";
    }
}
