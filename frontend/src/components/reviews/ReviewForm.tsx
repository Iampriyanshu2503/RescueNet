import React, { useState, useEffect } from 'react';
import { Star, Send, User, Package } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { showNotification } from '../../utils/notificationUtils';
import { reviewService } from '../../services/reviewService';
import { foodDonationService } from '../../services/foodDonationService';
import { FoodDonation } from '../../types/foodListing';

interface ReviewFormProps {
  foodListingId: string;
  onReviewSubmitted?: () => void;
  reviewType?: 'donor' | 'recipient';
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  foodListingId, 
  onReviewSubmitted,
  reviewType
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [foodListing, setFoodListing] = useState<FoodDonation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Determine if user is reviewing a donor or recipient
  const isReviewingDonor = reviewType ? reviewType === 'donor' : user?.role === 'recipient';
  
  useEffect(() => {
    const fetchFoodListing = async () => {
      try {
        setLoading(true);
        const data = await foodDonationService.getById(foodListingId);
        setFoodListing(data);
      } catch (error) {
        console.error('Error fetching food listing:', error);
        showNotification.error('Failed to load food listing details');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodListing();
  }, [foodListingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      showNotification.error('Please select a rating');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create review payload
      const reviewData = {
        rating,
        comment
      };
      
      // Call the API to create a review
      await reviewService.createFoodDonationReview(foodListingId, reviewData);
      
      showNotification.success('Review submitted successfully!');
      setRating(0);
      setComment('');
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Failed to submit review', error);
      showNotification.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center mb-4">
            <div className={`p-2 rounded-full mr-3 ${isReviewingDonor ? 'bg-blue-100' : 'bg-green-100'}`}>
              {isReviewingDonor ? (
                <Package className={`w-5 h-5 ${isReviewingDonor ? 'text-blue-600' : 'text-green-600'}`} />
              ) : (
                <User className={`w-5 h-5 ${isReviewingDonor ? 'text-blue-600' : 'text-green-600'}`} />
              )}
            </div>
            <h3 className="text-lg font-semibold">
              {isReviewingDonor ? 'Rate Food Quality & Donor Service' : 'Rate Recipient Experience'}
            </h3>
          </div>
          
          {foodListing && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">You are reviewing:</p>
              <p className="font-medium">{foodListing.foodType}</p>
              <p className="text-sm text-gray-500 mt-1">
                {isReviewingDonor 
                  ? 'Your feedback helps other recipients find quality food donations' 
                  : 'Your feedback helps donors know their food reached the right people'}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Star Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${(hoverRating || rating) >= star
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </div>
            </div>
            
            {/* Comment */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isReviewingDonor 
                  ? 'How was the food quality? Was it as described? Was the donor helpful?'
                  : 'Was the recipient on time? Was the pickup smooth? Any feedback for future donations?'
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ReviewForm;