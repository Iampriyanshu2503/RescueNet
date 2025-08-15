const mongoose = require('mongoose');

const campusEventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: [true, 'Event name is required'],
        trim: true
    },
    description: String,
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Organizer is required']
    },
    location: {
        type: String,
        required: [true, 'Event location is required']
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required']
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required']
    },
    expectedAttendees: {
        type: Number,
        min: [1, 'Expected attendees must be at least 1']
    },
    eventType: {
        type: String,
        enum: ['seminar', 'workshop', 'festival', 'conference', 'meeting', 'celebration', 'other'],
        required: true
    },
    foodArrangement: {
        hasFood: { type: Boolean, default: false },
        estimatedLeftovers: Number, // in servings
        cateringDetails: String
    },
    reminders: {
        beforeEvent: { type: Boolean, default: false },
        afterEvent: { type: Boolean, default: false },
        reminderSent: { type: Date }
    },
    foodLogged: {
        type: Boolean,
        default: false
    },
    associatedListings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodListing'
    }]
}, {
    timestamps: true
});

// Indexes
campusEventSchema.index({ organizer: 1, startTime: -1 });
campusEventSchema.index({ startTime: 1, endTime: 1 });
campusEventSchema.index({ 'foodArrangement.hasFood': 1, foodLogged: 1 });

module.exports = mongoose.model('CampusEvent', campusEventSchema);