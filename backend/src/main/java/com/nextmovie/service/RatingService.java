package com.nextmovie.service;

import com.nextmovie.entity.Movie;
import com.nextmovie.entity.Rating;
import com.nextmovie.entity.User;
import com.nextmovie.repository.MovieRepository;
import com.nextmovie.repository.RatingRepository;
import com.nextmovie.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final MovieRepository  movieRepository;
    private final UserRepository   userRepository;

    public RatingService(RatingRepository ratingRepository,
                         MovieRepository movieRepository,
                         UserRepository userRepository) {
        this.ratingRepository = ratingRepository;
        this.movieRepository  = movieRepository;
        this.userRepository   = userRepository;
    }

    @Transactional
    public Map<String, Object> rate(Long userId, Long movieId, int score) {
        if (score < 1 || score > 10)
            throw new RuntimeException("Puan 1-10 arasında olmalıdır.");

        Optional<Rating> existing = ratingRepository.findByUserIdAndMovieId(userId, movieId);
        Rating rating;

        if (existing.isPresent()) {
            rating = existing.get();
            rating.setScore((short) score);
        } else {
            User  user  = userRepository.findById(userId).orElseThrow();
            Movie movie = movieRepository.findById(movieId).orElseThrow();
            rating = new Rating();
            rating.setUser(user);
            rating.setMovie(movie);
            rating.setScore((short) score);
        }

        ratingRepository.save(rating);
        Double avg = ratingRepository.findAverageScoreByMovieId(movieId);

        return Map.of(
                "userScore",   score,
                "averageScore", avg != null ? Math.round(avg * 10.0) / 10.0 : score
        );
    }

    public Map<String, Object> getUserRating(Long userId, Long movieId) {
        return ratingRepository.findByUserIdAndMovieId(userId, movieId)
                .map(r -> Map.<String, Object>of("userScore", (int) r.getScore()))
                .orElse(Map.of("userScore", 0));
    }
}