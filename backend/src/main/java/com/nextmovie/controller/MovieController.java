package com.nextmovie.controller;

import com.nextmovie.dto.MovieDTO;
import com.nextmovie.dto.MovieDetailDTO;
import com.nextmovie.security.TokenExtractor;
import com.nextmovie.service.MovieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService    movieService;
    private final TokenExtractor  tokenExtractor;

    public MovieController(MovieService movieService, TokenExtractor tokenExtractor) {
        this.movieService   = movieService;
        this.tokenExtractor = tokenExtractor;
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
        Long userId = authHeader != null ? tokenExtractor.extractUserId(authHeader) : null;
        return ResponseEntity.ok(movieService.getDetail(id, userId));
    }
}