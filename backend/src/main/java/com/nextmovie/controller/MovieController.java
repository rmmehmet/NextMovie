package com.nextmovie.controller;

import com.nextmovie.dto.MovieDTO;
import com.nextmovie.dto.MovieDetailDTO;
import com.nextmovie.entity.User;
import com.nextmovie.repository.UserRepository;
import com.nextmovie.service.MovieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService   movieService;
    private final UserRepository userRepository;

    public MovieController(MovieService movieService, UserRepository userRepository) {
        this.movieService   = movieService;
        this.userRepository = userRepository;
    }

    @GetMapping("/popular")
    public ResponseEntity<List<MovieDTO>> getPopular() {
        return ResponseEntity.ok(movieService.getPopular());
    }

    @GetMapping("/top-rated")
    public ResponseEntity<List<MovieDTO>> getTopRated() {
        return ResponseEntity.ok(movieService.getTopRated());
    }

    @GetMapping("/trending")
    public ResponseEntity<List<MovieDTO>> getTrending() {
        return ResponseEntity.ok(movieService.getTrending());
    }

    @GetMapping("/search")
    public ResponseEntity<List<MovieDTO>> search(@RequestParam String q) {
        return ResponseEntity.ok(movieService.searchByTitle(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovieDetailDTO> getDetail(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(movieService.getDetail(id, userId));
    }

    // Token'dan userId çıkar (Base64 encode = email, email'den user bul)
    private Long extractUserId(String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
            String token = authHeader.substring(7);
            String email = new String(java.util.Base64.getDecoder().decode(token));
            return userRepository.findByEmail(email).map(User::getId).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}