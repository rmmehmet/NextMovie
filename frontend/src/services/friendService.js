import api from "./authService";

export const friendService = {
  getFriends:  () => api.get("/friends").then(r => r.data),
  getPending:  () => api.get("/friends/pending").then(r => r.data),
 
  // username ile istek gönder
  sendRequest: (username) =>
    api.post("/friends/request", null, { params: { username } }).then(r => r.data),
 
  respond: (friendshipId, accept) =>
    api.post(`/friends/respond/${friendshipId}`, null, { params: { accept } }).then(r => r.data),
};