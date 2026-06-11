import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import { Home } from "./pages/HomePage";
import { Login } from "./pages/LoginPage";
import { Signup } from "./pages/SignupPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute, GuestRoute } from "./components/Routes";

function Header() {
  return (
    <h1 className="text-2xl font-bold">Workout App</h1>
  )
}

function Navbar() {
  const { user, logout } = useAuth();
  
  return (
    <nav>
      <ul className="flex gap-6">
        <li><Link to="/">Home</Link></li>
        {user && (
          <li>
            <button onClick={logout}>Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <section className="min-h-screen p-1 bg-neutral-600">
          <section className="flex items-center justify-between bg-gray-900 text-white px-6 py-4">
            <Header />
            <Navbar />
          </section>

          <section id="divider" className="mb-5" />

          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/login" element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            } />
            <Route path="/signup" element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            } />
          </Routes>
        </section>
      </AuthProvider>
    </BrowserRouter>
  );
}