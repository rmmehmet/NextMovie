package com.nextmovie.service;

import com.nextmovie.dto.MovieDTO;
import com.nextmovie.entity.Movie;
import com.nextmovie.repository.MovieRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SearchService {

    @Value("${recommendation.service.url:http://localhost:8001}")
    private String recServiceUrl;

    private final MovieRepository movieRepository;
    private final RestTemplate    restTemplate;

    public SearchService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
        this.restTemplate    = new RestTemplate();
    }

    public List<MovieDTO> semanticSearch(String query) {
        try {
            String url = recServiceUrl + "/search";

            Map<String, Object> request = Map.of(
                    "query", query,
                    "top_k", 20
            );

            SearchResponse response = restTemplate.postForObject(
                    url, request, SearchResponse.class
            );

            if (response == null || response.similarIds == null || response.similarIds.isEmpty()) {
                return Collections.emptyList();
            }

            List<Movie> movies = movieRepository.findAllById(response.similarIds);

            Map<Long, Movie> movieMap = movies.stream()
                    .collect(Collectors.toMap(Movie::getId, m -> m));

            return response.similarIds.stream()
                    .map(movieMap::get)
                    .filter(m -> m != null)
                    .map(this::toDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            System.err.println("[SearchService] Python servisi erişilemedi: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    private MovieDTO toDTO(Movie m) {
        MovieDTO dto = new MovieDTO();
        dto.setId(m.getId());
        dto.setTmdbId(m.getTmdbId());
        dto.setTitle(m.getTitle());
        dto.setOverview(m.getOverview());
        dto.setGenres(m.getGenres());
        dto.setPosterPath(m.getPosterPath());
        dto.setVoteAverage(m.getVoteAverage());
        dto.setReleaseDate(m.getReleaseDate() != null ? m.getReleaseDate().toString() : null);
        dto.setOriginalLanguage(m.getOriginalLanguage());
        return dto;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class SearchResponse {
        public String query;
        public List<Long> similarIds;

        public void setSimilar_ids(List<Long> v) { this.similarIds = v; }
    }
}