import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: "Arial, sans-serif", padding: 20 }}>
        <nav style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <Link to="/">Login</Link>
          <Link to="/users">Usuarios</Link>
          <Link to="/profile">Mi Perfil</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/users" element={<Users />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
