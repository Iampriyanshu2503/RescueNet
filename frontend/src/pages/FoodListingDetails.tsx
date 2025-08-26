import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { foodDonationService } from '../services/foodDonationService';
import { FoodDonation } from '../types/foodListing';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewDisplay from '../components/reviews/ReviewDisplay';
import { reviewService, Review } from '../services/reviewService';

const FoodListingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [foodListing, setFoodListing] = useState<FoodDonation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        
        // Fetch food listing details
        const data = await foodDonationService.getById(id);
        setFoodListing(data);
        
        // Fetch reviews for this food listing
        try {
          const reviewsData = await reviewService.getFoodListingReviews(id);
          setReviews(reviewsData);
        } catch (reviewError) {
          console.error('Error fetching reviews:', reviewError);
          // Don't show error toast for reviews, just log it
        }
      } catch (error) {
        console.error('Error fetching food listing:', error);
        toast.error('Failed to load food listing details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleReserve = async () => {
    try {
      if (!id) return;
      // This would be replaced with actual reservation logic
      toast.success('Food listing reserved successfully!');
      navigate('/recipient-dashboard');
    } catch (error) {
      console.error('Error reserving food listing:', error);
      toast.error('Failed to reserve food listing');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!foodListing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Food listing not found</p>
        </div>
        <button 
          onClick={handleBack}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          {foodListing.image ? (
            <img 
              src={foodListing.image} 
              alt={foodListing.foodType} 
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              foodListing.status === 'available' ? 'bg-green-100 text-green-800' :
              foodListing.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
              foodListing.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {foodListing.status.charAt(0).toUpperCase() + foodListing.status.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-800">{foodListing.foodType}</h1>
            <p className="text-sm text-gray-500">
              Posted {formatDistanceToNow(new Date(foodListing.createdAt), { addSuffix: true })}
            </p>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Servings</p>
              <p className="font-medium">{foodListing.servings}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Best Before</p>
              <p className="font-medium">{foodListing.bestBefore} hours</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800">Description</h2>
            <p className="mt-2 text-gray-600">{foodListing.description}</p>
          </div>
          
          {foodListing.allergens && foodListing.allergens.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800">Allergens</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {foodListing.allergens.map((allergen, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {foodListing.pickupInstructions && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800">Pickup Instructions</h2>
              <p className="mt-2 text-gray-600">{foodListing.pickupInstructions}</p>
            </div>
          )}
          
          <div className="mt-8 flex space-x-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back
            </button>
            
            {foodListing.status === 'available' && (
              <button
                onClick={handleReserve}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Reserve Food
              </button>
            )}
            
            {/* Show review button for completed transactions */}
            {foodListing.status === 'completed' && user && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {showReviewForm ? 'Cancel Review' : 'Write Review'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8">
        {/* Review Form */}
        {showReviewForm && foodListing && user && (
          <div className="mb-6">
            <ReviewForm
              recipientId={user.role === 'donor' ? foodListing.user : undefined}
              donorId={user.role === 'recipient' ? foodListing.user : undefined}
              foodListingId={foodListing._id}
              onReviewSubmitted={() => {
                setShowReviewForm(false);
                // Refresh reviews
                if (id) {
                  reviewService.getFoodListingReviews(id)
                    .then(data => setReviews(data))
                    .catch(err => console.error('Error refreshing reviews:', err));
                }
              }}
            />
          </div>
        )}

        {/* Reviews Display */}
        <ReviewDisplay 
          reviews={reviews} 
          title={user?.role === 'recipient' ? 'Donor Reviews' : 'Recipient Reviews'} 
        />
      </div>
    </div>
  );
};

export default FoodListingDetails;