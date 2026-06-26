import api from "./authService";

export const profileService = {
  getProfile: () =>
    api.get("/profile").then(r => r.data),

  updateProfile: (data) =>
    api.put("/profile", data).then(r => r.data),

  uploadPicture: (file) => {
    const form = new FormData();
    form.append("file", file);

    return api.post("/profile/picture", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
};