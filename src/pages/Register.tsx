import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormGroup, Label, Input } from '../components/Input';
import Button from '../components/Button';
import styles from './Auth.module.css';

export const Register: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [publicName, setPublicName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (nickname.length < 3 || nickname.length > 20) { setError('El nickname debe tener entre 3 y 20 caracteres'); return; }
    setLoading(true);
    try { await register(email, password, nickname, publicName || undefined); navigate('/'); }
    catch (err: any) { switch (err.code) { case 'auth/email-already-in-use': setError('Este email ya está registrado'); break; default: setError('Error al registrarse. Intenta de nuevo.'); } }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.logo}><span className={styles.logoIcon}>⚔</span><span className={styles.logoText}>ARGENTUM TCG</span></div>
        <h1 className={styles.authTitle}>Crear Cuenta</h1>
        <p className={styles.authSubtitle}>Únete a la comunidad de creadores de cartas</p>
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <FormGroup><Label htmlFor="nickname" required>Nickname</Label><Input type="text" id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Tu nombre de usuario" required minLength={3} maxLength={20} /></FormGroup>
          <FormGroup><Label htmlFor="email" required>Email</Label><Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required /></FormGroup>
          <FormGroup><Label htmlFor="publicName">Nombre Público (opcional)</Label><Input type="text" id="publicName" value={publicName} onChange={(e) => setPublicName(e.target.value)} placeholder="Cómo te verán otros usuarios" /></FormGroup>
          <FormGroup><Label htmlFor="password" required>Contraseña</Label><Input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} /></FormGroup>
          <FormGroup><Label htmlFor="confirmPassword" required>Confirmar Contraseña</Label><Input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite tu contraseña" required /></FormGroup>
          <Button type="submit" fullWidth loading={loading} disabled={loading}>Crear Cuenta</Button>
        </form>
        <div className={styles.authFooter}>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></div>
      </div>
    </div>
  );
};
export default Register;
