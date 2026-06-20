import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// global reset / base styles (istersen sonra ayırırız)
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);