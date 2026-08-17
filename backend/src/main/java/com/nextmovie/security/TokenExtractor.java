package com.nextmovie.security;

import com.nextmovie.entity.User;
import com.nextmovie.repository.UserRepository;
import org.springframework.stereotype.Component;

@Component
public class TokenExtractor {

    private final JwtService     jwtService;
    private final UserRepository userRepository;

    public TokenExtractor(JwtService jwtService, UserRepository userRepository) {
        this.jwtService     = jwtService;
        this.userRepository = userRepository;
    }

    public String extractEmail(String authHeader) {
        String token = authHeader.substring(7);
        return jwtService.extractEmail(token);
    }

    public Long extractUserId(String authHeader) {
        String email = extractEmail(authHeader);
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));
    }

    public User extractUser(String authHeader) {
        String email = extractEmail(authHeader);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));
    }
}