package com.nextmovie.service;

import com.nextmovie.dto.MovieDTO;
import com.nextmovie.entity.Movie;
import com.nextmovie.repository.MovieRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
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
        // İlk aşamada TMDB popularity * vote'a göre sıralanmış liste
        // Sonraki aşamada kullanıcı etkileşimlerine göre hesaplanacak
        return movieRepository.findTop20ByOrderByPopularityDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MovieDTO getById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Film bulunamadı: " + id));
        return toDTO(movie);
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
}