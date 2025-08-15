const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Donor is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    foodType: {
        type: String,
        required: [true, 'Food type is required'],
        enum: ['vegetarian', 'non-vegetarian', 'vegan', 'egg-vegetarian']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['main-course', 'snacks', 'beverages', 'fruits', 'desserts', 'bread', 'other']
    },
    quantity: {
        amount: {
            type: Number,
            required: [true, 'Quantity amount is required'],
            min: [1, 'Quantity must be at least 1']
        },
        unit: {
            type: String,
            required: [true, 'Quantity unit is required'],
            enum: ['servings', 'kg', 'grams', 'plates', 'pieces', 'liters', 'ml', 'packets']
        }
    },
    freshness: {
        preparedAt: {
            type: Date,
            required: [true, 'Preparation time is required']
        },
        safeForHours: {
            type: Number,
            required: [true, 'Safe consumption hours required'],
            min: [1, 'Must be safe for at least 1 hour'],
            max: [48, 'Cannot be safe for more than 48 hours']
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    pickup: {
        location: {
            type: String,
            required: [true, 'Pickup location is required']
        },
        coordinates: {
            lat: {
                type: Number,
                min: [-90, 'Invalid latitude'],
                max: [90, 'Invalid latitude']
            },
            lng: {
                type: Number,
                min: [-180, 'Invalid longitude'],
                max: [180, 'Invalid longitude']
            }
        },
        windowStart: {
            type: Date,
            required: [true, 'Pickup window start is required']
        },
        windowEnd: {
            type: Date,
            required: [true, 'Pickup window end is required']
        }
    },
    photos: [{
        type: String,
        match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i, 'Invalid image URL']
    }],
    specialInstructions: {
        type: String,
        maxlength: [300, 'Special instructions cannot exceed 300 characters']
    },
    status: {
        type: String,
        enum: ['available', 'partially_claimed', 'fully_claimed', 'expired', 'completed'],
        default: 'available'
    },
    tags: [{
        type: String,
        enum: ['allergen-free', 'contains-nuts', 'contains-dairy', 'gluten-free', 'spicy', 'sweet', 'homemade', 'restaurant-quality']
    }],
    availableQuantity: {
        type: Number,
        required: true,
        min: [0, 'Available quantity cannot be negative']
    },
    totalClaims: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isUrgent: { type: Boolean, default: false }, // expires in < 2 hours
    environmentalImpact: {
        co2Saved: { type: Number, default: 0 }, // in kg
        waterSaved: { type: Number, default: 0 }, // in liters
        estimatedValue: { type: Number, default: 0 } // in currency
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance and queries
foodListingSchema.index({ donor: 1, status: 1 });
foodListingSchema.index({ status: 1, 'pickup.windowEnd': 1 });
foodListingSchema.index({ foodType: 1, category: 1 });
foodListingSchema.index({ 'pickup.coordinates': '2dsphere' }); // For geospatial queries
foodListingSchema.index({ expiresAt: 1 }); // For TTL or cleanup jobs
foodListingSchema.index({ createdAt: -1 }); // For recent listings

// Pre-save middleware to calculate expiry time
foodListingSchema.pre('save', function (next) {
    if (this.isModified('freshness.preparedAt') || this.isModified('freshness.safeForHours')) {
        const expiryTime = new Date(this.freshness.preparedAt);
        expiryTime.setHours(expiryTime.getHours() + this.freshness.safeForHours);
        this.freshness.expiresAt = expiryTime;
    }

    // Set initial available quantity
    if (this.isNew) {
        this.availableQuantity = this.quantity.amount;
    }

    // Mark as urgent if expires in < 2 hours
    const now = new Date();
    const hoursUntilExpiry = (this.freshness.expiresAt - now) / (1000 * 60 * 60);
    this.isUrgent = hoursUntilExpiry < 2 && hoursUntilExpiry > 0;

    next();
});

// Virtual for time remaining
foodListingSchema.virtual('timeRemaining').get(function () {
    const now = new Date();
    const timeLeft = this.freshness.expiresAt - now;
    return Math.max(0, Math.floor(timeLeft / (1000 * 60))); // minutes remaining
});

// Virtual for pickup window status
foodListingSchema.virtual('pickupStatus').get(function () {
    const now = new Date();
    if (now < this.pickup.windowStart) return 'upcoming';
    if (now > this.pickup.windowEnd) return 'expired';
    return 'active';
});

module.exports = mongoose.model('FoodListing', foodListingSchema);