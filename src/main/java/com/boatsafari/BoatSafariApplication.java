package com.boatsafari;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@ComponentScan(basePackages = {"com.boatsafari", "com.boatsafari.managementsystem"})
@EntityScan(basePackages = {"com.boatsafari.managementsystem.model"})
@EnableJpaRepositories(basePackages = {"com.boatsafari.managementsystem.repository"})
public class BoatSafariApplication {
    public static void main(String[] args) {
        SpringApplication.run(BoatSafariApplication.class, args);
    }
}
