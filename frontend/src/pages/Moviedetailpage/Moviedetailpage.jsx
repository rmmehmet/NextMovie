import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { movieService } from "../../services/movieService";
import "./MovieDetailPage.css";

const TMDB_IMG   = "https://image.tmdb.org/t/p/w500";
const TMDB_BACK  = "https://image.tmdb.org/t/p/w1280";

export default function MovieDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [movie, setMovie]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [liked, setLiked]       = useState(false);
  const [inList, setInList]     = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    setLoading(true);
    movieService.getDetail(id)
      .then(data => {
        setMovie(data);
        setLiked(data.liked);
        setInList(data.inWatchlist);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    try {
      const res = await movieService.toggleLike(movie.id);
      setLiked(res.liked);
    } catch (e) { console.error(e); }
  };

  const handleWatchlist = async () => {
    try {
      const res = await movieService.toggleWatchlist(movie.id);
      setInList(res.inWatchlist);
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="detail-loading">
      <div className="detail-loading__spinner" />
    </div>
  );

  if (!movie) return (
    <div className="detail-loading">
      <p>Film bulunamadı.</p>
    </div>
  );

  const genres = movie.genres?.split(",").map(g => g.trim()).filter(Boolean) || [];
  const year   = movie.releaseDate?.slice(0, 4);
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}s ${movie.runtime % 60}dk`
    : null;

  return (
    <div className="detail-root">
      {/* BACKDROP */}
      <div className="detail-backdrop">
        {movie.backdropPath
          ? <img src={`${TMDB_BACK}${movie.backdropPath}`} alt="" />
          : <div className="detail-backdrop__placeholder" />}
        <div className="detail-backdrop__overlay" />
      </div>

      {/* NAV */}
      <nav className="detail-nav">
        <button className="detail-nav__back" onClick={() => navigate(-1)}>
          ← Geri
        </button>
        <span className="detail-nav__logo" onClick={() => navigate("/")}>
          next<span>movie</span>
        </span>
      </nav>

      {/* CONTENT */}
      <div className="detail-content">
        {/* POSTER */}
        <div className="detail-poster-wrap">
          <img
            className="detail-poster"
            src={movie.posterPath ? `${TMDB_IMG}${movie.posterPath}` : "/placeholder.png"}
            alt={movie.title}
          />
          {movie.trailerKey && (
            <button className="detail-play-btn" onClick={() => setShowTrailer(true)}>
              ▶ Fragmanı İzle
            </button>
          )}
        </div>

        {/* INFO */}
        <div className="detail-info">
          <div className="detail-genres">
            {genres.map(g => <span key={g} className="detail-genre-tag">{g}</span>)}
          </div>

          <h1 className="detail-title">{movie.title}</h1>

          <div className="detail-meta">
            {year     && <span>{year}</span>}
            {runtime  && <><span className="detail-meta__dot">·</span><span>{runtime}</span></>}
            {movie.originalLanguage && (
              <><span className="detail-meta__dot">·</span>
              <span className="detail-meta__lang">{movie.originalLanguage.toUpperCase()}</span></>
            )}
          </div>

          <div className="detail-score">
            <span className="detail-score__star">★</span>
            <span className="detail-score__val">{movie.voteAverage?.toFixed(1)}</span>
            {movie.voteCount && (
              <span className="detail-score__count">({movie.voteCount.toLocaleString()} oy)</span>
            )}
          </div>

          <p className="detail-overview">{movie.overview || "Açıklama mevcut değil."}</p>

          <div className="detail-actions">
            <button
              className={`detail-action-btn ${liked ? "active-like" : ""}`}
              onClick={handleLike}
            >
              {liked ? "❤️ Beğenildi" : "🤍 Beğen"}
            </button>
            <button
              className={`detail-action-btn ${inList ? "active-list" : ""}`}
              onClick={handleWatchlist}
            >
              {inList ? "✓ Listede" : "+ Listeye Ekle"}
            </button>
            {movie.trailerKey && (
              <button className="detail-action-btn detail-action-btn--trailer"
                onClick={() => setShowTrailer(true)}>
                ▶ Fragman
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TRAILER MODAL */}
      {showTrailer && movie.trailerKey && (
        <div className="trailer-overlay" onClick={() => setShowTrailer(false)}>
          <div className="trailer-modal" onClick={e => e.stopPropagation()}>
            <button className="trailer-close" onClick={() => setShowTrailer(false)}>✕</button>
            <iframe
              className="trailer-iframe"
              src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1`}
              title="Fragman"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}