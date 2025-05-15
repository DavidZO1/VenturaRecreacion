// src/app/layout.tsx
"use client";
import "./globals.css";
import { ReactNode } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="main-content">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}