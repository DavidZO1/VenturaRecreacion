"use client";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <h1 className="logo">Ventura Recreación</h1>
        <nav>
          <ul className="nav-menu">
            <li><a href="/">Inicio</a></li>
            <li><a href="/servicios">Servicios</a></li>
            <li><a href="/agenda">Agenda</a></li>
            <li><a href="/pagos">Pagos</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}