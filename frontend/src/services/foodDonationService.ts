import api from './api';
import { FoodDonation, CreateFoodDonationRequest } from '../types/foodListing';

export const foodDonationService = {
  // Create a new food donation
  create: async (donationData: CreateFoodDonationRequest): Promise<FoodDonation> => {
    const response = await api.post('/food-donations', donationData);
    return response.data;
  },

  // Get all food donations
  getAll: async (): Promise<FoodDonation[]> => {
    const response = await api.get('/food-donations');
    return response.data;
  },

  // Get user's food donations
  getMyDonations: async (): Promise<FoodDonation[]> => {
    const response = await api.get('/food-donations/my-donations');
    return response.data;
  },

  // Get a single food donation
  getById: async (id: string): Promise<FoodDonation> => {
    const response = await api.get(`/food-donations/${id}`);
    return response.data;
  },

  // Update a food donation
  update: async (id: string, donationData: Partial<CreateFoodDonationRequest>): Promise<FoodDonation> => {
    const response = await api.put(`/food-donations/${id}`, donationData);
    return response.data;
  },

  // Delete a food donation
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/food-donations/${id}`);
    return response.data;
  }
};

export default foodDonationService;
