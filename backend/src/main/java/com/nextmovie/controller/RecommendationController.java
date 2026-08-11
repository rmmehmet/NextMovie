package com.nextmovie.controller;

import com.nextmovie.dto.MovieDTO;
import com.nextmovie.entity.User;
import com.nextmovie.repository.UserRepository;
import com.nextmovie.service.PersonalizedRecommendationService;
import com.nextmovie.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService             recommendationService;
    private final PersonalizedRecommendationService personalizedService;
    private final UserRepository                    userRepository;

    public RecommendationController(
            RecommendationService recommendationService,
            PersonalizedRecommendationService personalizedService,
            UserRepository userRepository) {
        this.recommendationService = recommendationService;
        this.personalizedService   = personalizedService;
        this.userRepository        = userRepository;
    }

    // Modül 1
    @GetMapping("/similar/{movieId}")
    public ResponseEntity<List<MovieDTO>> getSimilar(
            @PathVariable Long movieId,
            @RequestParam(defaultValue = "10") int topK) {
        return ResponseEntity.ok(recommendationService.getSimilar(movieId, topK));
    }

    // Modül 2
    @GetMapping("/personalized")
    public ResponseEntity<List<MovieDTO>> getPersonalized(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(personalizedService.getPersonalized(userId));
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        String email = new String(java.util.Base64.getDecoder().decode(token));
        return userRepository.findByEmail(email).map(User::getId).orElseThrow();
    }
}