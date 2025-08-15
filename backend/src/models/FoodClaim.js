const mongoose = require('mongoose');

const foodClaimSchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodListing',
        required: [true, 'Food listing is required']
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recipient is required']
    },
    quantityClaimed: {
        type: Number,
        required: [true, 'Quantity claimed is required'],
        min: [1, 'Must claim at least 1 unit']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'picked_up', 'cancelled', 'no_show', 'completed'],
        default: 'pending'
    },
    estimatedPickupTime: {
        type: Date,
        required: [true, 'Estimated pickup time is required']
    },
    actualPickupTime: Date,
    notes: {
        type: String,
        maxlength: [200, 'Notes cannot exceed 200 characters']
    },
    rating: {
        score: {
            type: Number,
            min: [1, 'Rating must be between 1 and 5'],
            max: [5, 'Rating must be between 1 and 5']
        },
        comment: {
            type: String,
            maxlength: [300, 'Comment cannot exceed 300 characters']
        },
        ratedAt: Date
    },
    cancellationReason: {
        type: String,
        enum: ['donor_unavailable', 'recipient_unavailable', 'food_spoiled', 'emergency', 'other']
    },
    pickupCode: {
        type: String,
        length: 6
    } // 6-digit code for pickup verification
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound indexes
foodClaimSchema.index({ listing: 1, recipient: 1 }, { unique: true }); // Prevent duplicate claims
foodClaimSchema.index({ recipient: 1, status: 1 });
foodClaimSchema.index({ listing: 1, status: 1 });
foodClaimSchema.index({ estimatedPickupTime: 1 });

// Generate pickup code before saving
foodClaimSchema.pre('save', function (next) {
    if (this.isNew && this.status === 'confirmed') {
        this.pickupCode = Math.floor(100000 + Math.random() * 900000).toString();
    }
    next();
});

// Virtual for claim duration
foodClaimSchema.virtual('duration').get(function () {
    if (!this.actualPickupTime) return null;
    return this.actualPickupTime - this.createdAt;
});

module.exports = mongoose.model('FoodClaim', foodClaimSchema);