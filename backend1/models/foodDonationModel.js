const mongoose = require('mongoose');

const foodDonationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    foodType: {
      type: String,
      required: true,
    },
    servings: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    bestBefore: {
      type: String,
      required: true,
    },
    allergens: {
      type: [String],
      default: [],
    },
    pickupInstructions: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      required: true,
      default: 'available',
      enum: ['available', 'reserved', 'completed', 'expired'],
    },
  },
  {
    timestamps: true,
  }
);

const FoodDonation = mongoose.model('FoodDonation', foodDonationSchema);

module.exports = FoodDonation;