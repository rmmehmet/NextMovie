import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { movieService } from "../services/movieService";
import "./MovieDetailPage.css";

const TMDB_IMG    = "https://image.tmdb.org/t/p/w500";
const TMDB_BACK   = "https://image.tmdb.org/t/p/w1280";
const TMDB_FACE   = "https://image.tmdb.org/t/p/w185";
const TMDB_PERSON = "https://www.themoviedb.org/person";

// ── Yıldız Rating ───────────────────────────────────────────
const StarRating = ({ movieId, initialScore }) => {
  const [hovered, setHovered]  = useState(0);
  const [selected, setSelected] = useState(initialScore || 0);
  const [saving, setSaving]    = useState(false);

  const handleRate = async (score) => {
    setSaving(true);
    try {
      await movieService.rateMovie(movieId, score);
      setSelected(score);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const display = hovered || selected;

  return (
    <div className="star-rating">
      <span className="star-rating__label">Puanın:</span>
      <div className="star-rating__stars">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            className={`star-rating__star ${n <= display ? "active" : ""}`}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleRate(n)}
            disabled={saving}
            title={`${n}/10`}
          >
            ★
          </button>
        ))}
      </div>
      {selected > 0 && (
        <span className="star-rating__value">{selected}/10</span>
      )}
    </div>
  );
};

const SimilarCard = ({ movie }) => {
  const navigate = useNavigate();
  return (
    <div className="similar-card" onClick={() => navigate(`/movie/${movie.id}`)}>
      <div className="similar-card__poster-wrap">
        <img
          className="similar-card__poster"
          src={movie.posterPath ? `${TMDB_IMG}${movie.posterPath}` : "/placeholder.png"}
          alt={movie.title} loading="lazy"
        />
        <div className="similar-card__overlay">
          <span className="similar-card__score">★ {movie.voteAverage?.toFixed(1)}</span>
        </div>
      </div>
      <div className="similar-card__info">
        <p className="similar-card__title">{movie.title}</p>
        <p className="similar-card__meta">{movie.releaseDate?.slice(0,4)} · {movie.genres?.split(",")[0]}</p>
      </div>
    </div>
  );
};

const CastCard = ({ member }) => (
  <a className="cast-card" href={`${TMDB_PERSON}/${member.personId}`}
    target="_blank" rel="noopener noreferrer">
    <div className="cast-card__photo-wrap">
      <img className="cast-card__photo" src={`${TMDB_FACE}${member.profilePath}`}
        alt={member.name} loading="lazy" />
    </div>
    <div className="cast-card__info">
      <p className="cast-card__name">{member.name}</p>
      <p className="cast-card__character">{member.character}</p>
    </div>
  </a>
);

