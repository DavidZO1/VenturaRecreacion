// components/Navbar.tsx
"use client";
import './Navbar.css';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header className="navbar">
            <div className="navbar-container">
                <Link href="/" className="logo" aria-label="Inicio">
                    <img src="/logo.png" alt="Logo Ventura" className="logo-image" />
                </Link>

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
                        <li><Link href="/servicios">Servicios</Link></li>
                        
                        
                        {user && (
                            <>
                                <li><Link href="/eventos">Mis Eventos</Link></li>
                                <li><Link href="/pagos">Pagos</Link></li>
                                {user?.role === 'admin' && <li><Link href="/admin">Panel Admin</Link></li>}
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}