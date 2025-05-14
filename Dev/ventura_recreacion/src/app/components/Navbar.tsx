// components/Navbar.tsx
"use client";
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header className="navbar">
            <div className="navbar-container">
                <Link href="/" className="logo">Ventura Recreación</Link>
                <nav>
                    <ul className="nav-menu">
                        {user ? (
                            <>
                                <li><Link href="/perfil">Perfil</Link></li>
                                <li><button onClick={logout}>Cerrar Sesión</button></li>
                            </>
                        ) : (
                            <>
                                <li><Link href="/login">Iniciar Sesión</Link></li>
                                <li><Link href="/registro">Registro</Link></li>
                            </>
                        )}
                        <li><Link href="/eventos">Eventos</Link></li>
                        <li><Link href="/pagos">Pagos</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}