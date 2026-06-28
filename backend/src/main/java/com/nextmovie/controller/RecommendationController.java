package com.nextmovie.controller;

import com.nextmovie.dto.MovieDTO;
import com.nextmovie.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/similar/{movieId}")
    public ResponseEntity<List<MovieDTO>> getSimilar(
            @PathVariable Long movieId,
            @RequestParam(defaultValue = "10") int topK) {
        return ResponseEntity.ok(recommendationService.getSimilar(movieId, topK));
    }
}