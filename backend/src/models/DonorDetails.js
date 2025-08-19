const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const donorDetailsSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [
            /^[\+]?[1-9][\d]{0,15}$/,
            'Please enter a valid phone number'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Don't include password in queries by default
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters']
    },
    organization: {
        type: String,
        required: [true, 'Organization type is required'],
        enum: {
            values: [
                'restaurant',
                'cafe',
                'bakery',
                'canteen',
                'hotel',
                'catering',
                'grocery',
                'supermarket',
                'food_court',
                'individual',
                'other'
            ],
            message: 'Please select a valid organization type'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalDonations: {
        type: Number,
        default: 0
    },
    lastDonationDate: {
        type: Date
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    profileImage: {
        type: String, // URL to profile image
        default: null
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
donorDetailsSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for organization display name
donorDetailsSchema.virtual('organizationDisplay').get(function () {
    const orgMap = {
        'restaurant': 'Restaurant',
        'cafe': 'Cafe',
        'bakery': 'Bakery',
        'canteen': 'Canteen',
        'hotel': 'Hotel',
        'catering': 'Catering Service',
        'grocery': 'Grocery Store',
        'supermarket': 'Supermarket',
        'food_court': 'Food Court',
        'individual': 'Individual',
        'other': 'Other'
    };
    return orgMap[this.organization] || this.organization;
});

// Index for faster queries
donorDetailsSchema.index({ email: 1 });
donorDetailsSchema.index({ organization: 1 });
donorDetailsSchema.index({ registrationDate: -1 });
donorDetailsSchema.index({ verificationStatus: 1 });

// Pre-save middleware to hash password
donorDetailsSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
donorDetailsSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Instance method to update last donation date
donorDetailsSchema.methods.recordDonation = function () {
    this.lastDonationDate = new Date();
    this.totalDonations += 1;
    return this.save();
};

// Static method to find donors by organization type
donorDetailsSchema.statics.findByOrganization = function (organizationType) {
    return this.find({
        organization: organizationType,
        isActive: true,
        verificationStatus: 'verified'
    });
};

// Static method to get donor statistics
donorDetailsSchema.statics.getDonorStats = async function () {
    try {
        const stats = await this.aggregate([
            {
                $group: {
                    _id: '$organization',
                    count: { $sum: 1 },
                    totalDonations: { $sum: '$totalDonations' },
                    averageDonations: { $avg: '$totalDonations' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        return stats;
    } catch (error) {
        throw error;
    }
};

// Pre-remove middleware to clean up related data
donorDetailsSchema.pre('remove', async function (next) {
    try {
        // Here you can add logic to clean up related data
        // For example, remove donations, notifications, etc.
        console.log(`Cleaning up data for donor: ${this.fullName}`);
        next();
    } catch (error) {
        next(error);
    }
});

// Transform JSON output to remove sensitive data
donorDetailsSchema.methods.toJSON = function () {
    const donorObject = this.toObject();
    delete donorObject.password;
    return donorObject;
};

const DonorDetails = mongoose.model('DonorDetails', donorDetailsSchema);

module.exports = DonorDetails;