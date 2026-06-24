import api from "./authService";

export const movieService = {
  getPopular:  () => api.get("/movies/popular").then((r) => r.data),
  getTopRated: () => api.get("/movies/top-rated").then((r) => r.data),
  getTrending: () => api.get("/movies/trending").then((r) => r.data),
};