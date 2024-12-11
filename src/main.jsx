import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { DarkModeProvider } from "./context/DarkModeContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <React.StrictMode>
      <BrowserRouter>
        <DarkModeProvider>
          <App />
        </DarkModeProvider>
      </BrowserRouter>
    </React.StrictMode>
  </AuthProvider>
);
