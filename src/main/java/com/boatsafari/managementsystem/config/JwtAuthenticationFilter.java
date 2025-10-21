package com.boatsafari.managementsystem.config;

import com.boatsafari.managementsystem.util.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        // For debugging
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Authorization Header: " + (header != null ? "Present" : "Missing"));

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            // Validate the token first
            if (!jwtUtils.validateToken(token)) {
                System.out.println("Invalid JWT token");
                filterChain.doFilter(request, response);
                return;
            }

            String email = jwtUtils.getEmailFromToken(token);
            String role = jwtUtils.getRoleFromToken(token);
            Long userId = jwtUtils.getUserIdFromToken(token);

            System.out.println("JWT Token contains - Email: " + email + ", Role: " + role + ", UserId: " + userId);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Create authority from role - ensure role is uppercase for consistency
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + (role != null ? role.toUpperCase() : "USER"))
                );

                System.out.println("Setting authentication with authority: " + authorities.get(0).getAuthority());

                // Create authentication token
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email, null, authorities);

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set authentication in security context
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}