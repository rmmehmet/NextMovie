package com.nextmovie.controller;

import com.nextmovie.dto.MovieDTO;
import com.nextmovie.entity.User;
import com.nextmovie.repository.UserRepository;
import com.nextmovie.service.WatchlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;
    private final UserRepository   userRepository;

    public WatchlistController(WatchlistService watchlistService, UserRepository userRepository) {
        this.watchlistService = watchlistService;
        this.userRepository   = userRepository;
    }

    @PostMapping("/{movieId}/toggle")
    public ResponseEntity<Map<String, Boolean>> toggle(
            @PathVariable Long movieId,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        boolean added = watchlistService.toggle(userId, movieId);
        return ResponseEntity.ok(Map.of("inWatchlist", added));
    }

    @GetMapping
    public ResponseEntity<List<MovieDTO>> getWatchlist(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(watchlistService.getWatchlist(userId));
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        String email = new String(java.util.Base64.getDecoder().decode(token));
        return userRepository.findByEmail(email).map(User::getId).orElseThrow();
    }
}