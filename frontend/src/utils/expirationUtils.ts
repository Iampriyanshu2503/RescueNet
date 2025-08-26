import { FoodDonation } from '../types/foodListing';
import { foodDonationService } from '../services/foodDonationService';
import { showNotification } from './notificationUtils';

/**
 * Checks if a food listing is expired based on its bestBefore timestamp
 * @param listing The food listing to check
 * @returns boolean indicating if the listing is expired
 */
export const isListingExpired = (listing: FoodDonation): boolean => {
  const bestBeforeDate = new Date(listing.bestBefore);

  // Guard against invalid dates
  if (isNaN(bestBeforeDate.getTime())) {
    console.warn(`Invalid bestBefore for listing ${listing._id}:`, listing.bestBefore);
    return false;
  }

  return bestBeforeDate.getTime() < Date.now();
};

/**
 * Filters out expired listings from an array of food listings
 * @param listings Array of food listings to filter
 * @returns Array of non-expired food listings
 */
export const filterExpiredListings = (listings: FoodDonation[]): FoodDonation[] => {
  return listings.filter(listing => !isListingExpired(listing));
};

/**
 * Updates the status of expired listings to 'expired'
 * @param listings Array of food listings to check and update
 * @returns Promise with updated listings
 */
export const handleExpiredListings = async (listings: FoodDonation[]): Promise<FoodDonation[]> => {
  const updatedListings = [...listings];

  const expiredListingsToUpdate = listings.filter(
    listing => isListingExpired(listing) && listing.status === 'available'
  );

  for (const listing of expiredListingsToUpdate) {
  try {
    if (!listing._id) {
      console.warn('Skipping listing with no _id:', listing);
      continue;
    }

    // allow partial updates by casting to Partial<FoodDonation>
    await foodDonationService.update(
      listing._id,
      { status: 'expired' } as Partial<FoodDonation>
    );

    const index = updatedListings.findIndex(item => item._id === listing._id);
    if (index !== -1) {
      updatedListings[index] = { ...updatedListings[index], status: 'expired' };
    }
  } catch (error) {
    console.error(`Failed to update expired listing ${listing._id}:`, error);
  }
}

  if (expiredListingsToUpdate.length > 0) {
    showNotification.info(
      `${expiredListingsToUpdate.length} food listing(s) have been marked as expired.`
    );
  }

  return updatedListings;
};
