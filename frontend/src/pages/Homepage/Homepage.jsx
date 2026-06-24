import React, { useEffect, useState } from "react";
import { movieService } from "../../services/movieService";
import "./HomePage.css";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const MovieCard = ({ movie }) => (
  <div className="movie-card">
    <div className="movie-card__poster-wrap">
      <img
        className="movie-card__poster"
        src={
          movie.posterPath
            ? `${TMDB_IMAGE_BASE}${movie.posterPath}`
            : "/placeholder.png"
        }
        alt={movie.title}
        loading="lazy"
      />
      <div className="movie-card__overlay">
        <span className="movie-card__score">
          ★ {movie.voteAverage?.toFixed(1)}
        </span>
        <button className="movie-card__watchlist-btn">+ Liste</button>
      </div>
    </div>
    <div className="movie-card__info">
      <p className="movie-card__title">{movie.title}</p>
      <p className="movie-card__meta">
        {movie.releaseDate?.slice(0, 4)} · {movie.genres?.split(",")[0]}
      </p>
    </div>
  </div>
);

const Section = ({ title, badge, movies, loading }) => (
  <section className="home-section">
    <div className="home-section__header">
      <h2 className="home-section__title">{title}</h2>
      {badge && <span className="home-section__badge">{badge}</span>}
      <a className="home-section__see-all" href="#">
        Tümünü gör →
      </a>
    </div>
    <div className="movie-row">
      {loading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="movie-card movie-card--skeleton" />
          ))
        : movies.map((m) => <MovieCard key={m.id} movie={m} />)}
    </div>
  </section>
);

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [pop, top, trend] = await Promise.all([
          movieService.getPopular(),
          movieService.getTopRated(),
          movieService.getTrending(),
        ]);
        setPopular(pop);
        setTopRated(top);
        setTrending(trend);
      } catch (err) {
        console.error("Film verileri yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="home-root">
      {/* NAV */}
      <nav className="navbar">
        <span className="navbar__logo">
          next<span className="navbar__logo--accent">movie</span>
        </span>
        <form className="navbar__search" onSubmit={handleSearch}>
          <span className="navbar__search-icon">⌕</span>
          <input
            className="navbar__search-input"
            type="text"
            placeholder="Film ara veya tanımla…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <div className="navbar__user">
          {user ? (
            <>
              <span className="navbar__username">
                Merhaba, <strong>{user.name || user.username}</strong>
              </span>
              <div className="navbar__avatar">
                {(user.name || user.username || "?")[0].toUpperCase()}
              </div>
            </>
          ) : (
            <a className="navbar__login-btn" href="/login">
              Giriş yap
            </a>
          )}
        </div>
      </nav>

      {/* HERO */}
      {trending[0] && (
        <div
          className="hero"
          style={{
            backgroundImage: `url(${TMDB_IMAGE_BASE}${trending[0].posterPath})`,
          }}
        >
          <div className="hero__gradient" />
          <div className="hero__content">
            <span className="hero__eyebrow">Bu hafta öne çıkan</span>
            <h1 className="hero__title">{trending[0].title}</h1>
            <p className="hero__overview">
              {trending[0].overview?.slice(0, 160)}…
            </p>
            <div className="hero__actions">
              <button className="hero__btn hero__btn--primary">
                ▶ İzle
              </button>
              <button className="hero__btn hero__btn--secondary">
                + Listeye ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="home-main">
        <Section
          title="Popüler Filmler"
          badge="Bu hafta"
          movies={popular}
          loading={loading}
        />
        <Section
          title="En Yüksek Puanlılar"
          movies={topRated}
          loading={loading}
        />
        <Section
          title="Trend"
          badge="🔥"
          movies={trending}
          loading={loading}
        />
      </main>
    </div>
  );
}