import React, { useState } from 'react';
import styles from '../styles/RatingStars.module.css';

const RatingStars = ({ 
  rating = 0, 
  onRatingChange = null, 
  readonly = false, 
  size = 'medium',
  showCount = false,
  reviewCount = 0 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleStarClick = (starValue) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue) => {
    if (!readonly) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'rating-stars-small';
      case 'large': return 'rating-stars-large';
      default: return 'rating-stars-medium';
    }
  };

  return (
    <div className={`${styles['rating-stars']} ${styles[getSizeClass()]} ${readonly ? styles['readonly'] : styles['interactive']}`}>
      <div className={styles['stars-container']} onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles['star']} ${star <= displayRating ? styles['filled'] : styles['empty']}`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
          >
            ★
          </span>
        ))}
      </div>
      {showCount && (
        <span className={styles['rating-info']}>
          ({rating ? rating.toFixed(1) : 'N/A'}) &nbsp;•&nbsp; {reviewCount} review{reviewCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
