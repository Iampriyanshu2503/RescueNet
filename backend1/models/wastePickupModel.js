const mongoose = require('mongoose');

const wastePickupSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    wasteType: {
      type: String,
      required: true,
    },
    estimatedWeight: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    preferredDate: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    specialInstructions: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'scheduled', 'completed', 'cancelled'],
    },
  },
  {
    timestamps: true,
  }
);

const WastePickup = mongoose.model('WastePickup', wastePickupSchema);

module.exports = WastePickup;