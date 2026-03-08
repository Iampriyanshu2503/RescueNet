import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import { Review } from '../types/foodListing';

interface CreateReviewRequest {
  rating: number;
  comment: string;
  reviewType: 'donor' | 'recipient';
}

const reviewService = {
  // Create a new review for a food donation
  createFoodDonationReview: async (foodDonationId: string, reviewData: CreateReviewRequest): Promise<Review> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/food-donations/${foodDonationId}/reviews`, reviewData);
      return response.data.review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Get reviews for a specific food donation with optional filtering by type
  getFoodDonationReviews: async (foodDonationId: string, reviewType?: 'donor' | 'recipient'): Promise<{ reviews: Review[], averageRating: number, totalReviews: number }> => {
    try {
      const url = `${API_BASE_URL}/food-donations/${foodDonationId}/reviews${reviewType ? `?reviewType=${reviewType}` : ''}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching food donation reviews:', error);
      throw error;
    }
  },
  
  // Get review statistics for a food donation
  getFoodDonationReviewStats: async (foodDonationId: string): Promise<{
    overall: { averageRating: number, totalReviews: number },
    donor: { averageRating: number, totalReviews: number },
    recipient: { averageRating: number, totalReviews: number }
  }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/food-donations/${foodDonationId}/review-stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching food donation review stats:', error);
      throw error;
    }
  },

  // Get reviews for a specific food listing
  getFoodListingReviews: async (foodListingId: string): Promise<Review[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reviews/food-listing/${foodListingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching food listing reviews:', error);
      throw error;
    }
  },
};

export { reviewService, type CreateReviewRequest };