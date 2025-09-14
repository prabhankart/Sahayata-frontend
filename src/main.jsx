import "./i18n"; // ✅ initialize global i18n once BEFORE rendering

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import GlobalTranslator from "./components/GlobalTranslator.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalTranslator>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GlobalTranslator>
  </React.StrictMode>
);
