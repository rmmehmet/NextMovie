import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

// LOGIN
export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return res.data;
};

// REGISTER
export const register = async (name, lastname, email, password, username) => {
  const res = await axios.post(`${API_URL}/register`, {
    name,
    lastname,
    email,
    password,
    username,
  });
  return res.data;
};