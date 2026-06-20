import { useState, useEffect } from "react";
import "./Login.css";

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [theme, setTheme] = useState("dark");

  const isLight = theme === "light";

  // FIX: body arka planını tema ile senkronize et
  // body:has() CSS'i desteklemeyen eski tarayıcılar için JS fallback
  useEffect(() => {
    document.body.style.background = isLight ? "#f3f2ef" : "#07070e";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, [isLight]);

  // Sayfa kapanınca temizle
  useEffect(() => {
    return () => {
      document.body.style.background = "";
    };
  }, []);

  return (
    <div className={`auth-page ${isLight ? "light" : "dark"}`}>
      <aside className="auth-left">
        <div className="left-inner">
          <div className="brand">
            <div className="brand-icon">
              <FilmIcon />
            </div>
            <span className="brand-name">
              Next<em>Movie</em>
            </span>
          </div>

          <div className="hero">
            <span className="hero-badge">
              <SparkIcon /> AI-powered discovery
            </span>
            <h1 className="hero-title">
              Find films<br />
              you'll <span className="accent">truly love</span>
            </h1>
            <p className="hero-sub">
              Personalised recommendations that learn your taste — not just another algorithm.
            </p>

            <ul className="feature-list">
              <li>
                <div className="feature-icon"><BrainIcon /></div>
                <span>Smart picks that get better over time</span>
              </li>
              <li>
                <div className="feature-icon"><HeartIcon /></div>
                <span>Build watchlists across any genre</span>
              </li>
              <li>
                <div className="feature-icon"><StarIcon /></div>
                <span>Rate, review and track what you've seen</span>
              </li>
            </ul>
          </div>

          <div className="poster-strip">
            <div className="poster p1"><FilmIcon size={20} /></div>
            <div className="poster p2"><TvIcon size={20} /></div>
            <div className="poster p3"><TelescopeIcon size={20} /></div>
          </div>

          <p className="left-footer">© 2026 NextMovie · All rights reserved.</p>
        </div>
      </aside>

      <main className="auth-right">
        <button
          className="theme-toggle"
          onClick={() => setTheme(isLight ? "dark" : "light")}
        >
          {isLight ? <MoonIcon /> : <SunIcon />}
          {isLight ? "Dark mode" : "Light mode"}
        </button>

        <div className="form-shell">
          <div className="tabs">
            <button
              className={`tab-btn ${tab === "login" ? "active" : ""}`}
              onClick={() => setTab("login")}
            >
              Sign in
            </button>
            <button
              className={`tab-btn ${tab === "register" ? "active" : ""}`}
              onClick={() => setTab("register")}
            >
              Register
            </button>
          </div>

          {tab === "login" ? (
            <LoginForm onSwitch={() => setTab("register")} />
          ) : (
            <RegisterForm onSwitch={() => setTab("login")} />
          )}
        </div>
      </main>
    </div>
  );
}

function LoginForm({ onSwitch }) {
  return (
    <div className="form-body">
      <div className="form-header">
        <h2>Welcome back</h2>
        <p>Sign in to your NextMovie account</p>
      </div>

      <div className="field">
        <label>Email</label>
        <div className="input-wrap">
          <MailIcon className="input-icon" />
          <input type="email" placeholder="you@example.com" />
        </div>
      </div>

      <div className="field">
        <label>Password</label>
        <div className="input-wrap">
          <LockIcon className="input-icon" />
          <input type="password" placeholder="••••••••" />
        </div>
      </div>

      <div className="forgot-row">
        <a href="#">Forgot password?</a>
      </div>

      <button className="cta-btn">
        <LoginIcon /> Sign in
      </button>

      <Divider label="or continue with" />

      <div className="social-row">
        <button className="social-btn"><GoogleIcon /> Google</button>
        <button className="social-btn"><GitHubIcon /> GitHub</button>
      </div>

      <p className="switch-line">
        No account?{" "}
        <button className="link-btn" onClick={onSwitch}>
          Create one free
        </button>
      </p>
    </div>
  );
}

function RegisterForm({ onSwitch }) {
  return (
    <div className="form-body">
      <div className="form-header">
        <h2>Create account</h2>
        <p>Join NextMovie and start discovering</p>
      </div>

      <div className="field-row">
        <div className="field">
          <label>First name</label>
          <div className="input-wrap">
            <UserIcon className="input-icon" />
            <input type="text" placeholder="Mehmet" />
          </div>
        </div>
        <div className="field">
          <label>Last name</label>
          <div className="input-wrap">
            <UserIcon className="input-icon" />
            <input type="text" placeholder="Yılmaz" />
          </div>
        </div>
      </div>

      <div className="field">
        <label>Email</label>
        <div className="input-wrap">
          <MailIcon className="input-icon" />
          <input type="email" placeholder="you@example.com" />
        </div>
      </div>

      <div className="field">
        <label>Password</label>
        <div className="input-wrap">
          <LockIcon className="input-icon" />
          <input type="password" placeholder="Min. 8 characters" />
        </div>
      </div>

      <button className="cta-btn" style={{ marginTop: "4px" }}>
        <UserPlusIcon /> Create account
      </button>

      <Divider label="or sign up with" />

      <div className="social-row">
        <button className="social-btn"><GoogleIcon /> Google</button>
        <button className="social-btn"><GitHubIcon /> GitHub</button>
      </div>

      <p className="switch-line">
        Already have an account?{" "}
        <button className="link-btn" onClick={onSwitch}>
          Sign in
        </button>
      </p>
    </div>
  );
}

function Divider({ label }) {
  return (
    <div className="divider">
      <span className="divider-line" />
      <span className="divider-label">{label}</span>
      <span className="divider-line" />
    </div>
  );
}

/* ── Inline SVG icons (no external deps) ── */
const S = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">{children}</svg>
);

const FilmIcon = ({ size }) => <S size={size}><rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5"/></S>;
const SparkIcon = () => <S size={13}><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></S>;
const BrainIcon = () => <S size={15}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2z"/></S>;
const HeartIcon = () => <S size={15}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></S>;
const StarIcon = () => <S size={15}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></S>;
const TvIcon = ({ size }) => <S size={size}><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 2l-5 5-5-5"/></S>;
const TelescopeIcon = ({ size }) => <S size={size}><path d="M10 16v5M14 16v5M12 4L3 9l9 5 9-5-9-5z"/><path d="M3 9v7l9 5 9-7V9"/></S>;
const SunIcon = () => <S size={14}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></S>;
const MoonIcon = () => <S size={14}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></S>;
const MailIcon = () => <S size={15}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></S>;
const LockIcon = () => <S size={15}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></S>;
const UserIcon = () => <S size={15}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></S>;
const LoginIcon = () => <S size={16}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></S>;
const UserPlusIcon = () => <S size={16}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></S>;

const GoogleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);