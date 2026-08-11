import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { movieService } from "../../services/movieService";
import "./WatchlistPage.css";

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

export default function WatchlistPage() {
  const navigate = useNavigate();
  const [movies, setMovies]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    movieService.getWatchlist()
      .then(setMovies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (movieId) => {
    try {
      await movieService.toggleWatchlist(movieId);
      setMovies(prev => prev.filter(m => m.id !== movieId));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="watchlist-root">
      <nav className="watchlist-nav">
        <button className="watchlist-nav__back" onClick={() => navigate("/")}>← Ana Sayfa</button>
        <span className="watchlist-nav__logo" onClick={() => navigate("/")}>
          next<span>movie</span>
        </span>
      </nav>

      <div className="watchlist-content">
        <div className="watchlist-header">
          <h1 className="watchlist-title">🎬 İzleme Listem</h1>
          {!loading && (
            <span className="watchlist-count">{movies.length} film</span>
          )}
        </div>

        {loading ? (
          <div className="watchlist-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="wl-card wl-card--skeleton" />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="watchlist-empty">
            <p className="watchlist-empty__icon">🎞️</p>
            <h3>Listeniz boş</h3>
            <p>Film detay sayfasından filmleri listeye ekleyebilirsin.</p>
            <button className="watchlist-empty__btn" onClick={() => navigate("/")}>
              Film Keşfet
            </button>
          </div>
        ) : (
          <div className="watchlist-grid">
            {movies.map(m => (
              <div key={m.id} className="wl-card" onClick={() => navigate(`/movie/${m.id}`)}>
                <div className="wl-card__poster-wrap">
                  <img
                    className="wl-card__poster"
                    src={m.posterPath ? `${TMDB_IMG}${m.posterPath}` : "/placeholder.png"}
                    alt={m.title}
                    loading="lazy"
                  />
                  <div className="wl-card__overlay">
                    <span className="wl-card__score">★ {m.voteAverage?.toFixed(1)}</span>
                    <button
                      className="wl-card__remove"
                      onClick={e => { e.stopPropagation(); handleRemove(m.id); }}
                    >
                      ✕ Kaldır
                    </button>
                  </div>
                </div>
                <div className="wl-card__info">
                  <p className="wl-card__title">{m.title}</p>
                  <p className="wl-card__meta">
                    {m.releaseDate?.slice(0, 4)} · {m.genres?.split(",")[0]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}