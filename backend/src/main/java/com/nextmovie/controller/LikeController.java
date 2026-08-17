package com.nextmovie.controller;

import com.nextmovie.security.TokenExtractor;
import com.nextmovie.service.LikeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    private final LikeService    likeService;
    private final TokenExtractor tokenExtractor;

    public LikeController(LikeService likeService, TokenExtractor tokenExtractor) {
        this.likeService    = likeService;
        this.tokenExtractor = tokenExtractor;
    }

    @PostMapping("/{movieId}/toggle")
    public ResponseEntity<Map<String, Boolean>> toggle(
            @PathVariable Long movieId,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = tokenExtractor.extractUserId(authHeader);
        boolean liked = likeService.toggle(userId, movieId);
        return ResponseEntity.ok(Map.of("liked", liked));
    }
}