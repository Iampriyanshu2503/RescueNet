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
    location: {
      type: Object,
      required: true,
      properties: {
        address: { type: String },
        coordinates: {
          lat: { type: Number },
          lng: { type: Number }
        },
        type: { type: String }
      }
    },
    status: {
      type: String,
      required: true,
      default: 'available',
      enum: ['available', 'reserved', 'completed', 'expired'],
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5
        },
        comment: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
  },
  {
    timestamps: true,
  }
);

const FoodDonation = mongoose.model('FoodDonation', foodDonationSchema);

module.exports = FoodDonation;