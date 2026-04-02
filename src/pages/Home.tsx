import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cardService } from '../lib/cardService';
import { Card as CardType } from '../types';
import Button from '../components/Button';
import CardComponent from '../components/Card';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentCards, setRecentCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCards = async () => {
      try { const cards = await cardService.getApprovedCards('date', 0); setRecentCards(cards.slice(0, 6)); }
      catch (err) { console.error('Error loading cards:', err); }
      finally { setLoading(false); }
    };
    loadCards();
  }, []);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>⚔ Argentum TCG ⚔</h1>
        <p className={styles.heroSubtitle}>Crea, comparte y vota cartas únicas en el universo de Argentum Online.</p>
        <div className={styles.heroButtons}>
          {user ? (
            <><Button onClick={() => navigate('/create')}>Crear Nueva Carta</Button><Button variant="secondary" onClick={() => navigate('/gallery')}>Ver Galería</Button></>
          ) : (
            <><Button onClick={() => navigate('/register')}>Únete a la Comunidad</Button><Button variant="secondary" onClick={() => navigate('/login')}>Iniciar Sesión</Button></>
          )}
        </div>
      </section>

      {user && (
        <section className={styles.stats}>
          <div className={styles.statCard}><div className={styles.statValue}>{user.cardCount || 0}</div><div className={styles.statLabel}>Mis Cartas</div></div>
          <div className={styles.statCard}><div className={styles.statValue}>{recentCards.length}</div><div className={styles.statLabel}>Cartas en Galería</div></div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>★ Cartas Recientes</h2><Button variant="ghost" size="small" onClick={() => navigate('/gallery')}>Ver Todas →</Button></div>
        {loading ? <div className={styles.cardGrid}>{[1,2,3].map(i => <div key={i} className={styles.emptyState}><p>Cargando...</p></div>)}</div> : recentCards.length > 0 ? (
          <div className={styles.cardGrid}>{recentCards.map(card => <CardComponent key={card.id} card={card} onClick={() => navigate(`/card/${card.id}`)} />)}</div>
        ) : (
          <div className={styles.emptyState}><div className={styles.emptyIcon}>📜</div><h3 className={styles.emptyTitle}>No hay cartas aún</h3><p className={styles.emptyText}>¡Sé el primero en crear una carta!</p><Button onClick={() => navigate('/create')}>Crear mi Primera Carta</Button></div>
        )}
      </section>
    </div>
  );
};
export default Home;
