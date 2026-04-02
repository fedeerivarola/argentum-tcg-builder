import React, { useState } from 'react';
import styles from './StarRating.module.css';

interface StarRatingProps { 
  value: number; 
  onChange?: (rating: number) => void; 
  readOnly?: boolean; 
  showValue?: boolean; 
  voteCount?: number;
  size?: 'small' | 'normal';
}

export const StarRating: React.FC<StarRatingProps> = ({ value, onChange, readOnly = false, showValue = false, voteCount, size = 'normal' }) => {
  const [hoverValue, setHoverValue] = useState(0);
  const handleClick = (rating: number) => { if (!readOnly && onChange) onChange(rating); };
  const handleMouseEnter = (rating: number) => { if (!readOnly) setHoverValue(rating); };
  const handleMouseLeave = () => { setHoverValue(0); };
  const displayValue = hoverValue || value;

  const containerClass = `${styles.ratingContainer} ${readOnly ? styles.readOnly : ''} ${size === 'small' ? styles.small : ''}`;

  if (readOnly && showValue) {
    return (
      <div className={`${containerClass} ${styles.display}`}>
        {[1, 2, 3, 4, 5].map(star => <span key={star} className={`${styles.star} ${displayValue >= star ? styles.filled : ''}`}>★</span>)}
        <span className={styles.displayValue}>{value.toFixed(1)}</span>
        {voteCount !== undefined && <span className={styles.voteCount}>({voteCount} votos)</span>}
      </div>
    );
  }

  return (
    <div className={containerClass} onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map(star => <span key={star} className={`${styles.star} ${displayValue >= star ? styles.filled : ''}`} onClick={() => handleClick(star)} onMouseEnter={() => handleMouseEnter(star)} role="button" tabIndex={readOnly ? -1 : 0}>★</span>)}
    </div>
  );
};
export default StarRating;
