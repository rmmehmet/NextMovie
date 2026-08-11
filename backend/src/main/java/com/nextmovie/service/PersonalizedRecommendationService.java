package com.nextmovie.service;

import com.nextmovie.dto.MovieDTO;
import com.nextmovie.entity.Friendship;
import com.nextmovie.entity.Movie;
import com.nextmovie.entity.Rating;
import com.nextmovie.repository.FriendshipRepository;
import com.nextmovie.repository.MovieRepository;
import com.nextmovie.repository.RatingRepository;
import com.nextmovie.repository.WatchlistRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PersonalizedRecommendationService {

    @Value("${recommendation.service.url:http://localhost:8001}")
    private String recServiceUrl;

    private final RatingRepository     ratingRepository;
    private final FriendshipRepository friendshipRepository;
    private final WatchlistRepository  watchlistRepository;
    private final MovieRepository      movieRepository;
    private final RestTemplate         restTemplate;

    public PersonalizedRecommendationService(
            RatingRepository ratingRepository,
            FriendshipRepository friendshipRepository,
            WatchlistRepository watchlistRepository,
            MovieRepository movieRepository) {
        this.ratingRepository     = ratingRepository;
        this.friendshipRepository = friendshipRepository;
        this.watchlistRepository  = watchlistRepository;
        this.movieRepository      = movieRepository;
        this.restTemplate         = new RestTemplate();
    }

    public List<MovieDTO> getPersonalized(Long userId) {
        // Kullanıcının izlediği film ID'leri (rating + watchlist)
        Set<Long> alreadySeen = getSeenMovieIds(userId);

        // 1. Kullanıcının beğendiği filmlerden vektör benzerliği
        List<Long> fromHistory  = getFromHistory(userId, alreadySeen);

        // 2. Arkadaşların yüksek puanlı filmleri
        List<Long> fromFriends  = getFromFriends(userId, alreadySeen);

        // Birleştir, tekrarları çıkar, önce history sonra friends
        LinkedHashSet<Long> merged = new LinkedHashSet<>();
        merged.addAll(fromHistory);
        merged.addAll(fromFriends);

        if (merged.isEmpty()) {
            // Hiç sinyal yoksa popüler filmler dön
            return movieRepository.findTop20ByOrderByPopularityDesc()
                    .stream().map(this::toDTO).collect(Collectors.toList());
        }

        List<Movie> movies = movieRepository.findAllById(new ArrayList<>(merged));
        Map<Long, Movie> movieMap = movies.stream()
                .collect(Collectors.toMap(Movie::getId, m -> m));

        return merged.stream()
                .limit(20)
                .map(movieMap::get)
                .filter(Objects::nonNull)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private Set<Long> getSeenMovieIds(Long userId) {
        Set<Long> seen = new HashSet<>();
        ratingRepository.findByUserId(userId).forEach(r -> seen.add(r.getMovie().getId()));
        watchlistRepository.findByUserId(userId).forEach(w -> seen.add(w.getMovie().getId()));
        return seen;
    }

    private List<Long> getFromHistory(Long userId, Set<Long> exclude) {
        // En yüksek puanlı 5 filmin her biri için Milvus'tan benzerler al
        List<Rating> topRatings = ratingRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparingInt(r -> -r.getScore()))
                .limit(5)
                .collect(Collectors.toList());

        if (topRatings.isEmpty()) return Collections.emptyList();

        Set<Long> results = new LinkedHashSet<>();
        for (Rating r : topRatings) {
            try {
                List<Long> similar = callSimilar(r.getMovie().getId(), 8);
                similar.stream().filter(id -> !exclude.contains(id)).forEach(results::add);
            } catch (Exception ignored) {}
        }
        return new ArrayList<>(results);
    }

    private List<Long> getFromFriends(Long userId, Set<Long> exclude) {
        List<Friendship> friendships = friendshipRepository.findAcceptedFriendships(userId);
        if (friendships.isEmpty()) return Collections.emptyList();

        Set<Long> friendIds = friendships.stream()
                .map(f -> f.getRequester().getId().equals(userId)
                        ? f.getAddressee().getId() : f.getRequester().getId())
                .collect(Collectors.toSet());

        // Arkadaşların 7+ puan verdiği filmler
        return friendIds.stream()
                .flatMap(fid -> ratingRepository.findByUserId(fid).stream())
                .filter(r -> r.getScore() >= 7)
                .filter(r -> !exclude.contains(r.getMovie().getId()))
                .sorted(Comparator.comparingInt(r -> -r.getScore()))
                .map(r -> r.getMovie().getId())
                .distinct()
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<Long> callSimilar(Long movieId, int topK) {
        String url = recServiceUrl + "/similar";
        Map<String, Object> req = Map.of("movie_id", movieId, "top_k", topK);
        SimilarResponse res = restTemplate.postForObject(url, req, SimilarResponse.class);
        if (res == null || res.similarIds == null) return Collections.emptyList();
        return res.similarIds;
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
        public List<Long> similarIds;
        public void setSimilar_ids(List<Long> v) { this.similarIds = v; }
    }
}