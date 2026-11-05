import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio from "./Inicio";
import Galeria from "./Galeria";
import Admin from "./Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/visor/:id?" element={<Galeria />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
