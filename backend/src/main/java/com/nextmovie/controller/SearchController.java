package com.nextmovie.controller;

import com.nextmovie.dto.MovieDTO;
import com.nextmovie.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/semantic")
    public ResponseEntity<List<MovieDTO>> semanticSearch(@RequestParam String q) {
        return ResponseEntity.ok(searchService.semanticSearch(q));
    }
}