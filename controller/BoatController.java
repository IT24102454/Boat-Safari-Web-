// src/main/java/com/boatsafari/managementsystem/controller/BoatController.java
package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.model.Boat;
import com.boatsafari.managementsystem.service.BoatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/boats")
@CrossOrigin(origins = "*")
public class BoatController {

    @Autowired
    private BoatService boatService;

    @GetMapping
    public ResponseEntity<List<Boat>> getAll() {
        return ResponseEntity.ok(boatService.getAllBoats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Boat> getById(@PathVariable Long id) {
        Optional<Boat> b = boatService.getBoatById(id);
        return b.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}