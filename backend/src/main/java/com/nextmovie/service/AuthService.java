package com.nextmovie.service;

import com.nextmovie.dto.AuthResponse;
import com.nextmovie.dto.LoginRequest;
import com.nextmovie.dto.RegisterRequest;
import com.nextmovie.entity.User;
import com.nextmovie.repository.UserRepository;
import com.nextmovie.security.JwtService;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public String register(RegisterRequest request) {
        User user = new User();
        user.setUsername(request.username);
        user.setEmail(request.email);
        user.setPassword(request.password);
        user.setName(request.name);
        user.setLastname(request.lastname);
        userRepository.save(user);
        return "User registered";
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(request.password)) {
            throw new RuntimeException("Wrong password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(token, user.getEmail(), user.getUsername(), user.getName());
    }
}