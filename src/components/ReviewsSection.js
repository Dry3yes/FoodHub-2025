import React, { useState, useEffect } from 'react';
import RatingStars from './RatingStars';
import { getSellerReviews } from '../services/Api';
import styles from '../styles/ReviewsSection.module.css';

const ReviewsSection = ({ sellerId }) => {
  const [reviews, setReviews] = useState([]);
  const [sellerRating, setSellerRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [sellerId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getSellerReviews(sellerId, showAll ? 50 : 5);
      setReviews(data.recentReviews);
      setSellerRating({
        averageRating: data.averageRating,
        totalReviews: data.totalReviews,
        ratingDistribution: data.ratingDistribution
      });
      setError('');
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const getRatingPercentage = (rating) => {
    if (!sellerRating?.totalReviews) return 0;
    const count = sellerRating.ratingDistribution[rating.toString()] || 0;
    return (count / sellerRating.totalReviews) * 100;
  };

  if (loading) {
    return (
      <div className="reviews-section">
        <div className="reviews-loading">Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviews-section">
        <div className="reviews-error">{error}</div>
      </div>
    );
  }

  if (!sellerRating || sellerRating.totalReviews === 0) {
    return (
      <div className="reviews-section">
        <h3>Reviews & Ratings</h3>
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review this restaurant!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <h3>Reviews & Ratings</h3>
      
      {/* Rating Summary */}
      <div className={styles['rating-summary']}>
        <div className={styles['rating-overview']}>
          <div className={styles['average-rating']}>
            <span className={styles['rating-number']}>{sellerRating.averageRating.toFixed(1)}</span>
            <RatingStars rating={sellerRating.averageRating} readonly size="large" />
            <span className={styles['review-count']}>{sellerRating.totalReviews} review{sellerRating.totalReviews !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className={styles['rating-breakdown']}>
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className={styles['rating-bar-item']}>
              <span className={styles['rating-label']}>{rating}</span>
              <div className={styles['rating-bar']}>
                <div 
                  className={styles['rating-bar-fill']} 
                  style={{ width: `${getRatingPercentage(rating)}%` }}
                ></div>
              </div>              <span className={styles['rating-count']}>
                {sellerRating.ratingDistribution[rating.toString()] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className={styles['reviews-list']}>
        <h4>Customer Reviews</h4>
        {reviews.length === 0 ? (
          <div className={styles['no-reviews']}>
            <p>No written reviews yet.</p>
          </div>
        ) : (
          <>
            {reviews.slice(0, showAll ? reviews.length : 3).map((review) => (
              <div key={review.id} className={styles['review-item']}>
                <div className={styles['review-header']}>
                  <div className={styles['reviewer-info']}>
                    <div className={styles['reviewer-avatar']}>
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles['reviewer-details']}>
                      <span className={styles['reviewer-name']}>{review.userName}</span>
                      <span className={styles['review-date']}>{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                  <RatingStars rating={review.rating} readonly size="small" />
                </div>
                
                {review.comment && (
                  <div className={styles['review-comment']}>
                    <p>{review.comment}</p>
                  </div>
                )}
                
                {review.tags && review.tags.length > 0 && (
                  <div className={styles['review-tags']}>
                    {review.tags.map((tag, index) => (
                      <span key={index} className={styles['review-tag']}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {reviews.length > 3 && (
              <button
                className={styles['show-more-reviews']}
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
