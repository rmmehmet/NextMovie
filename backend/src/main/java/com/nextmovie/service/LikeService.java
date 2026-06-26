package com.nextmovie.service;

import com.nextmovie.entity.Like;
import com.nextmovie.entity.Movie;
import com.nextmovie.entity.User;
import com.nextmovie.repository.LikeRepository;
import com.nextmovie.repository.MovieRepository;
import com.nextmovie.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LikeService {

    private final LikeRepository  likeRepository;
    private final MovieRepository movieRepository;
    private final UserRepository  userRepository;

    public LikeService(LikeRepository likeRepository,
                       MovieRepository movieRepository,
                       UserRepository userRepository) {
        this.likeRepository  = likeRepository;
        this.movieRepository = movieRepository;
        this.userRepository  = userRepository;
    }

    @Transactional
    public boolean toggle(Long userId, Long movieId) {
        if (likeRepository.existsByUserIdAndMovieId(userId, movieId)) {
            likeRepository.deleteByUserIdAndMovieId(userId, movieId);
            return false; // beğeni kaldırıldı
        }
        User  user  = userRepository.findById(userId).orElseThrow();
        Movie movie = movieRepository.findById(movieId).orElseThrow();
        Like  like  = new Like();
        like.setUser(user);
        like.setMovie(movie);
        likeRepository.save(like);
        return true; // beğenildi
    }

    public boolean isLiked(Long userId, Long movieId) {
        return likeRepository.existsByUserIdAndMovieId(userId, movieId);
    }
}