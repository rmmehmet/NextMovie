package com.nextmovie.service;

import com.nextmovie.entity.Movie;
import com.nextmovie.repository.MovieRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;

@Service
public class TmdbImportService {

    private static final Logger log = LoggerFactory.getLogger(TmdbImportService.class);
    private static final String TMDB_BASE = "https://api.themoviedb.org/3";

    @Value("${tmdb.api.key}")
    private String apiKey;

    private final MovieRepository movieRepository;
    private final RestTemplate restTemplate;

    public TmdbImportService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
        this.restTemplate = new RestTemplate();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void importOnStartup() {
        long count = movieRepository.count();
        if (count > 0) {
            log.info("Filmler zaten mevcut ({} adet), import atlandı.", count);
            return;
        }
        log.info("Film verisi bulunamadı, TMDB'den çekiliyor...");
        importPopular(250);
        importTopRated(250);
        log.info("Import tamamlandı. Toplam: {} film", movieRepository.count());
    }

    public void importPopular(int pages) {
        fetchAndSave("/movie/popular", pages);
    }

    public void importTopRated(int pages) {
        fetchAndSave("/movie/top_rated", pages);
    }

    private void fetchAndSave(String endpoint, int pages) {
        for (int page = 1; page <= pages; page++) {
            try {
                String url = TMDB_BASE + endpoint + "?api_key=" + apiKey
                        + "&language=tr-TR&page=" + page;
                TmdbPageResponse response = restTemplate.getForObject(url, TmdbPageResponse.class);
                if (response == null || response.results == null) break;

                for (TmdbMovieResult r : response.results) {
                    if (movieRepository.existsByTmdbId(r.id)) continue;
                    movieRepository.save(toEntity(r));
                }
                log.info("{} - sayfa {}/{} kaydedildi.", endpoint, page, pages);
            } catch (Exception e) {
                log.error("TMDB fetch hatası (sayfa {}): {}", page, e.getMessage());
            }
        }
    }

    private Movie toEntity(TmdbMovieResult r) {
        Movie m = new Movie();
        m.setTmdbId(r.id);
        m.setTitle(r.title != null ? r.title : r.originalTitle);
        m.setOverview(r.overview);
        m.setPosterPath(r.posterPath);
        m.setVoteAverage(r.voteAverage);
        m.setPopularity(r.popularity);
        m.setOriginalLanguage(r.originalLanguage);

        if (r.genreIds != null && !r.genreIds.isEmpty()) {
            m.setGenres(resolveGenreNames(r.genreIds));
        }

        if (r.releaseDate != null && !r.releaseDate.isBlank()) {
            try {
                m.setReleaseDate(LocalDate.parse(r.releaseDate));
            } catch (Exception ignored) {}
        }

        return m;
    }

    private String resolveGenreNames(List<Integer> ids) {
        return ids.stream()
                .map(this::genreName)
                .filter(n -> !n.isEmpty())
                .reduce((a, b) -> a + "," + b)
                .orElse("");
    }

    private String genreName(int id) {
        return switch (id) {
            case 28    -> "Action";
            case 12    -> "Adventure";
            case 16    -> "Animation";
            case 35    -> "Comedy";
            case 80    -> "Crime";
            case 99    -> "Documentary";
            case 18    -> "Drama";
            case 10751 -> "Family";
            case 14    -> "Fantasy";
            case 36    -> "History";
            case 27    -> "Horror";
            case 10402 -> "Music";
            case 9648  -> "Mystery";
            case 10749 -> "Romance";
            case 878   -> "Science Fiction";
            case 10770 -> "TV Movie";
            case 53    -> "Thriller";
            case 10752 -> "War";
            case 37    -> "Western";
            default    -> "";
        };
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class TmdbPageResponse {
        public List<TmdbMovieResult> results;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class TmdbMovieResult {
        public Integer id;
        public String title;
        @JsonProperty("original_title")    public String originalTitle;
        public String overview;
        @JsonProperty("poster_path")       public String posterPath;
        @JsonProperty("vote_average")      public Double voteAverage;
        public Double popularity;
        @JsonProperty("original_language") public String originalLanguage;
        @JsonProperty("release_date")      public String releaseDate;
        @JsonProperty("genre_ids")         public List<Integer> genreIds;
    }
}