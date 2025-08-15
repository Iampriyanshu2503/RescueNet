const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['donor', 'recipient', 'admin'],
        required: [true, 'Role is required']
    },
    profile: {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        phone: {
            type: String,
            match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
        },
        campusLocation: {
            type: String,
            required: [true, 'Campus location is required']
        },
        organization: String, // canteen name, hostel, NGO, etc.
        bio: String
    },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        categories: [{
            type: String,
            enum: ['vegetarian', 'non-vegetarian', 'vegan', 'snacks', 'main-course', 'beverages', 'fruits']
        }],
        radius: { type: Number, default: 1000 } // notification radius in meters
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isActive: { type: Boolean, default: true },
    stats: {
        itemsDonated: { type: Number, default: 0 },
        itemsClaimed: { type: Number, default: 0 },
        foodSaved: { type: Number, default: 0 }, // in kg
        rating: { type: Number, default: 0, min: 0, max: 5 }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ 'profile.campusLocation': 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.verificationToken;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpire;
    return userObject;
};

module.exports = mongoose.model('User', userSchema);