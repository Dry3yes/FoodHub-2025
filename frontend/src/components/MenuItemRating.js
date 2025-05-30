import React, { useState, useEffect } from 'react';
import RatingStars from './RatingStars';
import { getMenuItemReviews } from '../services/Api';

const MenuItemRating = ({ menuId, showReviews = false }) => {
  const [rating, setRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRating();
  }, [menuId]);

  const loadRating = async () => {
    try {
      setLoading(true);
      const data = await getMenuItemReviews(menuId, 5);
      setRating({
        averageRating: data.averageRating,
        totalReviews: data.totalReviews
      });
      setReviews(data.recentReviews);
    } catch (err) {
      console.error('Error loading menu item rating:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="menu-item-rating-loading">Loading...</div>;
  }

  if (!rating || rating.totalReviews === 0) {
    return showReviews ? <div className="no-menu-reviews">No reviews yet</div> : null;
  }

  return (
    <div className="menu-item-rating">
      <RatingStars 
        rating={rating.averageRating} 
        readonly 
        size="small" 
        showCount 
        reviewCount={rating.totalReviews}
      />
      
      {showReviews && reviews.length > 0 && (
        <div className="menu-item-reviews">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="menu-review-item">
              <div className="menu-review-header">
                <span className="menu-reviewer-name">{review.userName}</span>
                <RatingStars rating={review.rating} readonly size="small" />
              </div>
              {review.comment && (
                <p className="menu-review-comment">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuItemRating;
