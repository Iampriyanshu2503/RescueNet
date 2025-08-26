export interface FoodDonation {
  _id: string;
  user: string;
  foodType: string;
  servings: string;
  description: string;
  bestBefore: string;
  allergens?: string[];
  pickupInstructions?: string;
  image?: string;
  status: 'available' | 'reserved' | 'completed' | 'expired';
  location?: {
    address?: string;
    coordinates?: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodDonationRequest {
  foodType: string;
  servings: string;
  description: string;
  bestBefore: string;
  allergens?: string[];
  pickupInstructions?: string;
  image?: string;
  location?: {
    address?: string;
    coordinates?: [number, number];
  };
}

export interface WastePickup {
  _id: string;
  user: string;
  wasteType: string;
  estimatedWeight: string;
  description: string;
  preferredDate: string;
  timeSlot: string;
  pickupAddress: string;
  specialInstructions?: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateWastePickupRequest {
  wasteType: string;
  estimatedWeight: string;
  description: string;
  preferredDate: string;
  timeSlot: string;
  pickupAddress: string;
  specialInstructions?: string;
}
