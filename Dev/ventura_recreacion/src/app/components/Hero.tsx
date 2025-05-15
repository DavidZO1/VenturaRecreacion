"use client";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content hero-box">
        <h1 className="hero-title">Ventura Recreación</h1>
        <p className="hero-subtitle">Transformamos tus eventos en experiencias memorables</p>
        <a href="/servicios" className="cta-button">Ver Servicios</a>
      </div>
    </section>
  );
}
