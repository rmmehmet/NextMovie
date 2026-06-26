package com.nextmovie.service;

import com.nextmovie.dto.MovieDTO;
import com.nextmovie.entity.Movie;
import com.nextmovie.entity.User;
import com.nextmovie.entity.Watchlist;
import com.nextmovie.repository.MovieRepository;
import com.nextmovie.repository.UserRepository;
import com.nextmovie.repository.WatchlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final MovieRepository     movieRepository;
    private final UserRepository      userRepository;

    public WatchlistService(WatchlistRepository watchlistRepository,
                            MovieRepository movieRepository,
                            UserRepository userRepository) {
        this.watchlistRepository = watchlistRepository;
        this.movieRepository     = movieRepository;
        this.userRepository      = userRepository;
    }

    @Transactional
    public boolean toggle(Long userId, Long movieId) {
        if (watchlistRepository.existsByUserIdAndMovieId(userId, movieId)) {
            watchlistRepository.deleteByUserIdAndMovieId(userId, movieId);
            return false;
        }
        User  user  = userRepository.findById(userId).orElseThrow();
        Movie movie = movieRepository.findById(movieId).orElseThrow();
        Watchlist w = new Watchlist();
        w.setUser(user);
        w.setMovie(movie);
        watchlistRepository.save(w);
        return true;
    }

    public List<MovieDTO> getWatchlist(Long userId) {
        return watchlistRepository.findByUserId(userId).stream()
                .map(w -> {
                    Movie m = w.getMovie();
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
                }).collect(Collectors.toList());
    }
}