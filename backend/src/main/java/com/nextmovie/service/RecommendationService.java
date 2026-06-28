package com.nextmovie.service;

import com.nextmovie.dto.MovieDTO;
import com.nextmovie.entity.Movie;
import com.nextmovie.repository.MovieRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Value("${recommendation.service.url:http://localhost:8001}")
    private String recServiceUrl;

    private final MovieRepository movieRepository;
    private final RestTemplate    restTemplate;

    public RecommendationService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
        this.restTemplate    = new RestTemplate();
    }

    public List<MovieDTO> getSimilar(Long movieId, int topK) {
        try {
            String url = recServiceUrl + "/similar";

            Map<String, Object> request = Map.of(
                    "movie_id", movieId,
                    "top_k",    topK
            );

            SimilarResponse response = restTemplate.postForObject(
                    url, request, SimilarResponse.class
            );

            if (response == null || response.similarIds == null || response.similarIds.isEmpty()) {
                return Collections.emptyList();
            }

            // ID sırası korunarak PostgreSQL'den çek
            List<Movie> movies = movieRepository.findAllById(response.similarIds);

            // Python servisinin döndürdüğü sırayı koru
            Map<Long, Movie> movieMap = movies.stream()
                    .collect(Collectors.toMap(Movie::getId, m -> m));

            return response.similarIds.stream()
                    .map(movieMap::get)
                    .filter(m -> m != null)
                    .map(this::toDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            // Python servisi kapalıysa boş liste dön, uygulama çökmez
            System.err.println("[RecommendationService] Python servisi erişilemedi: " + e.getMessage());
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
    static class SimilarResponse {
        public Integer movieId;
        public List<Long> similarIds;

        public void setMovie_id(Integer v)       { this.movieId    = v; }
        public void setSimilar_ids(List<Long> v) { this.similarIds = v; }
    }
}