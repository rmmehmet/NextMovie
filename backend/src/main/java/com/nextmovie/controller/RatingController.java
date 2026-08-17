package com.nextmovie.controller;

import com.nextmovie.security.TokenExtractor;
import com.nextmovie.service.RatingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingService  ratingService;
    private final TokenExtractor tokenExtractor;

    public RatingController(RatingService ratingService, TokenExtractor tokenExtractor) {
        this.ratingService  = ratingService;
        this.tokenExtractor = tokenExtractor;
    }

    @PostMapping("/{movieId}")
    public ResponseEntity<Map<String, Object>> rate(
            @PathVariable Long movieId,
            @RequestParam int score,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = tokenExtractor.extractUserId(authHeader);
        return ResponseEntity.ok(ratingService.rate(userId, movieId, score));
    }

    @GetMapping("/{movieId}")
    public ResponseEntity<Map<String, Object>> getRating(
            @PathVariable Long movieId,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = tokenExtractor.extractUserId(authHeader);
        return ResponseEntity.ok(ratingService.getUserRating(userId, movieId));
    }
}