import { FoodDonation } from '../types/foodListing';
import { foodDonationService } from '../services/foodDonationService';
import { showNotification } from './notificationUtils';

/**
 * bestBefore is stored as a decimal string representing HOURS from creation time.
 * e.g. "4" = 4 hours, "4.5" = 4h 30m, "0.5" = 30 minutes
 *
 * It is NOT a date string — do NOT use new Date(listing.bestBefore).
 */
export const isListingExpired = (listing: FoodDonation): boolean => {
  // If backend already marked it expired
  const status = ((listing as any).status || '').toLowerCase().trim();
  if (status === 'expired' || status === 'completed' || status === 'cancelled') return true;

  const bestBeforeHours = parseFloat((listing as any).bestBefore);

  // Guard: if bestBefore is missing or not a valid number, never expire client-side
  if (isNaN(bestBeforeHours) || bestBeforeHours <= 0) {
    return false;
  }

  const createdAt = new Date((listing as any).createdAt).getTime();
  if (isNaN(createdAt)) {
    console.warn(`Invalid createdAt for listing ${listing._id}:`, (listing as any).createdAt);
    return false;
  }

  const expiryTime = createdAt + bestBeforeHours * 3_600_000; // hours → ms
  return Date.now() > expiryTime;
};

/**
 * Filters out expired listings from an array of food listings
 */
export const filterExpiredListings = (listings: FoodDonation[]): FoodDonation[] => {
  return listings.filter(listing => !isListingExpired(listing));
};

/**
 * Checks if a listing is "available" — safely handles undefined/null status
 * from listings created before status field was added.
 */
export const isListingAvailable = (listing: FoodDonation): boolean => {
  const s = ((listing as any).status || '').toLowerCase().trim();
  return s === '' || s === 'available' || s === 'active' || s === 'open';
};

/**
 * Updates expired listings' status to 'expired' in the backend.
 * Only runs on listings that are client-side expired AND
 * have a status that isn't already a terminal state.
 */
export const handleExpiredListings = async (listings: FoodDonation[]): Promise<FoodDonation[]> => {
  const updatedListings = [...listings];

  const toExpire = listings.filter(
    listing => isListingExpired(listing) && isListingAvailable(listing)
  );

  for (const listing of toExpire) {
    try {
      if (!listing._id) {
        console.warn('Skipping listing with no _id:', listing);
        continue;
      }

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

  if (toExpire.length > 0) {
    showNotification.info(
      `${toExpire.length} food listing(s) have been marked as expired.`
    );
  }

  return updatedListings;
};