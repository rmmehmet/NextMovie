package com.nextmovie.repository;

import com.nextmovie.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    List<Movie> findTop20ByOrderByPopularityDesc();

    List<Movie> findTop20ByOrderByVoteAverageDesc();

    Optional<Movie> findByTmdbId(Integer tmdbId);

    boolean existsByTmdbId(Integer tmdbId);

    // Arama: başlık içinde geçen filmler, popularity'e göre sıralı
    List<Movie> findTop10ByTitleContainingIgnoreCaseOrderByPopularityDesc(String title);
}