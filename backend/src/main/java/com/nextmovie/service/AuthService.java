package com.nextmovie.service;

import com.nextmovie.dto.AuthResponse;
import com.nextmovie.dto.LoginRequest;
import com.nextmovie.dto.RegisterRequest;
import com.nextmovie.entity.User;
import com.nextmovie.repository.UserRepository;
import com.nextmovie.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository  userRepository;
    private final JwtService      jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.jwtService      = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public String register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email).isPresent())
            throw new RuntimeException("Bu email zaten kayıtlı.");
        if (userRepository.findByUsername(request.username).isPresent())
            throw new RuntimeException("Bu kullanıcı adı zaten alınmış.");

        User user = new User();
        user.setUsername(request.username);
        user.setEmail(request.email);
        user.setPassword(passwordEncoder.encode(request.password)); // BCrypt
        user.setName(request.name);
        user.setLastname(request.lastname);
        userRepository.save(user);
        return "Kayıt başarılı.";
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email)
                .orElseThrow(() -> new RuntimeException("Email veya şifre hatalı."));

        if (!passwordEncoder.matches(request.password, user.getPassword()))
            throw new RuntimeException("Email veya şifre hatalı.");

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getUsername(), user.getName());
    }
}