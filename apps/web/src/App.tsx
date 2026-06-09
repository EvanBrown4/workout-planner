import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import { Home } from "./pages/HomePage";

function Header() {
  return (
    <h1 className="text-2xl font-bold">Workout App</h1>
  )
}

function Navbar() {
  return (
    <nav>
      <ul className="flex gap-6">
        <li>
          <Link to="/">Home</Link>
        </li>
        {/* <li>
          <Link to="/recipes">Recipes</Link>
        </li> */}
      </ul>
    </nav>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <section className="min-h-screen p-1 bg-neutral-600">
        <section className="flex items-center justify-between bg-gray-900 text-white px-6 py-4">
          <Header />
          <Navbar />
        </section>

        <section id="divider" className="mb-5" />

        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/recipes" element={<Recipes />} /> */}
        </Routes>
      </section>
    </BrowserRouter>
  )
}