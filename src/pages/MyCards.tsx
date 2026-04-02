import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cardService } from '../lib/cardService';
import { useToast } from '../components/Toast';
import { Card, CardStatus } from '../types';
import { Select } from '../components/Input';
import Button from '../components/Button';
import CardComponent from '../components/Card';
import styles from './MyCards.module.css';

export const MyCards: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => { if (user) loadCards(); }, [user]);

  const loadCards = async () => {
    if (!user) return;
    try { const myCards = await cardService.getMyCards(user.uid); setCards(myCards); }
    catch (err) { console.error('Error loading cards:', err); showToast('error', 'Error al cargar tus cartas'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta carta?')) return;
    try { await cardService.deleteCard(cardId); setCards(prev => prev.filter(c => c.id !== cardId)); showToast('success', 'Carta eliminada'); }
    catch (err) { showToast('error', 'Error al eliminar la carta'); }
  };

  const filteredCards = statusFilter === 'all' ? cards : cards.filter(c => c.status === statusFilter);
  const getStatusLabel = (status: CardStatus) => { switch (status) { case CardStatus.PENDING: return 'Pendiente'; case CardStatus.APPROVED: return 'Aprobada'; case CardStatus.REJECTED: return 'Rechazada'; case CardStatus.PUBLISHED: return 'Publicada'; default: return status; } };

  if (!user) { navigate('/login'); return null; }

  return (
    <div className={styles.page}>
      <div className={styles.header}><h1 className={styles.title}>⚔ Mis Cartas</h1><Button onClick={() => navigate('/create')}>+ Nueva Carta</Button></div>
      <div className={styles.filters}><Select options={[{ value: 'all', label: 'Todas' }, { value: CardStatus.PENDING, label: 'Pendientes' }, { value: CardStatus.APPROVED, label: 'Aprobadas' }, { value: CardStatus.REJECTED, label: 'Rechazadas' }, { value: CardStatus.PUBLISHED, label: 'Publicadas' }]} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} /></div>
      {loading ? <div className={styles.loading}>Cargando tus cartas...</div> : (
        <div className={styles.cardGrid}>
          {filteredCards.length === 0 ? (
            <div className={styles.emptyState}><div className={styles.emptyIcon}>📜</div><h3 className={styles.emptyTitle}>No tienes cartas {statusFilter !== 'all' && `en estado "${getStatusLabel(statusFilter as CardStatus)}"`}</h3><p className={styles.emptyText}>Crea tu primera carta y forma parte de la comunidad.</p><Button onClick={() => navigate('/create')}>Crear mi Primera Carta</Button></div>
          ) : filteredCards.map(card => (
            <div key={card.id}>
              <CardComponent card={card} showStatus onClick={() => navigate(`/card/${card.id}`)} />
              <div className={styles.cardActions}><Button variant="danger" size="small" onClick={() => handleDelete(card.id)}>Eliminar</Button></div>
              {card.status === CardStatus.REJECTED && card.rejectionComment && <p className={styles.statusInfo}><strong>Motivo:</strong> {card.rejectionComment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyCards;
