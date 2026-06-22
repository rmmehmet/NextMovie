package com.nextmovie.security;

import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
public class JwtService {

    public String generateToken(String email) {
        return Base64.getEncoder().encodeToString(email.getBytes());
    }

    public String extractEmail(String token) {
        return new String(Base64.getDecoder().decode(token));
    }
}