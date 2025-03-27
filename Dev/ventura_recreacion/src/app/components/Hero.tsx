"use client";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Ventura Recreación</h1>
        <p>Transformamos tus eventos en experiencias memorables</p>
        <a href="/servicios" className="cta-button">Ver Servicios</a>
      </div>
    </section>
  );
}