import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

interface CreateReviewRequest {
  rating: number;
  comment: string;
  reviewerId: string;
  revieweeId: string;
  foodListingId: string;
  reviewerRole: string;
  revieweeRole: string;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  reviewerId: string;
  revieweeId: string;
  foodListingId: string;
  reviewerRole: string;
  revieweeRole: string;
  createdAt: string;
  updatedAt: string;
}

const reviewService = {
  // Create a new review
  create: async (reviewData: CreateReviewRequest): Promise<Review> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Get reviews for a user (as donor or recipient)
  getUserReviews: async (userId: string, role: string): Promise<Review[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reviews/user/${userId}?role=${role}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
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