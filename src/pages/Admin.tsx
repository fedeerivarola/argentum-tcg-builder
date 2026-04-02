import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cardService } from '../lib/cardService';
import { useToast } from '../components/Toast';
import { Card } from '../types';
import { Textarea } from '../components/Input';
import Button from '../components/Button';
import styles from './Admin.module.css';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { if (user?.role !== 'admin') { navigate('/'); return; } loadCards(); }, [user, navigate]);

  const loadCards = async () => {
    try { const pending = await cardService.getPendingCards(); setCards(pending); }
    catch (err) { console.error('Error loading cards:', err); showToast('error', 'Error al cargar las cartas'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (cardId: string) => {
    setActionLoading(cardId);
    try { await cardService.approveCard(cardId); setCards(prev => prev.filter(c => c.id !== cardId)); showToast('success', 'Carta aprobada'); }
    catch (err) { showToast('error', 'Error al aprobar la carta'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (cardId: string) => {
    if (!rejectComment.trim()) { showToast('warning', 'Por favor ingresa un motivo'); return; }
    setActionLoading(cardId);
    try { await cardService.rejectCard(cardId, rejectComment); setCards(prev => prev.filter(c => c.id !== cardId)); setRejectingId(null); setRejectComment(''); showToast('success', 'Carta rechazada'); }
    catch (err) { showToast('error', 'Error al rechazar la carta'); }
    finally { setActionLoading(null); }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}><h1 className={styles.title}>🛡 Panel de Administración</h1><div className={styles.stats}><div className={styles.stat}><div className={styles.statValue}>{cards.length}</div><div className={styles.statLabel}>Pendientes</div></div></div></div>
      {loading ? <div className={styles.loading}>Cargando cartas pendientes...</div> : cards.length === 0 ? (
        <div className={styles.emptyState}><div className={styles.emptyIcon}>✓</div><h3 className={styles.emptyTitle}>No hay cartas pendientes</h3><p className={styles.emptyText}>Todas las cartas han sido revisadas</p></div>
      ) : (
        <div className={styles.cardList}>
          {cards.map(card => (
            <div key={card.id} className={styles.cardItem}>
              <img src={card.imageUrl || 'https://via.placeholder.com/200x280/1a1a2e/c9a227?text=Sin+Imagen'} alt={card.title} className={styles.cardImage} />
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardMeta}>{card.subtype} — {card.type} | Artista: {card.artist}</p>
                <div className={styles.cardStats}><span className={styles.statItem}><span>Maná:</span> {card.manaCost}</span>{card.attack !== undefined && <span className={styles.statItem}><span>Ataque:</span> {card.attack}</span>}{card.life !== undefined && <span className={styles.statItem}><span>Vida:</span> {card.life}</span>}</div>
                <p className={styles.cardDescription}>{card.description}</p>
                {rejectingId === card.id ? (
                  <div className={styles.rejectForm}><label className={styles.rejectLabel}>Motivo del rechazo:</label><Textarea value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} placeholder="Explica por qué rechazas esta carta..." rows={2} /><div className={styles.rejectActions}><Button variant="ghost" size="small" onClick={() => { setRejectingId(null); setRejectComment(''); }}>Cancelar</Button><Button variant="danger" size="small" onClick={() => handleReject(card.id)} loading={actionLoading === card.id}>Confirmar Rechazo</Button></div></div>
                ) : (
                  <div className={styles.cardActions}><Button onClick={() => handleApprove(card.id)} loading={actionLoading === card.id}>✓ Aprobar</Button><Button variant="danger" onClick={() => setRejectingId(card.id)}>✕ Rechazar</Button></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Admin;
