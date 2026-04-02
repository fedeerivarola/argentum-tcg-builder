import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/create', label: 'Crear Carta' },
    { path: '/my-cards', label: 'Mis Cartas' },
    { path: '/gallery', label: 'Galería' },
  ];
  if (user?.role === 'admin') navLinks.push({ path: '/admin', label: 'Admin' });

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}><span className={styles.logoIcon}>⚔</span><span>ARGENTUM</span></Link>
        <nav className={styles.nav}>{user && navLinks.map(link => <Link key={link.path} to={link.path} className={`${styles.navLink} ${isActive(link.path) ? styles.navLinkActive : ''}`}>{link.label}</Link>)}</nav>
        <div className={styles.userSection}>
          {user ? (
            <><span className={styles.userName}>Bienvenido, <span>{user.nickname}</span>{user.role === 'admin' && <span className={styles.adminBadge}>Admin</span>}</span>
            <div className={styles.dropdown}><button className={styles.dropdownTrigger} onClick={() => setDropdownOpen(!dropdownOpen)}>☰</button>{dropdownOpen && <div className={styles.dropdownMenu}><button className={styles.dropdownItem} onClick={handleLogout}>Cerrar Sesión</button></div>}</div></>
          ) : (
            <><Button variant="ghost" size="small" onClick={() => navigate('/login')}>Ingresar</Button><Button variant="primary" size="small" onClick={() => navigate('/register')}>Registrarse</Button></>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
