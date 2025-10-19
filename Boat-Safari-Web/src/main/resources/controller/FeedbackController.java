package com.boatsafari.controller;

import com.boatsafari.model.Feedback;
import com.boatsafari.model.Role;
import com.boatsafari.model.User;
import com.boatsafari.repository.FeedbackRepository;
import com.boatsafari.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/feedback")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public FeedbackController(FeedbackRepository feedbackRepository, UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/list")
    public String listAll(Model model) {
        List<Feedback> all = feedbackRepository.findAll();
        model.addAttribute("feedbacks", all);
        return "feedback_list";
    }

    @GetMapping("/my")
    public String myFeedbacks(HttpSession session, Model model) {
        Long userId = (Long) session.getAttribute("userId");
        Role role = (Role) session.getAttribute("role");
        if (userId == null || role != Role.CUSTOMER) {
            return "redirect:/login";
        }
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return "redirect:/login";
        List<Feedback> mine = feedbackRepository.findByAuthor(userOpt.get());
        model.addAttribute("feedbacks", mine);
        return "feedback_manage";
    }

    @GetMapping("/new")
    public String createForm(HttpSession session, Model model) {
        Long userId = (Long) session.getAttribute("userId");
        Role role = (Role) session.getAttribute("role");
        if (userId == null || role != Role.CUSTOMER) return "redirect:/login";
        model.addAttribute("feedback", new Feedback());
        return "feedback_form";
    }

    @PostMapping("/new")
    public String create(@Valid @ModelAttribute("feedback") Feedback form,
                         BindingResult result,
                         HttpSession session,
                         Model model) {
        Long userId = (Long) session.getAttribute("userId");
        Role role = (Role) session.getAttribute("role");
        if (userId == null || role != Role.CUSTOMER) return "redirect:/login";
        if (result.hasErrors()) {
            model.addAttribute("error", "Please enter feedback content");
            return "feedback_form";
        }
        User author = userRepository.findById(userId).orElseThrow();
        form.setAuthor(author);
        feedbackRepository.save(form);
        return "redirect:/feedback/my";
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, HttpSession session, Model model) {
        Long userId = (Long) session.getAttribute("userId");
        Role role = (Role) session.getAttribute("role");
        if (userId == null || role != Role.CUSTOMER) return "redirect:/login";
        Feedback fb = feedbackRepository.findById(id).orElse(null);
        if (fb == null || !fb.getAuthor().getId().equals(userId)) {
            return "redirect:/feedback/my";
        }
        model.addAttribute("feedback", fb);
        return "feedback_form";
    }

    @PostMapping("/edit/{id}")
    public String update(@PathVariable Long id,
                         @Valid @ModelAttribute("feedback") Feedback form,
                         BindingResult result,
                         HttpSession session,
                         Model model) {
        Long userId = (Long) session.getAttribute("userId");
        Role role = (Role) session.getAttribute("role");
        if (userId == null || role != Role.CUSTOMER) return "redirect:/login";
        Feedback fb = feedbackRepository.findById(id).orElse(null);
        if (fb == null || !fb.getAuthor().getId().equals(userId)) {
            return "redirect:/feedback/my";
        }
        if (result.hasErrors()) {
            model.addAttribute("error", "Please enter feedback content");
            return "feedback_form";
        }
        fb.setContent(form.getContent());
        feedbackRepository.save(fb);
        return "redirect:/feedback/my";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        Role role = (Role) session.getAttribute("role");
        if (userId == null || role != Role.CUSTOMER) return "redirect:/login";
        Feedback fb = feedbackRepository.findById(id).orElse(null);
        if (fb != null && fb.getAuthor().getId().equals(userId)) {
            feedbackRepository.delete(fb);
        }
        return "redirect:/feedback/my";
    }
}
