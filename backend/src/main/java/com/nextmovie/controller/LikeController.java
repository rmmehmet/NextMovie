package com.nextmovie.controller;

import com.nextmovie.entity.User;
import com.nextmovie.repository.UserRepository;
import com.nextmovie.service.LikeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    private final LikeService    likeService;
    private final UserRepository userRepository;

    public LikeController(LikeService likeService, UserRepository userRepository) {
        this.likeService    = likeService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{movieId}/toggle")
    public ResponseEntity<Map<String, Boolean>> toggle(
            @PathVariable Long movieId,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        boolean liked = likeService.toggle(userId, movieId);
        return ResponseEntity.ok(Map.of("liked", liked));
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        String email = new String(java.util.Base64.getDecoder().decode(token));
        return userRepository.findByEmail(email).map(User::getId).orElseThrow();
    }
}