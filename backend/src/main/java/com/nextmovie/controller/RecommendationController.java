package com.nextmovie.controller;

import com.nextmovie.dto.MovieDTO;
import com.nextmovie.security.TokenExtractor;
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
    private final TokenExtractor                    tokenExtractor;

    public RecommendationController(
            RecommendationService recommendationService,
            PersonalizedRecommendationService personalizedService,
            TokenExtractor tokenExtractor) {
        this.recommendationService = recommendationService;
        this.personalizedService   = personalizedService;
        this.tokenExtractor        = tokenExtractor;
    }

    @GetMapping("/similar/{movieId}")
    public ResponseEntity<List<MovieDTO>> getSimilar(
            @PathVariable Long movieId,
            @RequestParam(defaultValue = "10") int topK) {
        return ResponseEntity.ok(recommendationService.getSimilar(movieId, topK));
    }

    @GetMapping("/personalized")
    public ResponseEntity<List<MovieDTO>> getPersonalized(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = tokenExtractor.extractUserId(authHeader);
        return ResponseEntity.ok(personalizedService.getPersonalized(userId));
    }
}