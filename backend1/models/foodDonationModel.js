const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating:     { type: Number, min: 1, max: 5, required: true },
    comment:    { type: String, required: true },
    reviewType: { type: String, enum: ['donor', 'recipient'], required: true }
  },
  { timestamps: true }
);

const coordinatesSchema = new mongoose.Schema(
  { lat: { type: Number }, lng: { type: Number } },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    address:     { type: String },
    coordinates: { type: coordinatesSchema }
  },
  { _id: false }
);

const foodDonationSchema = new mongoose.Schema(
  {
    /* ── Core fields ── */
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donor:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodType: { type: String, required: true },
    servings: { type: Number, required: true, min: 1 },
    description:      { type: String, default: '' },
    bestBefore:       { type: Number },
    allergens:        { type: [String], default: [] },
    pickupInstructions: { type: String, default: '' },
    image:            { type: String, default: '' },
    location:         { type: locationSchema },

    /* ── Status — full lifecycle ── */
    status: {
      type: String,
      enum: [
        'available',   // just listed
        'requested',   // recipient requested it
        'confirmed',   // donor approved the request  ← WAS MISSING
        'reserved',    // volunteer accepted pickup    ← WAS MISSING
        'picked_up',   // volunteer picked up food
        'in_transit',  // en route to recipient
        'completed',   // delivered successfully
        'claimed',     // legacy alias for completed
        'expired',     // past bestBefore time
        'cancelled',   // cancelled by any party
        'removed',     // admin removed
      ],
      default: 'available'
    },

    expiresAt: { type: Date },

    /* ── Request tracking ── */
    requestedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestNotes:  { type: String, default: '' },
    requestedAt:   { type: Date },

    /* ── Approval tracking ── */
    confirmedAt:   { type: Date },

    /* ── Volunteer tracking ── */
    volunteerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acceptedAt:    { type: Date },
    completedAt:   { type: Date },
    pickedUpAt:    { type: Date },
    inTransitAt:   { type: Date },

    /* ── Reviews ── */
    reviews:       { type: [reviewSchema], default: [] },
    averageRating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

foodDonationSchema.index({ createdAt: -1 });
foodDonationSchema.index({ status: 1 });
foodDonationSchema.index({ requestedBy: 1 });
foodDonationSchema.index({ donor: 1 });

module.exports = mongoose.model('FoodDonation', foodDonationSchema);