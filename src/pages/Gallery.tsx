import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cardService, voteService } from '../lib/cardService';
import { useToast } from '../components/Toast';
import { Card, SortOption, Vote } from '../types';
import { Select, Textarea } from '../components/Input';
import Button from '../components/Button';
import CardComponent from '../components/Card';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';
import styles from './Gallery.module.css';

type ViewMode = 'grid' | 'list';

export const Gallery: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [voteRating, setVoteRating] = useState(0);
  const [voteComment, setVoteComment] = useState('');
  const [submittingVote, setSubmittingVote] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const loadCards = useCallback(async (reset = false) => {
    const newPage = reset ? 0 : page;
    if (!reset && !hasMore) return;
    try { setLoading(true); const newCards = await cardService.getApprovedCards(sortBy, newPage); if (reset) { setCards(newCards); setPage(0); } else { setCards(prev => [...prev, ...newCards]); } setHasMore(newCards.length === 20); }
    catch (err) { console.error('Error loading cards:', err); showToast('error', 'Error al cargar las cartas'); }
    finally { setLoading(false); }
  }, [sortBy, page, hasMore, showToast]);

  useEffect(() => { loadCards(true); }, [sortBy]);

  const handleCardClick = async (card: Card) => {
    setSelectedCard(card); setShowModal(true);
    if (user) { const vote = await voteService.getVote(card.id, user.uid); setUserVote(vote); setVoteRating(vote?.rating || 0); setVoteComment(vote?.comment || ''); }
  };

  const handleVote = async (card: Card, rating: number, comment?: string) => {
    if (!user || rating === 0) return;
    try { 
      await voteService.vote(card.id, user.uid, rating, comment); 
      
      const newAverage = card.averageRating 
        ? ((card.averageRating * (card.voteCount || 0)) + rating) / ((card.voteCount || 0) + 1)
        : rating;
      const newCount = (card.voteCount || 0) + 1;
      
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, averageRating: newAverage, voteCount: newCount } : c));
      
      if (selectedCard?.id === card.id) {
        setSelectedCard({ ...card, averageRating: newAverage, voteCount: newCount });
      }
      
      showToast('success', '¡Voto registrado!'); 
    }
    catch (err) { console.error('Error voting:', err); showToast('error', 'Error al registrar el voto'); }
  };

  const handleVoteFromList = async (card: Card, rating: number) => {
    await handleVote(card, rating);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>★ Galería de Cartas</h1>
        <div className={styles.filters}>
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
              title="Vista de tarjetas"
            >
              ▦
            </button>
            <button 
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
              title="Vista de lista"
            >
              ☰
            </button>
          </div>
          <span className={styles.cardCount}>{cards.length} cartas</span>
          <Select className={styles.sortSelect} options={[{ value: 'date', label: 'Más Recientes' }, { value: 'rating', label: 'Mejor Valoradas' }, { value: 'votes', label: 'Más Votadas' }]} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} />
        </div>
      </div>
      
      {loading && cards.length === 0 ? (
        <div className={styles.loading}>Cargando cartas...</div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className={styles.cardGrid}>
              {cards.map(card => (
                <CardComponent key={card.id} card={card} onClick={() => handleCardClick(card)} />
              ))}
            </div>
          ) : (
            <div className={styles.listContainer}>
              <div className={styles.listHeader}>
                <span className={styles.listHeaderCell} style={{ width: '60px' }}></span>
                <span className={styles.listHeaderCell} style={{ flex: 2 }}>Nombre</span>
                <span className={styles.listHeaderCell} style={{ flex: 1 }}>Tipo</span>
                <span className={styles.listHeaderCell} style={{ width: '60px' }}>Maná</span>
                <span className={styles.listHeaderCell} style={{ width: '60px' }}>ATK</span>
                <span className={styles.listHeaderCell} style={{ width: '60px' }}>VID</span>
                <span className={styles.listHeaderCell} style={{ flex: 1 }}>Artista</span>
                <span className={styles.listHeaderCell} style={{ width: '120px' }}>Valoración</span>
              </div>
              {cards.map(card => (
                <div key={card.id} className={styles.listRow}>
                  <div className={styles.listCell} style={{ width: '60px' }}>
                    <img 
                      src={card.imageUrl || ''} 
                      alt={card.title}
                      className={styles.listThumbnail}
                      onClick={() => handleCardClick(card)}
                    />
                  </div>
                  <span className={styles.listCell} style={{ flex: 2, fontWeight: 600, color: 'var(--color-accent-gold)' }}>
                    {card.title}
                  </span>
                  <span className={styles.listCell} style={{ flex: 1 }}>
                    {card.subtype}
                  </span>
                  <span className={styles.listCell} style={{ width: '60px', textAlign: 'center' }}>
                    {card.manaCost}
                  </span>
                  <span className={styles.listCell} style={{ width: '60px', textAlign: 'center', color: '#ef5350' }}>
                    {card.attack ?? '-'}
                  </span>
                  <span className={styles.listCell} style={{ width: '60px', textAlign: 'center', color: '#66bb6a' }}>
                    {card.life ?? '-'}
                  </span>
                  <span className={styles.listCell} style={{ flex: 1, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {card.artist}
                  </span>
                  <div className={styles.listCell} style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StarRating 
                      value={card.averageRating || 0} 
                      readOnly 
                      size="small"
                      onChange={user ? (r) => handleVoteFromList(card, r) : undefined}
                    />
                    <button 
                      className={styles.viewButton}
                      onClick={() => handleCardClick(card)}
                      title="Ver detalle"
                    >
                      👁
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {cards.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📜</div>
              <h3 className={styles.emptyTitle}>No hay cartas publicadas</h3>
              <p className={styles.emptyText}>Las cartas aparecerán aquí una vez sean aprobadas.</p>
              {user && <Button onClick={() => navigate('/create')}>Crear Primera Carta</Button>}
            </div>
          )}
          
          {hasMore && cards.length > 0 && (
            <div className={styles.loadMore}>
              <Button variant="secondary" onClick={() => { setPage(p => p + 1); loadCards(); }} loading={loading}>Cargar Más</Button>
            </div>
          )}
        </>
      )}
      
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedCard?.title || 'Carta'}>
        {selectedCard && (
          <div className={styles.modalContent}>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 250px' }}>
                <img 
                  src={selectedCard.imageUrl || ''} 
                  alt={selectedCard.title} 
                  style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', border: '2px solid rgba(201, 162, 39, 0.3)' }} 
                />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <div className={styles.cardDetails}>
                  <div className={styles.detailRow}><span className={styles.detailLabel}>Tipo:</span><span className={styles.detailValue}>{selectedCard.subtype} — {selectedCard.type}</span></div>
                  <div className={styles.detailRow}><span className={styles.detailLabel}>Maná:</span><span className={styles.detailValue}>{selectedCard.manaCost}</span></div>
                  {selectedCard.attack !== undefined && <div className={styles.detailRow}><span className={styles.detailLabel}>Ataque:</span><span className={styles.detailValue}>{selectedCard.attack}</span></div>}
                  {selectedCard.life !== undefined && <div className={styles.detailRow}><span className={styles.detailLabel}>Vida:</span><span className={styles.detailValue}>{selectedCard.life}</span></div>}
                  <div className={styles.detailRow}><span className={styles.detailLabel}>Artista:</span><span className={styles.detailValue}>{selectedCard.artist}</span></div>
                  <div className={styles.detailRow}><span className={styles.detailLabel}>Valoración:</span><StarRating value={selectedCard.averageRating || 0} readOnly /></div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}><strong style={{ color: 'var(--color-accent-gold)' }}>Descripción:</strong><p style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>{selectedCard.description}</p></div>
            {user && (
              <div className={styles.votingSection}>
                <h4 className={styles.votingTitle}>{userVote ? 'Tu Voto' : 'Votar esta Carta'}</h4>
                <StarRating value={voteRating} onChange={setVoteRating} />
                <div className={styles.votingComment}><Textarea value={voteComment} onChange={(e) => setVoteComment(e.target.value)} placeholder="Agrega un comentario (opcional)..." rows={2} /></div>
                <Button onClick={() => handleVote(selectedCard, voteRating, voteComment)} loading={submittingVote} disabled={voteRating === 0} style={{ marginTop: '0.75rem' }}>{userVote ? 'Actualizar Voto' : 'Enviar Voto'}</Button>
              </div>
            )}
            {!user && <p style={{ marginTop: '1rem' }}><a href="/login">Inicia sesión</a> para votar esta carta.</p>}
          </div>
        )}
      </Modal>
    </div>
  );
};
export default Gallery;
