package com.nextmovie.service;

import com.nextmovie.dto.MovieDTO;
import com.nextmovie.dto.MovieDetailDTO;
import com.nextmovie.entity.Movie;
import com.nextmovie.repository.LikeRepository;
import com.nextmovie.repository.MovieRepository;
import com.nextmovie.repository.UserRepository;
import com.nextmovie.repository.WatchlistRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovieService {

    @Value("${tmdb.api.key}")
    private String apiKey;

    private static final String TMDB_BASE = "https://api.themoviedb.org/3";

    private final MovieRepository    movieRepository;
    private final LikeRepository     likeRepository;
    private final WatchlistRepository watchlistRepository;
    private final UserRepository     userRepository;
    private final RestTemplate       restTemplate;

    public MovieService(MovieRepository movieRepository,
                        LikeRepository likeRepository,
                        WatchlistRepository watchlistRepository,
                        UserRepository userRepository) {
        this.movieRepository     = movieRepository;
        this.likeRepository      = likeRepository;
        this.watchlistRepository = watchlistRepository;
        this.userRepository      = userRepository;
        this.restTemplate        = new RestTemplate();
    }

    public List<MovieDTO> getPopular() {
        return movieRepository.findTop20ByOrderByPopularityDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<MovieDTO> getTopRated() {
        return movieRepository.findTop20ByOrderByVoteAverageDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<MovieDTO> getTrending() {
        return movieRepository.findTop20ByOrderByPopularityDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<MovieDTO> searchByTitle(String query) {
        return movieRepository
                .findTop10ByTitleContainingIgnoreCaseOrderByPopularityDesc(query)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MovieDetailDTO getDetail(Long id, Long userId) {
        Movie m = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Film bulunamadı: " + id));

        // TMDB'den detay + fragman çek
        String trailerKey  = fetchTrailerKey(m.getTmdbId());
        String backdropPath = fetchBackdropPath(m.getTmdbId(), m.getBackdropPath());

        MovieDetailDTO dto = new MovieDetailDTO();
        dto.setId(m.getId());
        dto.setTmdbId(m.getTmdbId());
        dto.setTitle(m.getTitle());
        dto.setOverview(m.getOverview());
        dto.setGenres(m.getGenres());
        dto.setPosterPath(m.getPosterPath());
        dto.setBackdropPath(backdropPath);
        dto.setVoteAverage(m.getVoteAverage());
        dto.setVoteCount(m.getVoteCount());
        dto.setReleaseDate(m.getReleaseDate() != null ? m.getReleaseDate().toString() : null);
        dto.setOriginalLanguage(m.getOriginalLanguage());
        dto.setRuntime(m.getRuntime());
        dto.setPopularity(m.getPopularity());
        dto.setTrailerKey(trailerKey);

        if (userId != null) {
            dto.setLiked(likeRepository.existsByUserIdAndMovieId(userId, id));
            dto.setInWatchlist(watchlistRepository.existsByUserIdAndMovieId(userId, id));
        }

        return dto;
    }

    private String fetchTrailerKey(Integer tmdbId) {
        try {
            String url = TMDB_BASE + "/movie/" + tmdbId + "/videos?api_key=" + apiKey + "&language=tr-TR";
            TmdbVideoResponse res = restTemplate.getForObject(url, TmdbVideoResponse.class);
            if (res != null && res.results != null) {
                // Önce Türkçe trailer ara, yoksa İngilizce
                return res.results.stream()
                        .filter(v -> "Trailer".equals(v.type) && "YouTube".equals(v.site))
                        .map(v -> v.key)
                        .findFirst()
                        .orElseGet(() -> {
                            try {
                                String enUrl = TMDB_BASE + "/movie/" + tmdbId + "/videos?api_key=" + apiKey + "&language=en-US";
                                TmdbVideoResponse enRes = restTemplate.getForObject(enUrl, TmdbVideoResponse.class);
                                if (enRes != null && enRes.results != null) {
                                    return enRes.results.stream()
                                            .filter(v -> "Trailer".equals(v.type) && "YouTube".equals(v.site))
                                            .map(v -> v.key)
                                            .findFirst().orElse(null);
                                }
                            } catch (Exception ignored) {}
                            return null;
                        });
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String fetchBackdropPath(Integer tmdbId, String existing) {
        if (existing != null) return existing;
        try {
            String url = TMDB_BASE + "/movie/" + tmdbId + "?api_key=" + apiKey;
            TmdbMovieDetail res = restTemplate.getForObject(url, TmdbMovieDetail.class);
            if (res != null) return res.backdropPath;
        } catch (Exception ignored) {}
        return null;
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
    static class TmdbVideoResponse {
        public List<TmdbVideo> results;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class TmdbVideo {
        public String key;
        public String site;
        public String type;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class TmdbMovieDetail {
        @JsonProperty("backdrop_path") public String backdropPath;
    }
}