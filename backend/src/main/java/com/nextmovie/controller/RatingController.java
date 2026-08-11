package com.nextmovie.controller;

import com.nextmovie.entity.User;
import com.nextmovie.repository.UserRepository;
import com.nextmovie.service.RatingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingService  ratingService;
    private final UserRepository userRepository;

    public RatingController(RatingService ratingService, UserRepository userRepository) {
        this.ratingService  = ratingService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{movieId}")
    public ResponseEntity<Map<String, Object>> rate(
            @PathVariable Long movieId,
            @RequestParam int score,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(ratingService.rate(userId, movieId, score));
    }

    @GetMapping("/{movieId}")
    public ResponseEntity<Map<String, Object>> getRating(
            @PathVariable Long movieId,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(ratingService.getUserRating(userId, movieId));
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        String email = new String(java.util.Base64.getDecoder().decode(token));
        return userRepository.findByEmail(email).map(User::getId).orElseThrow();
    }
}