import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { foodDonationService } from '../services/foodDonationService';
import { FoodDonation } from '../types/foodListing';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewDisplay from '../components/reviews/ReviewDisplay';
import ReviewSummary from '../components/reviews/ReviewSummary';
import { reviewService } from '../services/reviewService';
import { Star, MessageCircle, ThumbsUp } from 'lucide-react';

const FoodListingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [foodListing, setFoodListing] = useState<FoodDonation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [reviewType, setReviewType] = useState<'donor' | 'recipient'>('donor');
  const [reviewStats, setReviewStats] = useState<{total: number, average: number}>({total: 0, average: 0});

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        
        // Fetch food listing details
        const data = await foodDonationService.getById(id);
        setFoodListing(data);
        
        // Calculate review stats if reviews exist
        if (data.reviews && data.reviews.length > 0) {
          const total = data.reviews.length;
          const sum = data.reviews.reduce((acc, review) => acc + review.rating, 0);
          const average = sum / total;
          setReviewStats({ total, average });
        }
        
        // Set review type based on user role
        if (user) {
          setReviewType(user.role === 'recipient' ? 'donor' : 'recipient');
        }
      } catch (error) {
        console.error('Error fetching food listing:', error);
        toast.error('Failed to load food listing details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

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
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Reviews & Ratings</h2>
            
            {/* Review Stats Summary */}
            {foodListing.reviews && foodListing.reviews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <ReviewSummary 
                  reviews={foodListing.reviews} 
                  reviewType="all" 
                  className="bg-gray-50"
                />
                
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col justify-center">
                  <div className="flex items-center mb-4">
                    <MessageCircle className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-gray-700">Honest feedback builds our community</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <ThumbsUp className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-700">Quality donations get better ratings</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                    <span className="text-gray-700">Your reviews help others make decisions</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Review Actions */}
            <div className="flex flex-wrap gap-4 mb-6">
              {foodListing?.status === 'completed' && user && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
                >
                  <Star className="w-4 h-4 mr-2" />
                  {showReviewForm ? 'Cancel Review' : 'Write Review'}
                </button>
              )}
              
              {user && user.role === 'donor' && foodListing?.status === 'completed' && (
                <button
                  onClick={() => {
                    setReviewType('recipient');
                    setShowReviewForm(true);
                  }}
                  className={`px-4 py-2 ${reviewType === 'recipient' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200 hover:bg-gray-300'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  Rate Recipient
                </button>
              )}
              
              {user && user.role === 'recipient' && foodListing?.status === 'completed' && (
                <button
                  onClick={() => {
                    setReviewType('donor');
                    setShowReviewForm(true);
                  }}
                  className={`px-4 py-2 ${reviewType === 'donor' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200 hover:bg-gray-300'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  Rate Food & Donor
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Review Form */}
        {showReviewForm && foodListing && user && (
          <div className="mb-6">
            <ReviewForm
              foodListingId={foodListing._id}
              reviewType={reviewType}
              onReviewSubmitted={() => {
                setShowReviewForm(false);
                // Refresh the food listing to get updated reviews
                if (id) {
                  foodDonationService.getById(id).then(data => {
                    setFoodListing(data);
                    if (data.reviews && data.reviews.length > 0) {
                      const total = data.reviews.length;
                      const sum = data.reviews.reduce((acc, review) => acc + review.rating, 0);
                      const average = sum / total;
                      setReviewStats({ total, average });
                    }
                  });
                }
              }}
            />
          </div>
        )}

        {/* Reviews Display with Tabs */}
        {id && foodListing.reviews && foodListing.reviews.length > 0 && (
          <div className="mb-6">
            <div className="flex border-b mb-4">
              <button
                onClick={() => setReviewType('donor')}
                className={`py-2 px-4 ${reviewType === 'donor' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              >
                Donor Reviews
              </button>
              <button
                onClick={() => setReviewType('recipient')}
                className={`py-2 px-4 ${reviewType === 'recipient' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              >
                Recipient Reviews
              </button>
            </div>
            
            {/* Show ReviewSummary for the selected type */}
            <div className="mb-4">
              <ReviewSummary 
                reviews={foodListing.reviews} 
                reviewType={reviewType} 
              />
            </div>
            
            {/* Show ReviewDisplay for the selected type */}
            <ReviewDisplay 
              foodDonationId={id}
              reviewType={reviewType}
              title={reviewType === 'donor' ? 'Donor Reviews' : 'Recipient Reviews'} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodListingDetails;