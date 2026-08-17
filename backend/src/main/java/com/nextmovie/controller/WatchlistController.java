package com.nextmovie.controller;

import com.nextmovie.dto.MovieDTO;
import com.nextmovie.security.TokenExtractor;
import com.nextmovie.service.WatchlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;
    private final TokenExtractor   tokenExtractor;

    public WatchlistController(WatchlistService watchlistService, TokenExtractor tokenExtractor) {
        this.watchlistService = watchlistService;
        this.tokenExtractor   = tokenExtractor;
    }

    @PostMapping("/{movieId}/toggle")
    public ResponseEntity<Map<String, Boolean>> toggle(
            @PathVariable Long movieId,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = tokenExtractor.extractUserId(authHeader);
        boolean added = watchlistService.toggle(userId, movieId);
        return ResponseEntity.ok(Map.of("inWatchlist", added));
    }

    @GetMapping
    public ResponseEntity<List<MovieDTO>> getWatchlist(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = tokenExtractor.extractUserId(authHeader);
        return ResponseEntity.ok(watchlistService.getWatchlist(userId));
    }
}