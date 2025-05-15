// app/login/page.tsx
"use client";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100">
      {/* Contenido principal centrado */}
      <div className="container mx-auto flex-1 flex flex-col justify-center items-center p-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-[--color-secondary]">
          Iniciar Sesión
        </h1>
        <LoginForm />
      </div>

      {/* Barra negra inferior con margen */}
      <div className="w-full h-24 bg-black mt-12" />
    </div>
  );
}
