import React from 'react';
import { Card as CardType, CardStatus } from '../types';
import styles from './Card.module.css';

interface CardProps { card: CardType; onClick?: () => void; showStatus?: boolean; }

export const Card: React.FC<CardProps> = ({ card, onClick, showStatus = false }) => {
  const showStats = card.type === 'criatura' || card.type === 'planeswalker';
  const getStatusClass = (status: CardStatus) => { switch (status) { case CardStatus.PENDING: return styles.statusPending; case CardStatus.APPROVED: return styles.statusApproved; case CardStatus.REJECTED: return styles.statusRejected; case CardStatus.PUBLISHED: return styles.statusPublished; default: return ''; } };
  const getStatusLabel = (status: CardStatus) => { switch (status) { case CardStatus.PENDING: return 'Pendiente'; case CardStatus.APPROVED: return 'Aprobada'; case CardStatus.REJECTED: return 'Rechazada'; case CardStatus.PUBLISHED: return 'Publicada'; default: return status; } };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.card} onClick={onClick} role="button" tabIndex={0}>
        {showStatus && card.status !== CardStatus.DRAFT && <span className={`${styles.statusBadge} ${getStatusClass(card.status)}`}>{getStatusLabel(card.status)}</span>}
        <img src={card.imageUrl || 'https://via.placeholder.com/300x200/1a1a2e/c9a227?text=Sin+Imagen'} alt={card.title} className={styles.cardImage} loading="lazy" />
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}><h3 className={styles.cardTitle}>{card.title}</h3><span className={styles.manaCost}>{card.manaCost}</span></div>
          <span className={styles.cardType}>{card.subtype ? `${card.subtype} — ` : ''}{card.type}</span>
          <p className={styles.cardDescription}>{card.description}</p>
          {showStats && <div className={styles.stats}>{card.attack !== undefined && <span className={`${styles.stat} ${styles.statAttack}`}>⚔ {card.attack}</span>}{card.life !== undefined && <span className={`${styles.stat} ${styles.statLife}`}>♥ {card.life}</span>}</div>}
          <div className={styles.cardFooter}>{card.averageRating !== undefined && card.averageRating > 0 && <div className={styles.rating}><span className={styles.starIcon}>★</span><span>{card.averageRating.toFixed(1)}</span>{card.voteCount !== undefined && <span>({card.voteCount})</span>}</div>}{card.artist && <span className={styles.artistCredit}>Art: {card.artist}</span>}</div>
        </div>
      </div>
    </div>
  );
};
export default Card;
