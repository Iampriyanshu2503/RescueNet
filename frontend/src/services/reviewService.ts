import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

interface CreateReviewRequest {
  rating: number;
  comment: string;
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
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

  // Get reviews for a specific food donation
  getFoodDonationReviews: async (foodDonationId: string): Promise<Review[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/food-donations/${foodDonationId}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Error fetching food donation reviews:', error);
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

export { reviewService, type Review, type CreateReviewRequest };