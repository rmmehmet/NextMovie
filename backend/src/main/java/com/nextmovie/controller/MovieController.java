package com.nextmovie.controller;

import com.nextmovie.service.MovieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.nextmovie.dto.MovieDTO;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "http://localhost:3000")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
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

    @GetMapping("/{id}")
    public ResponseEntity<MovieDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(movieService.getById(id));
    }
}