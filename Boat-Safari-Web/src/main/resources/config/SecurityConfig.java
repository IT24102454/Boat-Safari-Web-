// src/main/java/com/boatsafari/managementsystem/config/SecurityConfig.java
package com.boatsafari.managementsystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // static pages/assets
                        .requestMatchers("/", "/*.html", "/assets/**", "/partials/**", "/img/**").permitAll()
                        // auth endpoints
                        .requestMatchers("/api/register", "/api/login").permitAll()
                        // trips browsing allowed without login
                        .requestMatchers(HttpMethod.GET, "/api/trips/**").permitAll()
                        // Support public endpoints
                        .requestMatchers(HttpMethod.POST, "/api/support/contact").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/support/staff").permitAll()
                        // Admin-only endpoints
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN")
                        // Staff management endpoints - allow all operations for ADMIN
                        .requestMatchers(HttpMethod.GET, "/api/staff/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/staff/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/staff/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/staff/**").hasRole("ADMIN")
                        // Safari guide specific endpoints
                        .requestMatchers("/api/guides/**").hasAnyRole("ADMIN", "SAFARIGUIDE")
                        // Support booking history requires login
                        .requestMatchers("/api/support/bookings/**").authenticated()
                        // Bookings & payments must be logged in
                        .requestMatchers("/api/bookings/**", "/api/payments/**").authenticated()
                        // Boats list can be viewed only when logged in (change to permitAll if you want public)
                        .requestMatchers(HttpMethod.GET, "/api/boats/**").authenticated()
                        // Boat management (create/update/delete) restricted to admin and staff
                        .requestMatchers(HttpMethod.POST, "/api/boats/**").hasAnyRole("ADMIN", "STAFFMEMBER")
                        .requestMatchers(HttpMethod.PUT, "/api/boats/**").hasAnyRole("ADMIN", "STAFFMEMBER")
                        .requestMatchers(HttpMethod.DELETE, "/api/boats/**").hasAnyRole("ADMIN", "STAFFMEMBER")
                        // everything else under /api protected
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll()
                )
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() { return new JwtAuthenticationFilter(); }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
}