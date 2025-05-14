// app/registro/page.tsx
"use client";
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Registro</h1>
      <RegisterForm />
    </div>
  );
}