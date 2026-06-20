import { useState } from "react";
import Login from "./pages/Login/Login";

export default function App() {
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Login theme={theme} toggleTheme={toggleTheme} />
  );
}