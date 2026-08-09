import api from "./authService";

export const movieService = {
  getPopular:      () => api.get("/movies/popular").then(r => r.data),
  getTopRated:     () => api.get("/movies/top-rated").then(r => r.data),
  getTrending:     () => api.get("/movies/trending").then(r => r.data),
  searchByTitle:   (q) => api.get("/movies/search", { params: { q } }).then(r => r.data),
  getDetail:       (id) => api.get(`/movies/${id}`).then(r => r.data),
  getSimilar:      (movieId, topK = 10) =>
    api.get(`/recommendations/similar/${movieId}`, { params: { topK } }).then(r => r.data),

  // Modül 3 — Doğal dil semantic arama
  semanticSearch:  (q) => api.get("/search/semantic", { params: { q } }).then(r => r.data),

  toggleLike:      (movieId) => api.post(`/likes/${movieId}/toggle`).then(r => r.data),
  toggleWatchlist: (movieId) => api.post(`/watchlist/${movieId}/toggle`).then(r => r.data),
  getWatchlist:    () => api.get("/watchlist").then(r => r.data),
};

export const profileService = {
  getProfile:    () => api.get("/profile").then(r => r.data),
  updateProfile: (data) => api.put("/profile", data).then(r => r.data),
  uploadPicture: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/profile/picture", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
};

export const friendService = {
  getFriends:  () => api.get("/friends").then(r => r.data),
  getPending:  () => api.get("/friends/pending").then(r => r.data),
  sendRequest: (username) =>
    api.post("/friends/request", null, { params: { username } }).then(r => r.data),
  respond: (friendshipId, accept) =>
    api.post(`/friends/respond/${friendshipId}`, null, { params: { accept } }).then(r => r.data),
};