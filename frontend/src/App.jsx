import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login        from "./pages/Login/Login";
import HomePage     from "./pages/HomePage/HomePage";
import MovieDetailPage from "./pages/MovieDetailPage/MovieDetailPage";
import SettingsPage from "./pages/SettingsPage/SettingsPage";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [theme, setTheme] = useState("dark");
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/"        element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/movie/:id" element={<PrivateRoute><MovieDetailPage /></PrivateRoute>} />
        <Route path="/settings"  element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}