import React, { useState, useEffect } from 'react';
import RatingStars from './RatingStars';
import styles from '../styles/ReviewModal.module.css';

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  orderData, 
  existingReview = null 
}) => {
  const [restaurantRating, setRestaurantRating] = useState(existingReview?.rating || 0);
  const [restaurantComment, setRestaurantComment] = useState(existingReview?.comment || '');
  const [restaurantTags, setRestaurantTags] = useState(existingReview?.tags || []);
  
  const [menuItemReviews, setMenuItemReviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize menu item reviews
  useEffect(() => {
    if (orderData?.items && isOpen) {
      const initialReviews = orderData.items.map(item => ({
        menuId: item.menuId || item.id,
        menuItemName: item.menuItemName || item.name,
        rating: 0,
        comment: '',
        tags: []
      }));
      setMenuItemReviews(initialReviews);
    }
  }, [orderData, isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRestaurantRating(existingReview?.rating || 0);
      setRestaurantComment(existingReview?.comment || '');
      setRestaurantTags(existingReview?.tags || []);
    }
  }, [isOpen, existingReview]);

  const restaurantTagOptions = [
    'Fast Service', 'Friendly Staff', 'Clean Environment', 'Good Value',
    'Fresh Ingredients', 'Accurate Order', 'On Time', 'Great Presentation'
  ];

  const menuItemTagOptions = [
    'Delicious', 'Fresh', 'Hot', 'Good Portion', 'Well Seasoned',
    'Too Salty', 'Too Sweet', 'Cold', 'Small Portion', 'Overcooked'
  ];

  const handleRestaurantTagToggle = (tag) => {
    setRestaurantTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleMenuItemRatingChange = (index, rating) => {
    setMenuItemReviews(prev => prev.map((review, i) => 
      i === index ? { ...review, rating } : review
    ));
  };

  const handleMenuItemCommentChange = (index, comment) => {
    setMenuItemReviews(prev => prev.map((review, i) => 
      i === index ? { ...review, comment } : review
    ));
  };

  const handleMenuItemTagToggle = (index, tag) => {
    setMenuItemReviews(prev => prev.map((review, i) => {
      if (i === index) {
        const newTags = review.tags.includes(tag)
          ? review.tags.filter(t => t !== tag)
          : [...review.tags, tag];
        return { ...review, tags: newTags };
      }
      return review;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (restaurantRating === 0) {
      alert('Please provide a restaurant rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reviewData = {
        orderId: orderData.id,
        sellerId: orderData.sellerId,
        rating: restaurantRating,
        comment: restaurantComment,
        tags: restaurantTags,
        menuItemReviews: menuItemReviews.filter(review => review.rating > 0)
      };

      await onSubmit(reviewData);
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className={styles['review-modal-overlay']} onClick={onClose}>
      <div className={styles['review-modal-content']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['review-modal-header']}>
          <div className={styles['review-icon']}>⭐</div>
          <h3>Rate Your Experience</h3>
          <button className={styles['review-close-btn']} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles['review-form']}>
          <div className={styles['review-modal-body']}>
            {/* Order Summary */}
            <div className={styles['review-order-summary']}>
              <h4>Order Summary</h4>
              <div className={styles['review-order-info']}>
                <div className={styles['review-info-row']}>
                  <span>Restaurant:</span>
                  <span>{orderData?.storeName}</span>
                </div>
                <div className={styles['review-info-row']}>
                  <span>Order ID:</span>
                  <span>#{orderData?.id}</span>
                </div>
                <div className={styles['review-info-row']}>
                  <span>Total:</span>
                  <span>Rp {orderData?.total?.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Restaurant Rating */}
            <div className={styles['review-section']}>
              <h4>Rate the Restaurant</h4>
              <div className={styles['rating-input']}>
                <RatingStars 
                  rating={restaurantRating}
                  onRatingChange={setRestaurantRating}
                  size="large"
                />
                <span className={styles['rating-label']}>
                  {restaurantRating === 0 && "Select rating"}
                  {restaurantRating === 1 && "Poor"}
                  {restaurantRating === 2 && "Fair"}
                  {restaurantRating === 3 && "Good"}
                  {restaurantRating === 4 && "Very Good"}
                  {restaurantRating === 5 && "Excellent"}
                </span>
              </div>
              
              <textarea
                placeholder="Share your experience with this restaurant..."
                value={restaurantComment}
                onChange={(e) => setRestaurantComment(e.target.value)}
                className={styles['review-textarea']}
                maxLength={500}
              />

              <div className={styles['tag-selection']}>
                <p>What stood out? (Optional)</p>
                <div className={styles['tag-options']}>
                  {restaurantTagOptions.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={`${styles['tag-option']} ${restaurantTags.includes(tag) ? styles['selected'] : ''}`}
                      onClick={() => handleRestaurantTagToggle(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Menu Items Rating */}
            <div className={styles['review-section']}>
              <h4 className={styles['review-item-section-title']}>Rate Individual Items (Optional)</h4>
              <div className={styles['menu-items-review']}>
                {orderData?.items?.map((item, index) => (
                  <div key={index} className={styles['menu-item-review']}>
                    <div className={styles['menu-item-info']}>
                      <img 
                        src={item.imageURL || "/placeholder.svg"} 
                        alt={item.menuItemName}
                        className={styles['menu-item-image']}
                      />
                      <div className={styles['menu-item-details']}>
                        <h5>{item.menuItemName}</h5>
                        <p>Qty: {item.quantity} • Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                      </div>
                    </div>

                    <div className={styles['menu-item-rating']}>
                      <RatingStars 
                        rating={menuItemReviews[index]?.rating || 0}
                        onRatingChange={(rating) => handleMenuItemRatingChange(index, rating)}
                        size="medium"
                      />
                    </div>
                    
                    {menuItemReviews[index]?.rating > 0 && (
                      <>
                        <textarea
                          placeholder={`How was the ${item.menuItemName}?`}
                          value={menuItemReviews[index]?.comment || ''}
                          onChange={(e) => handleMenuItemCommentChange(index, e.target.value)}
                          className={styles['menu-item-textarea']}
                          maxLength={300}
                        />

                        <div className={styles['menu-item-tags']}>
                          {menuItemTagOptions.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              className={`${styles['tag-option']} ${menuItemReviews[index]?.tags?.includes(tag) ? styles['selected'] : ''}`}
                              onClick={() => handleMenuItemTagToggle(index, tag)}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles['review-modal-footer']}>
            <button 
              type="button" 
              className={styles['review-btn-secondary']} 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles['review-btn-primary']}
              disabled={isSubmitting || restaurantRating === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
