package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.model.SafariGuide;
import com.boatsafari.managementsystem.repository.SafariGuideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/guides")
public class SafariGuideController {

    @Autowired
    private SafariGuideRepository safariGuideRepository;

    @GetMapping
    public List<SafariGuide> getAllGuides() {
        return safariGuideRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SafariGuide> getGuideById(@PathVariable Long id) {
        Optional<SafariGuide> guide = safariGuideRepository.findById(id);
        return guide.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SafariGuide> createGuide(@RequestBody SafariGuide guide) {
        return ResponseEntity.ok(safariGuideRepository.save(guide));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SafariGuide> updateGuide(@PathVariable Long id, @RequestBody SafariGuide guideDetails) {
        Optional<SafariGuide> guideOptional = safariGuideRepository.findById(id);
        if (guideOptional.isPresent()) {
            SafariGuide guide = guideOptional.get();
            guide.setFirstName(guideDetails.getFirstName());
            guide.setSecondName(guideDetails.getSecondName());
            guide.setEmail(guideDetails.getEmail());
            guide.setContactNo(guideDetails.getContactNo());
            guide.setCertification(guideDetails.getCertification());
            guide.setHireDate(guideDetails.getHireDate());
            return ResponseEntity.ok(safariGuideRepository.save(guide));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuide(@PathVariable Long id) {
        if (safariGuideRepository.existsById(id)) {
            safariGuideRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
