// app/login/page.tsx
"use client";
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Iniciar Sesión</h1>
      <LoginForm />
    </div>
  );
}