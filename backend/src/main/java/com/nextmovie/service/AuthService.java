package com.nextmovie.service;

import com.nextmovie.dto.LoginRequest;
import com.nextmovie.dto.RegisterRequest;
import com.nextmovie.entity.User;
import com.nextmovie.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
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

    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(request.password)) {
            throw new RuntimeException("Wrong password");
        }

        return "Login successful";
    }
}