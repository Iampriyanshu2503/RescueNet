import api from './api';
import { WastePickup, CreateWastePickupRequest } from '../types/foodListing';

export const wastePickupService = {
  // Create a new waste pickup request
  create: async (pickupData: CreateWastePickupRequest): Promise<WastePickup> => {
    const response = await api.post('/waste-pickups', pickupData);
    return response.data;
  },

  // Get all waste pickup requests
  getAll: async (): Promise<WastePickup[]> => {
    const response = await api.get('/waste-pickups');
    return response.data;
  },

  // Get user's waste pickup requests
  getMyPickups: async (): Promise<WastePickup[]> => {
    const response = await api.get('/waste-pickups/my-pickups');
    return response.data;
  },

  // Get a single waste pickup request
  getById: async (id: string): Promise<WastePickup> => {
    const response = await api.get(`/waste-pickups/${id}`);
    return response.data;
  },

  // Update a waste pickup request
  update: async (id: string, pickupData: Partial<CreateWastePickupRequest>): Promise<WastePickup> => {
    const response = await api.put(`/waste-pickups/${id}`, pickupData);
    return response.data;
  },

  // Delete a waste pickup request
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/waste-pickups/${id}`);
    return response.data;
  }
};

export default wastePickupService;
