const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    reviewType: { type: String, enum: ['donor', 'recipient'], required: true }
  },
  { timestamps: true }
);

const coordinatesSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number }
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    address: { type: String },
    coordinates: { type: coordinatesSchema }
  },
  { _id: false }
);

const foodDonationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodType: { type: String, required: true },
    servings: { type: Number, required: true, min: 1 },
    description: { type: String, default: '' },
    bestBefore: { type: Number },
    allergens: { type: [String], default: [] },
    pickupInstructions: { type: String, default: '' },
    image: { type: String, default: '' },
    location: { type: locationSchema },
    status: {
      type: String,
      enum: ['available', 'requested', 'claimed', 'completed', 'expired', 'cancelled', 'removed'],
      default: 'available'
    },
    expiresAt: { type: Date },
    reviews: { type: [reviewSchema], default: [] },
    averageRating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

foodDonationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FoodDonation', foodDonationSchema);
