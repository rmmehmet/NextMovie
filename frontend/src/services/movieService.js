import api from "./authService";

export const movieService = {
  getPopular: () =>
    api.get("/movies/popular").then(r => r.data),

  getTopRated: () =>
    api.get("/movies/top-rated").then(r => r.data),

  getTrending: () =>
    api.get("/movies/trending").then(r => r.data),

  searchByTitle: (q) =>
    api.get("/movies/search", { params: { q } }).then(r => r.data),

  getDetail: (id) =>
    api.get(`/movies/${id}`).then(r => r.data),

  toggleLike: (movieId) =>
    api.post(`/likes/${movieId}/toggle`).then(r => r.data),

  toggleWatchlist: (movieId) =>
    api.post(`/watchlist/${movieId}/toggle`).then(r => r.data),

  getWatchlist: () =>
    api.get("/watchlist").then(r => r.data),
};
