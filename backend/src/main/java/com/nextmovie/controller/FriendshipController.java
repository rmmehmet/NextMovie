package com.nextmovie.controller;

import com.nextmovie.security.TokenExtractor;
import com.nextmovie.service.FriendshipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
public class FriendshipController {

    private final FriendshipService friendshipService;
    private final TokenExtractor    tokenExtractor;

    public FriendshipController(FriendshipService friendshipService, TokenExtractor tokenExtractor) {
        this.friendshipService = friendshipService;
        this.tokenExtractor    = tokenExtractor;
    }

    @PostMapping("/request")
    public ResponseEntity<?> sendRequest(
            @RequestParam String username,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = tokenExtractor.extractUserId(authHeader);
            return ResponseEntity.ok(friendshipService.sendRequestByUsername(userId, username));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/respond/{friendshipId}")
    public ResponseEntity<String> respond(
            @PathVariable Long friendshipId,
            @RequestParam boolean accept,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = tokenExtractor.extractUserId(authHeader);
        return ResponseEntity.ok(friendshipService.respond(friendshipId, userId, accept));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getFriends(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = tokenExtractor.extractUserId(authHeader);
        return ResponseEntity.ok(friendshipService.getFriends(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Map<String, Object>>> getPending(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = tokenExtractor.extractUserId(authHeader);
        return ResponseEntity.ok(friendshipService.getPendingRequests(userId));
    }
}