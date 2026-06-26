import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { movieService } from "../../services/movieService";
import "./HomePage.css";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const GENRES = ["Tümü","Action","Adventure","Animation","Comedy","Crime",
  "Documentary","Drama","Family","Fantasy","History","Horror",
  "Music","Mystery","Romance","Science Fiction","Thriller","War","Western"];

const MODULE_TABS = [
  { id: "discover",  label: "🎬 Keşfet" },
  { id: "foryou",    label: "✨ Sana Özel" },
  { id: "cinematic", label: "🏆 Sinema Klasikleri" },
];

const MovieCard = ({ movie, onLike, likedIds }) => {
  const navigate = useNavigate();
  const liked = likedIds.has(movie.id);

  const handleLike = async (e) => {
    e.stopPropagation();
    onLike(movie.id);
  };

  return (
    <div className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
      <div className="movie-card__poster-wrap">
        <img
          className="movie-card__poster"
          src={movie.posterPath ? `${TMDB_IMAGE_BASE}${movie.posterPath}` : "/placeholder.png"}
          alt={movie.title}
          loading="lazy"
        />
        <div className="movie-card__overlay">
          <span className="movie-card__score">★ {movie.voteAverage?.toFixed(1)}</span>
          <button
            className={`movie-card__like-btn ${liked ? "liked" : ""}`}
            onClick={handleLike}
          >
            {liked ? "❤️" : "🤍"}
          </button>
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
};

const Section = ({ title, badge, movies, loading, onLike, likedIds }) => (
  <section className="home-section">
    <div className="home-section__header">
      <h2 className="home-section__title">{title}</h2>
      {badge && <span className="home-section__badge">{badge}</span>}
      <a className="home-section__see-all" href="#">Tümünü gör →</a>
    </div>
    <div className="movie-row">
      {loading
        ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="movie-card movie-card--skeleton" />
          ))
        : movies.map((m) => (
            <MovieCard key={m.id} movie={m} onLike={onLike} likedIds={likedIds} />
          ))}
    </div>
  </section>
);

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser]           = useState(null);
  const [popular, setPopular]     = useState([]);
  const [topRated, setTopRated]   = useState([]);
  const [trending, setTrending]   = useState([]);
  const [byGenre, setByGenre]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [likedIds, setLikedIds]   = useState(new Set());

  const [searchQuery, setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown]   = useState(false);
  const searchRef  = useRef(null);
  const debounceRef = useRef(null);

  const [activeTab, setActiveTab]   = useState("discover");
  const [activeGenre, setActiveGenre] = useState("Tümü");
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

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

  useEffect(() => {
    if (activeGenre === "Tümü") { setByGenre([]); return; }
    const all = [...popular, ...topRated, ...trending];
    const seen = new Set();
    const filtered = all.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return m.genres?.includes(activeGenre);
    });
    setByGenre(filtered);
  }, [activeGenre, popular, topRated, trending]);

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); setShowDropdown(false); return; }
    setShowDropdown(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await movieService.searchByTitle(q);
        setSearchResults(results.slice(0, 8));
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 300);
  };

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowDropdown(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLike = async (movieId) => {
    try {
      const res = await movieService.toggleLike(movieId);
      setLikedIds(prev => {
        const next = new Set(prev);
        res.liked ? next.add(movieId) : next.delete(movieId);
        return next;
      });
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const initials = user ? ((user.username || user.name || "?")[0]).toUpperCase() : "?";
  const picUrl = user?.profilePicture ? `http://localhost:8080${user.profilePicture}` : null;

  const tabContent = () => {
    if (activeTab === "foryou") return (
      <div className="foryou-placeholder">
        <div className="foryou-icon">✨</div>
        <h3>Kişisel Öneriler Yakında</h3>
        <p>İzlediğin filmler ve arkadaşlarının aktivitelerine göre<br/>sana özel öneriler burada görünecek.</p>
      </div>
    );

    if (activeTab === "cinematic") return (
      <div className="foryou-placeholder">
        <div className="foryou-icon">🏆</div>
        <h3>Sinema Klasikleri Yakında</h3>
        <p>En yüksek puanlı klasik filmler burada listelenecek.</p>
      </div>
    );

    return (
      <>
        <div className="genre-bar">
          {GENRES.map((g) => (
            <button key={g} className={`genre-pill ${activeGenre === g ? "active" : ""}`}
              onClick={() => setActiveGenre(g)}>{g}</button>
          ))}
        </div>
        {activeGenre !== "Tümü" ? (
          <Section title={`${activeGenre} Filmleri`} movies={byGenre}
            loading={loading} onLike={handleLike} likedIds={likedIds} />
        ) : (
          <>
            <Section title="Bu Hafta Popüler" badge="🔥" movies={popular}
              loading={loading} onLike={handleLike} likedIds={likedIds} />
            <Section title="En Yüksek Puanlılar" badge="⭐" movies={topRated}
              loading={loading} onLike={handleLike} likedIds={likedIds} />
            <Section title="Trend" movies={trending}
              loading={loading} onLike={handleLike} likedIds={likedIds} />
          </>
        )}
      </>
    );
  };

  return (
    <div className="home-root">
      <nav className="navbar">
        <span className="navbar__logo" onClick={() => navigate("/")}>
          next<span className="navbar__logo--accent">movie</span>
        </span>

        <div className="navbar__search" ref={searchRef}>
          <span className="navbar__search-icon">⌕</span>
          <input className="navbar__search-input" type="text" placeholder="Film ara…"
            value={searchQuery} onChange={handleSearchChange}
            onFocus={() => searchQuery && setShowDropdown(true)} />
          {showDropdown && (
            <div className="search-dropdown">
              {searchLoading ? (
                <div className="search-dropdown__loading">Aranıyor…</div>
              ) : searchResults.length === 0 ? (
                <div className="search-dropdown__empty">Sonuç bulunamadı</div>
              ) : searchResults.map((m) => (
                <div key={m.id} className="search-dropdown__item"
                  onClick={() => { navigate(`/movie/${m.id}`); setShowDropdown(false); setSearchQuery(""); }}>
                  <img className="search-dropdown__poster"
                    src={m.posterPath ? `${TMDB_IMAGE_BASE}${m.posterPath}` : "/placeholder.png"}
                    alt={m.title} />
                  <div className="search-dropdown__info">
                    <span className="search-dropdown__title">{m.title}</span>
                    <span className="search-dropdown__meta">{m.releaseDate?.slice(0,4)} · {m.genres?.split(",")[0]}</span>
                  </div>
                  <span className="search-dropdown__score">★ {m.voteAverage?.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="navbar__user" ref={profileRef}>
          {user ? (
            <>
              <div className="navbar__profile" onClick={() => setShowProfile(!showProfile)}>
                <div className="navbar__avatar">
                  {picUrl ? <img src={picUrl} alt="profil" /> : initials}
                </div>
                <div className="navbar__userinfo">
                  <span className="navbar__display-name">{user.name || user.username}</span>
                  <span className="navbar__username-sub">@{user.username}</span>
                </div>
                <span className="navbar__chevron">{showProfile ? "▲" : "▼"}</span>
              </div>
              {showProfile && (
                <div className="profile-menu">
                  <div className="profile-menu__header">
                    <div className="profile-menu__avatar">
                      {picUrl ? <img src={picUrl} alt="profil" /> : initials}
                    </div>
                    <div>
                      <p className="profile-menu__name">{user.name || user.username}</p>
                      <p className="profile-menu__email">{user.email}</p>
                    </div>
                  </div>
                  <div className="profile-menu__divider" />
                  <button className="profile-menu__item" onClick={() => navigate("/settings")}>⚙️ Ayarlar & Profil</button>
                  <button className="profile-menu__item" onClick={() => navigate("/watchlist")}>🎬 İzleme Listem</button>
                  <div className="profile-menu__divider" />
                  <button className="profile-menu__item profile-menu__item--danger" onClick={handleLogout}>
                    🚪 Çıkış Yap
                  </button>
                </div>
              )}
            </>
          ) : (
            <a className="navbar__login-btn" href="/login">Giriş yap</a>
          )}
        </div>
      </nav>

      {trending[0] && (
        <div className="hero" style={{ backgroundImage: `url(${TMDB_IMAGE_BASE}${trending[0].posterPath})` }}>
          <div className="hero__gradient" />
          <div className="hero__content">
            <span className="hero__eyebrow">Bu hafta öne çıkan</span>
            <h1 className="hero__title">{trending[0].title}</h1>
            <p className="hero__overview">{trending[0].overview?.slice(0, 160)}…</p>
            <div className="hero__actions">
              <button className="hero__btn hero__btn--primary"
                onClick={() => navigate(`/movie/${trending[0].id}`)}>▶ Detaylar</button>
              <button className="hero__btn hero__btn--secondary">+ Listeye ekle</button>
            </div>
          </div>
        </div>
      )}

      <div className="module-tabs">
        {MODULE_TABS.map((t) => (
          <button key={t.id} className={`module-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <main className="home-main">{tabContent()}</main>
    </div>
  );
}