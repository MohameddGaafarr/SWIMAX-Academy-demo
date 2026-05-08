import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { DemoDataProvider } from "./context/DemoDataContext.jsx";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DemoDataProvider>
          <App />
        </DemoDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
