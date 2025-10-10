package com.boatsafari.managementsystem.util;

import com.boatsafari.managementsystem.model.User;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secret; // Must be at least 256 bits (32 characters) for HS256

    public String generateToken(User user) {
        try {
            // Create claims
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(user.getEmail())
                    .issueTime(new Date())
                    .expirationTime(new Date(System.currentTimeMillis() + 86400000)) // 1 day
                    .claim("userId", user.getUserId())
                    .claim("role", getUserRole(user))
                    .build();

            // Sign with HS256
            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.HS256),
                    claimsSet);

            JWSSigner signer = new MACSigner(secret.getBytes());
            signedJWT.sign(signer);

            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Error generating token", e);
        }
    }

    private String getUserRole(User user) {
        // Convert class name to a standardized role name
        String className = user.getClass().getSimpleName().toUpperCase();

        // Map class names to standard role names used in SecurityConfig
        switch (className) {
            case "ADMIN":
                return "ADMIN";
            case "STAFFMEMBER":
                return "STAFFMEMBER";
            case "SAFARIGUIDE":
                return "SAFARIGUIDE";
            case "ITSUPPORT":
                return "ITSUPPORT";
            case "ITASSISTANT":
                return "ITASSISTANT";
            case "CUSTOMER":
                return "CUSTOMER";
            default:
                return "USER"; // Default role
        }
    }

    public String getEmailFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(secret.getBytes());

            if (signedJWT.verify(verifier)) {
                return signedJWT.getJWTClaimsSet().getSubject();
            }
            return null;
        } catch (ParseException | JOSEException e) {
            return null;
        }
    }

    public Long getUserIdFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(secret.getBytes());

            if (signedJWT.verify(verifier)) {
                JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
                return claims.getLongClaim("userId");
            }
            return null;
        } catch (ParseException | JOSEException e) {
            return null;
        }
    }

    public String getRoleFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(secret.getBytes());

            if (signedJWT.verify(verifier)) {
                JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
                return claims.getStringClaim("role");
            }
            return null;
        } catch (ParseException | JOSEException e) {
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(secret.getBytes());

            if (!signedJWT.verify(verifier)) {
                return false;
            }

            Date expiration = signedJWT.getJWTClaimsSet().getExpirationTime();
            return expiration != null && expiration.after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}