import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/authService";
import "./ForYouTab.css";

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

const MovieCard = ({ movie, onLike, likedIds }) => {
  const navigate = useNavigate();
  const liked = likedIds.has(movie.id);
  return (
    <div className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
      <div className="movie-card__poster-wrap">
        <img className="movie-card__poster"
          src={movie.posterPath ? `${TMDB_IMG}${movie.posterPath}` : "/placeholder.png"}
          alt={movie.title} loading="lazy" />
        <div className="movie-card__overlay">
          <span className="movie-card__score">★ {movie.voteAverage?.toFixed(1)}</span>
          <button className={`movie-card__like-btn ${liked ? "liked" : ""}`}
            onClick={e => { e.stopPropagation(); onLike(movie.id); }}>
            {liked ? "❤️" : "🤍"}
          </button>
        </div>
      </div>
      <div className="movie-card__info">
        <p className="movie-card__title">{movie.title}</p>
        <p className="movie-card__meta">{movie.releaseDate?.slice(0,4)} · {movie.genres?.split(",")[0]}</p>
      </div>
    </div>
  );
};

export default function ForYouTab({ onLike, likedIds }) {
  const [movies, setMovies]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasRatings, setHasRatings] = useState(true);

  useEffect(() => {
    api.get("/recommendations/personalized")
      .then(r => {
        setMovies(r.data);
        setHasRatings(r.data.length > 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="foryou-section">
      <div className="foryou-section__header">
        <h2 className="foryou-section__title">Sana Özel</h2>
        <span className="foryou-section__badge">Modül 2</span>
      </div>
      <div className="movie-row">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="movie-card movie-card--skeleton" />
        ))}
      </div>
    </div>
  );

  if (!hasRatings) return (
    <div className="foryou-empty">
      <div className="foryou-empty__icon">✨</div>
      <h3>Henüz yeterli veri yok</h3>
      <p>Birkaç filme puan ver veya arkadaş edinin —<br />sistem sana özel öneriler oluşturacak.</p>
    </div>
  );

  return (
    <div className="foryou-section">
      <div className="foryou-section__header">
        <h2 className="foryou-section__title">Sana Özel</h2>
        <span className="foryou-section__badge">✨ Modül 2</span>
      </div>
      <div className="movie-row">
        {movies.map(m => (
          <MovieCard key={m.id} movie={m} onLike={onLike} likedIds={likedIds} />
        ))}
      </div>
    </div>
  );
}