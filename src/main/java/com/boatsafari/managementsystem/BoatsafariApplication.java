// src/main/java/com/boatsafari/managementsystem/BoatsafariApplication.java
package com.boatsafari.managementsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BoatsafariApplication {
	public static void main(String[] args) {
		SpringApplication.run(BoatsafariApplication.class, args);
	}
}