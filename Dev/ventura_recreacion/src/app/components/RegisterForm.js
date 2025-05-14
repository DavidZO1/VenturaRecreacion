// components/RegisterForm.js
import { useState } from 'react';

export default function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            const user = await response.json();
            console.log('Registration successful:', user);
            // Redirigir o actualizar estado global aquí
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre"
                className="w-full mb-2 p-2 border rounded"
                required
            />
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full mb-2 p-2 border rounded"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full mb-2 p-2 border rounded"
                required
            />
            <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
                Registrarse
            </button>
        </form>
    );
}