import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { friendService } from "../../services/friendService";
import{ profileService}  from "../../services/profileService";
import "./SettingsPage.css";

const TABS = ["Profil", "Arkadaşlar", "İstekler"];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [tab, setTab]             = useState("Profil");
  const [profile, setProfile]     = useState(null);
  const [friends, setFriends]     = useState([]);
  const [pending, setPending]     = useState([]);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState("");
  const [searchUser, setSearchUser] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    profileService.getProfile().then(setProfile).catch(console.error);
    friendService.getFriends().then(setFriends).catch(console.error);
    friendService.getPending().then(setPending).catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true); setMsg("");
    try {
      await profileService.updateProfile({
        name:     profile.name,
        lastname: profile.lastname,
        username: profile.username,
      });
      // localStorage güncelle
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...stored,
        name:     profile.name,
        username: profile.username,
      }));
      setMsg("✓ Profil güncellendi.");
    } catch { setMsg("Hata oluştu."); }
    finally { setSaving(false); }
  };

  const handlePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await profileService.uploadPicture(file);
      setProfile(p => ({ ...p, profilePicture: res.url }));
      setMsg("✓ Profil resmi güncellendi.");
    } catch { setMsg("Resim yüklenemedi."); }
  };

  const handleRespond = async (friendshipId, accept) => {
    try {
      await friendService.respond(friendshipId, accept);
      setPending(p => p.filter(r => r.friendshipId !== friendshipId));
      if (accept) friendService.getFriends().then(setFriends);
    } catch (e) { console.error(e); }
  };

  const handleSendRequest = async () => {
    if (!searchUser.trim()) return;
    try {
      await friendService.sendRequest(searchUser);
      setMsg("✓ Arkadaşlık isteği gönderildi.");
      setSearchUser("");
    } catch { setMsg("İstek gönderilemedi. Kullanıcı ID'sini kontrol edin."); }
  };

  if (!profile) return (
    <div className="settings-loading">
      <div className="settings-spinner" />
    </div>
  );

  const initials = (profile.name || profile.username || "?")[0].toUpperCase();
  const picUrl   = profile.profilePicture
    ? `http://localhost:8080${profile.profilePicture}`
    : null;

  return (
    <div className="settings-root">
      <nav className="settings-nav">
        <button className="settings-nav__back" onClick={() => navigate("/")}>← Ana Sayfa</button>
        <span className="settings-nav__logo" onClick={() => navigate("/")}>
          next<span>movie</span>
        </span>
      </nav>

      <div className="settings-shell">
        {/* Sidebar */}
        <aside className="settings-sidebar">
          <div className="settings-avatar-wrap">
            <div className="settings-avatar" onClick={() => fileRef.current.click()}>
              {picUrl
                ? <img src={picUrl} alt="Profil" />
                : <span>{initials}</span>}
              <div className="settings-avatar__overlay">📷</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePicture} />
            <p className="settings-avatar__name">{profile.name || profile.username}</p>
            <p className="settings-avatar__sub">@{profile.username}</p>
          </div>

          <nav className="settings-tabs">
            {TABS.map(t => (
              <button
                key={t}
                className={`settings-tab ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "Profil"      && "👤 "}
                {t === "Arkadaşlar" && "👥 "}
                {t === "İstekler"   && "📬 "}
                {t}
                {t === "İstekler" && pending.length > 0 && (
                  <span className="settings-tab__badge">{pending.length}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="settings-main">
          {msg && <div className="settings-msg">{msg}</div>}

          {/* PROFİL */}
          {tab === "Profil" && (
            <div className="settings-section">
              <h2 className="settings-section__title">Profil Bilgileri</h2>
              <div className="settings-field-grid">
                <div className="settings-field">
                  <label>Ad</label>
                  <input value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} />
                </div>
                <div className="settings-field">
                  <label>Soyad</label>
                  <input value={profile.lastname} onChange={e => setProfile(p => ({...p, lastname: e.target.value}))} />
                </div>
                <div className="settings-field settings-field--full">
                  <label>Kullanıcı Adı</label>
                  <input value={profile.username} onChange={e => setProfile(p => ({...p, username: e.target.value}))} />
                </div>
                <div className="settings-field settings-field--full">
                  <label>E-posta (değiştirilemez)</label>
                  <input value={profile.email} disabled />
                </div>
              </div>
              <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
              </button>

              <div className="settings-divider" />
              <h3 className="settings-section__subtitle">Profil Resmi</h3>
              <div className="settings-picture-row">
                <div className="settings-picture-preview">
                  {picUrl ? <img src={picUrl} alt="Profil" /> : <span>{initials}</span>}
                </div>
                <button className="settings-upload-btn" onClick={() => fileRef.current.click()}>
                  📷 Fotoğraf Yükle
                </button>
                <p className="settings-picture-hint">JPG veya PNG, max 5MB</p>
              </div>
            </div>
          )}

          {/* ARKADAŞLAR */}
          {tab === "Arkadaşlar" && (
            <div className="settings-section">
              <h2 className="settings-section__title">Arkadaşlarım</h2>

              <div className="settings-friend-search">
                <input
                  placeholder="Kullanıcı adı ile arkadaş ekle (örn: mehmet)…"
                  value={searchUser}
                  onChange={e => setSearchUser(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendRequest()}
                />
                <button onClick={handleSendRequest}>İstek Gönder</button>
              </div>

              {friends.length === 0 ? (
                <p className="settings-empty">Henüz arkadaşın yok.</p>
              ) : (
                <div className="friends-list">
                  {friends.map(f => (
                    <div key={f.id} className="friend-card">
                      <div className="friend-card__avatar">
                        {f.profileImage
                          ? <img src={`http://localhost:8080${f.profileImage}`} alt={f.username} />
                          : <span>{(f.username || "?")[0].toUpperCase()}</span>}
                      </div>
                      <div className="friend-card__info">
                        <p className="friend-card__name">{f.name || f.username}</p>
                        <p className="friend-card__username">@{f.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* İSTEKLER */}
          {tab === "İstekler" && (
            <div className="settings-section">
              <h2 className="settings-section__title">Arkadaşlık İstekleri</h2>
              {pending.length === 0 ? (
                <p className="settings-empty">Bekleyen istek yok.</p>
              ) : (
                <div className="friends-list">
                  {pending.map(r => (
                    <div key={r.friendshipId} className="friend-card">
                      <div className="friend-card__avatar">
                        <span>{(r.username || "?")[0].toUpperCase()}</span>
                      </div>
                      <div className="friend-card__info">
                        <p className="friend-card__name">{r.name || r.username}</p>
                        <p className="friend-card__username">@{r.username}</p>
                      </div>
                      <div className="friend-card__actions">
                        <button className="friend-btn friend-btn--accept"
                          onClick={() => handleRespond(r.friendshipId, true)}>Kabul</button>
                        <button className="friend-btn friend-btn--reject"
                          onClick={() => handleRespond(r.friendshipId, false)}>Reddet</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}