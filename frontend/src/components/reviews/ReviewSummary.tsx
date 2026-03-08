import React from 'react';
import { Star, User, Package } from 'lucide-react';
import { Review } from '../../types/foodListing';

interface ReviewSummaryProps {
  reviews: Review[];
  reviewType?: 'donor' | 'recipient' | 'all';
  className?: string;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ 
  reviews, 
  reviewType = 'all',
  className = ''
}) => {
  // Filter reviews based on reviewType if specified
  const filteredReviews = reviewType === 'all' 
    ? reviews 
    : reviews.filter(review => review.reviewType === reviewType);

  // Calculate average rating
  const averageRating = filteredReviews.length > 0
    ? filteredReviews.reduce((sum, review) => sum + review.rating, 0) / filteredReviews.length
    : 0;

  // Format average rating to one decimal place
  const formattedRating = averageRating.toFixed(1);

  // Get rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]; // For ratings 1-5
  filteredReviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++;
    }
  });

  // Calculate percentages for rating bars
  const ratingPercentages = ratingCounts.map(count => 
    filteredReviews.length > 0 ? (count / filteredReviews.length) * 100 : 0
  );

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {reviewType === 'donor' ? (
            <span className="flex items-center">
              <Package size={18} className="mr-2 text-primary-600" />
              Donor Reviews
            </span>
          ) : reviewType === 'recipient' ? (
            <span className="flex items-center">
              <User size={18} className="mr-2 text-primary-600" />
              Recipient Reviews
            </span>
          ) : (
            <span className="flex items-center">
              <Star size={18} className="mr-2 text-primary-600" />
              All Reviews
            </span>
          )}
        </h3>
        <div className="flex items-center">
          <span className="text-2xl font-bold mr-1">{formattedRating}</span>
          <Star 
            size={20} 
            className={averageRating > 0 ? "text-yellow-400 fill-current" : "text-gray-300"} 
          />
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        Based on {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
      </div>

      {/* Rating distribution bars */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating, index) => (
          <div key={rating} className="flex items-center">
            <div className="w-8 text-sm text-gray-600">{rating} ★</div>
            <div className="flex-1 h-2 mx-2 bg-gray-200 rounded">
              <div 
                className="h-2 bg-yellow-400 rounded" 
                style={{ width: `${ratingPercentages[rating - 1]}%` }}
              ></div>
            </div>
            <div className="w-8 text-sm text-gray-600 text-right">
              {ratingCounts[rating - 1]}
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No reviews yet
        </div>
      )}
    </div>
  );
};

export default ReviewSummary;