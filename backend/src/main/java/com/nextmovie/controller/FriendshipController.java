package com.nextmovie.controller;

import com.nextmovie.entity.User;
import com.nextmovie.repository.UserRepository;
import com.nextmovie.service.FriendshipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
public class FriendshipController {

    private final FriendshipService friendshipService;
    private final UserRepository    userRepository;

    public FriendshipController(FriendshipService friendshipService, UserRepository userRepository) {
        this.friendshipService = friendshipService;
        this.userRepository    = userRepository;
    }

    // Kullanıcı adıyla arkadaşlık isteği gönder
    @PostMapping("/request")
    public ResponseEntity<?> sendRequest(
            @RequestParam String username,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserId(authHeader);
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
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(friendshipService.respond(friendshipId, userId, accept));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getFriends(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(friendshipService.getFriends(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Map<String, Object>>> getPending(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(friendshipService.getPendingRequests(userId));
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        String email = new String(java.util.Base64.getDecoder().decode(token));
        return userRepository.findByEmail(email).map(User::getId).orElseThrow();
    }
}