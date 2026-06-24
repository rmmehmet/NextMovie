import { useState } from "react";
import { login, register } from "../../services/authService";
import "./Login.css";

/* ── SVG Icon helpers ── */
const Icon = ({ children, size = 16 }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" style={{ display: "block", flexShrink: 0 }}
  >
    {children}
  </svg>
);

const MailIcon    = () => <Icon size={15}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Icon>;
const LockIcon    = () => <Icon size={15}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Icon>;
const UserIcon    = () => <Icon size={15}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>;
const AtIcon      = () => <Icon size={15}><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></Icon>;
const LoginIcon   = () => <Icon size={15}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></Icon>;
const UserPlusIcon= () => <Icon size={15}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></Icon>;
const SunIcon     = () => <Icon size={13}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></Icon>;
const MoonIcon    = () => <Icon size={13}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Icon>;

const GoogleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* ── Shared sub-components ── */
function Field({ label, icon, type = "text", placeholder, value, onChange }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="input-wrap">
        <span className="input-icon">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
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

function GoogleBtn({ label }) {
  return (
    <button className="social-btn google-btn" type="button">
      <GoogleIcon />
      {label}
    </button>
  );
}

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return <p className="error-msg">{msg}</p>;
}

/* ══════════════════════════════════════════
   AUTH PAGE
══════════════════════════════════════════ */
export default function AuthPage() {
  const [tab, setTab]     = useState("login");
  const [theme, setTheme] = useState("dark");
  const isLight = theme === "light";

  return (
    <div className={`auth-page ${isLight ? "light" : "dark"}`}>

      {/* ── LEFT PANEL ── */}
      <aside className="auth-left">
        <div className="left-inner">

          <div className="brand">
            <div className="brand-icon">🎬</div>
            <span className="brand-name">Next<em>Movie</em></span>
          </div>

          <div className="hero">
            <span className="hero-badge">✦ AI-powered discovery</span>
            <h1 className="hero-title">
              Find films<br />you'll <span className="accent">truly love</span>
            </h1>
            <p className="hero-sub">
              Personalised recommendations that learn your taste — not just another algorithm.
            </p>

            <ul className="feature-list">
              <li><div className="feature-icon">🧠</div><span>Smart picks that get better over time</span></li>
              <li><div className="feature-icon">♡</div><span>Build watchlists across any genre</span></li>
              <li><div className="feature-icon">★</div><span>Rate, review and track what you've seen</span></li>
            </ul>
          </div>

          <div className="poster-strip">
            <div className="poster p1">🎬</div>
            <div className="poster p2">📺</div>
            <div className="poster p3">🔭</div>
          </div>

          <p className="left-footer">© 2025 NextMovie · All rights reserved.</p>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
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

          {tab === "login"
            ? <LoginForm onSwitch={() => setTab("register")} />
            : <RegisterForm onSwitch={() => setTab("login")} />
          }
        </div>
      </main>
    </div>
  );
}

/* ══════════════════════════════════════════
   LOGIN FORM
══════════════════════════════════════════ */
function LoginForm({ onSwitch }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

const handleLogin = async () => {
  setLoading(true);
  setError("");
  try {
    const res = await login(email, password);
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify({
      email: res.email,
      username: res.username,
      name: res.name,
    }));
    window.location.href = "/";
  } catch (err) {
    setError("Login failed. Check your email or password.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="form-body">
      <div className="form-header">
        <h2>Welcome back</h2>
        <p>Sign in to your NextMovie account</p>
      </div>

      {/* Google — tek satır, tam genişlik */}
      <GoogleBtn label="Continue with Google" />

      <Divider label="or sign in with email" />

      <Field
        label="Email"
        icon={<MailIcon />}
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <Field
        label="Password"
        icon={<LockIcon />}
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <div className="forgot-row">
        <a href="#">Forgot password?</a>
      </div>

      <ErrorMsg msg={error} />

      <button className="cta-btn" onClick={handleLogin} disabled={loading}>
        {loading ? <span className="spinner" /> : <LoginIcon />}
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p className="switch-line">
        No account?{" "}
        <button className="link-btn" onClick={onSwitch}>Create one free</button>
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════
   REGISTER FORM
══════════════════════════════════════════ */
function RegisterForm({ onSwitch }) {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [username,  setUsername]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      await register(firstName, lastName, email, password, username);
      onSwitch();
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-body">
      <div className="form-header">
        <h2>Create account</h2>
        <p>Join NextMovie and start discovering</p>
      </div>

      {/* Google — tek satır, tam genişlik */}
      <GoogleBtn label="Sign up with Google" />

      <Divider label="or register with email" />

      {/* First + Last name yan yana */}
      <div className="field-row">
        <Field
          label="First name"
          icon={<UserIcon />}
          placeholder="Mehmet"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
        />
        <Field
          label="Last name"
          icon={<UserIcon />}
          placeholder="Yılmaz"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
        />
      </div>

      {/* Username — tam genişlik */}
      <Field
        label="Username"
        icon={<AtIcon />}
        placeholder="nextmovie_user"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />

      {/* Email — tam genişlik */}
      <Field
        label="Email"
        icon={<MailIcon />}
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      {/* Password — tam genişlik */}
      <Field
        label="Password"
        icon={<LockIcon />}
        type="password"
        placeholder="Min. 8 characters"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <ErrorMsg msg={error} />

      <button className="cta-btn" onClick={handleRegister} disabled={loading} style={{ marginTop: "4px" }}>
        {loading ? <span className="spinner" /> : <UserPlusIcon />}
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="switch-line">
        Already have an account?{" "}
        <button className="link-btn" onClick={onSwitch}>Sign in</button>
      </p>
    </div>
  );
}