export default function MovieDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [movie, setMovie]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [liked, setLiked]           = useState(false);
  const [inList, setInList]         = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [similar, setSimilar]       = useState([]);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setSimilar([]);
    setMovie(null);

    movieService.getDetail(id)
      .then(data => { setMovie(data); setLiked(data.liked); setInList(data.inWatchlist); })
      .catch(console.error)
      .finally(() => setLoading(false));

    setSimLoading(true);
    movieService.getSimilar(id)
      .then(setSimilar).catch(() => setSimilar([]))
      .finally(() => setSimLoading(false));
  }, [id]);

  const handleLike = async () => {
    try { const res = await movieService.toggleLike(movie.id); setLiked(res.liked); }
    catch (e) { console.error(e); }
  };

  const handleWatchlist = async () => {
    try { const res = await movieService.toggleWatchlist(movie.id); setInList(res.inWatchlist); }
    catch (e) { console.error(e); }
  };

  if (loading) return <div className="detail-loading"><div className="detail-loading__spinner" /></div>;
  if (!movie)  return <div className="detail-loading"><p>Film bulunamadı.</p></div>;

  const genres  = movie.genres?.split(",").map(g => g.trim()).filter(Boolean) || [];
  const year    = movie.releaseDate?.slice(0, 4);
  const runtime = movie.runtime ? `${Math.floor(movie.runtime/60)}s ${movie.runtime%60}dk` : null;

  return (
    <div className="detail-root">
      <div className="detail-backdrop">
        {movie.backdropPath
          ? <img src={`${TMDB_BACK}${movie.backdropPath}`} alt="" />
          : <div className="detail-backdrop__placeholder" />}
        <div className="detail-backdrop__overlay" />
      </div>

      <nav className="detail-nav">
        <button className="detail-nav__back" onClick={() => navigate(-1)}>← Geri</button>
        <span className="detail-nav__logo" onClick={() => navigate("/")}>next<span>movie</span></span>
      </nav>

      <div className="detail-content">
        <div className="detail-poster-wrap">
          <img className="detail-poster"
            src={movie.posterPath ? `${TMDB_IMG}${movie.posterPath}` : "/placeholder.png"}
            alt={movie.title} />
          {movie.trailerKey && (
            <button className="detail-play-btn" onClick={() => setShowTrailer(true)}>▶ Fragmanı İzle</button>
          )}
        </div>

        <div className="detail-info">
          <div className="detail-genres">
            {genres.map(g => <span key={g} className="detail-genre-tag">{g}</span>)}
          </div>
          <h1 className="detail-title">{movie.title}</h1>
          <div className="detail-meta">
            {year    && <span>{year}</span>}
            {runtime && <><span className="detail-meta__dot">·</span><span>{runtime}</span></>}
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

          {/* RATING */}
          <StarRating movieId={movie.id} initialScore={movie.userScore} />

          <div className="detail-actions">
            <button className={`detail-action-btn ${liked ? "active-like" : ""}`} onClick={handleLike}>
              {liked ? "❤️ Beğenildi" : "🤍 Beğen"}
            </button>
            <button className={`detail-action-btn ${inList ? "active-list" : ""}`} onClick={handleWatchlist}>
              {inList ? "✓ Listede" : "+ Listeye Ekle"}
            </button>
            {movie.trailerKey && (
              <button className="detail-action-btn detail-action-btn--trailer"
                onClick={() => setShowTrailer(true)}>▶ Fragman</button>
            )}
          </div>
        </div>
      </div>

      {/* OYUNCULAR */}
      {movie.cast && movie.cast.length > 0 && (
        <div className="cast-section">
          <div className="cast-section__header">
            <h2 className="cast-section__title">Oyuncular</h2>
            <span className="cast-section__count">{movie.cast.length} oyuncu</span>
          </div>
          <div className="cast-row">
            {movie.cast.map(member => <CastCard key={member.personId} member={member} />)}
          </div>
        </div>
      )}

      {/* BENZERLİK */}
      <div className="similar-section">
        <div className="similar-section__header">
          <h2 className="similar-section__title">Benzer Filmler</h2>
          <span className="similar-section__badge">AI Önerisi</span>
        </div>
        {simLoading ? (
          <div className="similar-row">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="similar-card similar-card--skeleton" />
            ))}
          </div>
        ) : similar.length === 0 ? (
          <p className="similar-empty">Benzer film bulunamadı.</p>
        ) : (
          <div className="similar-row">
            {similar.map(m => <SimilarCard key={m.id} movie={m} />)}
          </div>
        )}
      </div>

      {/* TRAILER */}
      {showTrailer && movie.trailerKey && (
        <div className="trailer-overlay" onClick={() => setShowTrailer(false)}>
          <div className="trailer-modal" onClick={e => e.stopPropagation()}>
            <button className="trailer-close" onClick={() => setShowTrailer(false)}>✕</button>
            <iframe className="trailer-iframe"
              src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1`}
              title="Fragman" allow="autoplay; encrypted-media" allowFullScreen />
          </div>
        </div>
      )}
    </div>
  );
}