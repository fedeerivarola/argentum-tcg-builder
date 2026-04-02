import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormGroup, Label, Input } from '../components/Input';
import Button from '../components/Button';
import styles from './Auth.module.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (err: any) { switch (err.code) { case 'auth/user-not-found': setError('No existe una cuenta con este email'); break; case 'auth/wrong-password': setError('Contraseña incorrecta'); break; default: setError('Error al iniciar sesión. Verifica tus datos.'); } }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.logo}><span className={styles.logoIcon}>⚔</span><span className={styles.logoText}>ARGENTUM TCG</span></div>
        <h1 className={styles.authTitle}>Iniciar Sesión</h1>
        <p className={styles.authSubtitle}>Accede a tu cuenta para crear y votar cartas</p>
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <FormGroup><Label htmlFor="email" required>Email</Label><Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required /></FormGroup>
          <FormGroup><Label htmlFor="password" required>Contraseña</Label><Input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tu contraseña" required /></FormGroup>
          <Button type="submit" fullWidth loading={loading} disabled={loading}>Ingresar</Button>
        </form>
        <div className={styles.authFooter}>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></div>
      </div>
    </div>
  );
};
export default Login;
