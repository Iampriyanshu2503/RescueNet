import { FoodDonation } from '../types/foodListing';
import { User } from '../types/auth';

/**
 * Filters food listings based on user type and visibility rules
 * @param listings All available food listings
 * @param user Current authenticated user
 * @returns Filtered listings based on user role
 */
export const filterListingsByUserRole = (
  listings: FoodDonation[],
  user: User | null
): FoodDonation[] => {
  if (!user) return [];

  switch (user.role) {
    case 'donor':
      // Donors can see their own listings
      return listings.filter(listing => listing.user === user._id);
    
    case 'recipient':
      // Recipients can see all available listings
      return listings.filter(listing => listing.status === 'available');
    
    case 'volunteer':
      // Volunteers can see all listings
      return listings;
    
    default:
      return [];
  }
};

/**
 * Determines if a user can edit a specific listing
 * @param listing The food listing
 * @param user Current authenticated user
 * @returns Boolean indicating if user can edit the listing
 */
export const canEditListing = (
  listing: FoodDonation,
  user: User | null
): boolean => {
  if (!user) return false;
  
  // Only the donor who created the listing can edit it
  return user.role === 'donor' && listing.user === user._id;
};