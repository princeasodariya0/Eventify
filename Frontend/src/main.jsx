import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import axios from "axios";

import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";

import "react-toastify/dist/ReactToastify.css";
import "./index.css";

axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <App />
      <ToastContainer
        position="top-left"
        autoClose={3000}
        hideProgressBar={false}
      />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);