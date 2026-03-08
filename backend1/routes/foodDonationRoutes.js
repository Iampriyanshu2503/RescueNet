const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const FoodDonation = require('../models/foodDonationModel');
const User = require('../models/userModel');

// @desc    Create a new food donation
// @route   POST /api/food-donations
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { foodType, servings, description, bestBefore, allergens, pickupInstructions, image, location } = req.body;

    // Normalize location coordinates shape for sockets/queries
    let normalizedLocation = location || null;
    if (location && location.coordinates) {
      if (Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
        // Frontend may send [lat, lng]
        normalizedLocation = {
          ...location,
          coordinates: { lat: Number(location.coordinates[0]), lng: Number(location.coordinates[1]) }
        };
      } else if (typeof location.coordinates === 'object' &&
                 'lat' in location.coordinates && 'lng' in location.coordinates) {
        normalizedLocation = {
          ...location,
          coordinates: { lat: Number(location.coordinates.lat), lng: Number(location.coordinates.lng) }
        };
      }
    }

    // Compute expiresAt: if bestBefore is hours (string/number), convert to Date
    let expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // default 24h
    let bestBeforeHours = undefined;
    if (bestBefore !== undefined && bestBefore !== null && bestBefore !== '') {
      const hours = Number(bestBefore);
      if (!Number.isNaN(hours) && Number.isFinite(hours)) {
        bestBeforeHours = hours;
        expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      } else {
        const parsed = new Date(bestBefore);
        if (!isNaN(parsed.getTime())) {
          expiresAt = parsed;
        }
      }
    }

    const foodDonation = await FoodDonation.create({
      user: req.user._id,
      donor: req.user._id,
      foodType,
      servings,
      description,
      bestBefore: bestBeforeHours,
      allergens,
      pickupInstructions,
      image,
      location: normalizedLocation,
      status: 'available',
      expiresAt
    });

    // Send notification to pre-registered customers
    if (global.socketServer) {
      await global.socketServer.notifyNewFoodDonation(foodDonation);
    }

    res.status(201).json(foodDonation);
  } catch (error) {
    console.error('Create donation error:', error);
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all food donations
// @route   GET /api/food-donations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const foodDonations = await FoodDonation.find({}).sort({ createdAt: -1 });
    res.json(foodDonations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get user's food donations
// @route   GET /api/food-donations/my-donations
// @access  Private
router.get('/my-donations', protect, async (req, res) => {
  try {
    const foodDonations = await FoodDonation.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(foodDonations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get a single food donation
// @route   GET /api/food-donations/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const foodDonation = await FoodDonation.findById(req.params.id);
    
    if (!foodDonation) {
      return res.status(404).json({ message: 'Food donation not found' });
    }
    
    res.json(foodDonation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a food donation
// @route   PUT /api/food-donations/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const foodDonation = await FoodDonation.findById(req.params.id);
    
    if (!foodDonation) {
      return res.status(404).json({ message: 'Food donation not found' });
    }
    
    // Check if the user owns the food donation
    if (foodDonation.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const oldStatus = foodDonation.status;
    const updatedFoodDonation = await FoodDonation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    // Send notification if status changed
    if (global.socketServer && oldStatus !== updatedFoodDonation.status) {
      await global.socketServer.notifyDonationUpdate(updatedFoodDonation, updatedFoodDonation.status);
    }
    
    res.json(updatedFoodDonation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a food donation
// @route   DELETE /api/food-donations/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const foodDonation = await FoodDonation.findById(req.params.id);
    
    if (!foodDonation) {
      return res.status(404).json({ message: 'Food donation not found' });
    }
    
    // Check if the user owns the food donation
    if (foodDonation.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await FoodDonation.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Food donation removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Add a review to a food donation
// @route   POST /api/food-donations/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment, reviewType } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Please provide both rating and comment' });
    }
    
    const foodDonation = await FoodDonation.findById(req.params.id);
    
    if (!foodDonation) {
      return res.status(404).json({ message: 'Food donation not found' });
    }
    
    // Check if user has already reviewed this donation with the same review type
    const alreadyReviewed = foodDonation.reviews.find(
      (review) => review.user.toString() === req.user._id.toString() && 
                 review.reviewType === reviewType
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ message: `You have already submitted a ${reviewType} review for this donation` });
    }
    
    // Validate review type based on user role
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Donors can only review recipients, recipients can only review donors
    if ((user.role === 'donor' && reviewType !== 'recipient') || 
        (user.role === 'recipient' && reviewType !== 'donor')) {
      return res.status(400).json({ 
        message: `As a ${user.role}, you can only review the ${user.role === 'donor' ? 'recipient' : 'donor'}` 
      });
    }
    
    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment,
      reviewType, // Store whether this is a donor or recipient review
    };
    
    foodDonation.reviews.push(review);
    
    // Calculate and update average rating
    const totalRatings = foodDonation.reviews.reduce((sum, item) => sum + item.rating, 0);
    foodDonation.averageRating = totalRatings / foodDonation.reviews.length;
    
    await foodDonation.save();
    
    // If there's a socket server, notify the appropriate user about the new review
    if (global.socketServer) {
      // If donor is reviewing recipient, notify recipient
      // If recipient is reviewing donor, notify donor
      const notifyUserId = reviewType === 'donor' ? foodDonation.user : req.user._id;
      await global.socketServer.notifyNewReview(notifyUserId, foodDonation, review);
    }
    
    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all reviews for a food donation
// @route   GET /api/food-donations/:id/reviews
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const { reviewType } = req.query;
    
    const foodDonation = await FoodDonation.findById(req.params.id).populate({
      path: 'reviews.user',
      select: 'name avatar role'
    });
    
    if (!foodDonation) {
      return res.status(404).json({ message: 'Food donation not found' });
    }
    
    // If reviewType is specified, filter reviews by type
    let reviews = foodDonation.reviews;
    if (reviewType && ['donor', 'recipient'].includes(reviewType)) {
      reviews = reviews.filter(review => review.reviewType === reviewType);
    }
    
    // Calculate average rating for the filtered reviews
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
    }
    
    res.json({
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get review statistics for a food donation
// @route   GET /api/food-donations/:id/review-stats
// @access  Public
router.get('/:id/review-stats', async (req, res) => {
  try {
    const foodDonation = await FoodDonation.findById(req.params.id);
    
    if (!foodDonation) {
      return res.status(404).json({ message: 'Food donation not found' });
    }
    
    // Calculate statistics for donor and recipient reviews separately
    const donorReviews = foodDonation.reviews.filter(review => review.reviewType === 'donor');
    const recipientReviews = foodDonation.reviews.filter(review => review.reviewType === 'recipient');
    
    const calculateStats = (reviews) => {
      if (reviews.length === 0) return { averageRating: 0, totalReviews: 0 };
      
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      return {
        averageRating: totalRating / reviews.length,
        totalReviews: reviews.length
      };
    };
    
    res.json({
      overall: calculateStats(foodDonation.reviews),
      donor: calculateStats(donorReviews),
      recipient: calculateStats(recipientReviews)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
