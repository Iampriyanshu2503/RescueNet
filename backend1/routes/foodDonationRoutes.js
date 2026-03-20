const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const FoodDonation = require('../models/foodDonationModel');
const User = require('../models/userModel');

/* ── CREATE ── */
router.post('/', protect, async (req, res) => {
  try {
    const { foodType, servings, description, bestBefore, allergens, pickupInstructions, image, location } = req.body;
    let normalizedLocation = location || null;
    if (location?.coordinates) {
      if (Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
        normalizedLocation = { ...location, coordinates: { lat: Number(location.coordinates[0]), lng: Number(location.coordinates[1]) } };
      } else if (typeof location.coordinates === 'object' && 'lat' in location.coordinates) {
        normalizedLocation = { ...location, coordinates: { lat: Number(location.coordinates.lat), lng: Number(location.coordinates.lng) } };
      }
    }
    let expiresAt = new Date(Date.now() + 24 * 3600000);
    let bestBeforeHours;
    if (bestBefore !== undefined && bestBefore !== null && bestBefore !== '') {
      const h = Number(bestBefore);
      if (!isNaN(h) && isFinite(h)) { bestBeforeHours = h; expiresAt = new Date(Date.now() + h * 3600000); }
    }
    const doc = await FoodDonation.create({
      user: req.user._id, donor: req.user._id, foodType, servings, description,
      bestBefore: bestBeforeHours, allergens, pickupInstructions, image,
      location: normalizedLocation, status: 'available', expiresAt,
    });
    if (global.socketServer) { try { await global.socketServer.notifyNewFoodDonation(doc); } catch {} }
    res.status(201).json(doc);
  } catch (err) {
    console.error('Create donation error:', err);
    res.status(err.name === 'ValidationError' ? 400 : 500).json({ message: err.message || 'Server Error' });
  }
});

/* ── GET ALL (available only — for recipients) ── */
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const docs = await FoodDonation.find({
      status: 'available',
      $or: [
        { expiresAt: { $gt: now } },
        { expiresAt: null, bestBefore: { $exists: false } },
        { expiresAt: { $exists: false }, bestBefore: { $exists: false } },
      ],
    }).sort({ createdAt: -1 });

    // Auto-expire overdue listings in background (don't await)
    FoodDonation.updateMany(
      { status: 'available', expiresAt: { $lte: now, $exists: true, $ne: null } },
      { $set: { status: 'expired' } }
    ).catch(() => {});
    res.json(docs);
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

/* ── MY DONATIONS (donor) ── */
router.get('/my-donations', protect, async (req, res) => {
  try {
    const docs = await FoodDonation.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

/* ── MY REQUESTS (recipient orders) ── */
router.get('/my-requests', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const nonAvailableStatuses = ['requested','confirmed','reserved','picked_up','in_transit','completed'];

    // Primary: find by requestedBy field (new docs)
    // Fallback: find non-available docs not owned by this user (legacy docs missing requestedBy)
    const docs = await FoodDonation.find({
      status: { $in: nonAvailableStatuses },
      $or: [
        { requestedBy: userId },
        {
          requestedBy: null,
          user: { $ne: userId },
          donor: { $ne: userId },
        }
      ]
    })
    .sort({ updatedAt: -1 })
    .limit(50);

    res.json(docs);
  } catch (err) {
    console.error('my-requests error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});


/* ── VOLUNTEER FEED — all non-expired listings across all statuses ── */
router.get('/volunteer-feed', protect, async (req, res) => {
  try {
    const docs = await FoodDonation.find({
      status: { $in: ['available','requested','confirmed','reserved','picked_up','in_transit','completed'] },
      $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }, { expiresAt: { $exists: false } }, { status: { $in: ['reserved','picked_up','in_transit','completed'] } }],
    })
    .populate('user', 'name phone email')
    .sort({ createdAt: -1 })
    .limit(200);
    res.json(docs);
  } catch (err) { console.error('Volunteer feed error:', err); res.status(500).json({ message: 'Server Error' }); }
});

/* ── GET BY ID ── */
router.get('/:id', async (req, res) => {
  try {
    const doc = await FoodDonation.findById(req.params.id).populate('user', 'name phone email');
    if (!doc) return res.status(404).json({ message: 'Food donation not found' });
    res.json(doc);
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

/* ── REQUEST (recipient) ── */
router.post('/:id/request', protect, async (req, res) => {
  try {
    const doc = await FoodDonation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Food donation not found' });
    if (doc.status !== 'available') return res.status(400).json({ message: `This listing is no longer available (status: ${doc.status})` });
    if (doc.donor.toString() === req.user._id.toString()) return res.status(400).json({ message: 'You cannot request your own donation' });
    // Server-side expiry check
    if (doc.bestBefore && doc.createdAt) {
      const expiryMs = new Date(doc.createdAt).getTime() + doc.bestBefore * 3_600_000;
      if (Date.now() > expiryMs) {
        // Auto-mark as expired
        doc.status = 'expired';
        await doc.save();
        return res.status(400).json({ message: 'This listing has expired and is no longer available' });
      }
    }

    doc.status = 'requested'; doc.requestedBy = req.user._id;
    doc.requestNotes = req.body.notes || ''; doc.requestedAt = new Date();
    await doc.save();
    if (global.socketServer) { try { await global.socketServer.notifyDonationUpdate(doc, 'requested'); } catch {} }
    res.json({ message: 'Request submitted successfully', donation: doc });
  } catch (err) { console.error('Request error:', err); res.status(500).json({ message: 'Server Error' }); }
});

/* ── APPROVE (donor) ── */
router.post('/:id/approve', protect, async (req, res) => {
  try {
    const doc = await FoodDonation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Food donation not found' });
    if (doc.donor.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Only the donor can approve' });
    if (doc.status !== 'requested') return res.status(400).json({ message: `Cannot approve — status: ${doc.status}` });
    doc.status = 'confirmed'; doc.confirmedAt = new Date();
    await doc.save();
    if (global.socketServer) { try { await global.socketServer.notifyDonationUpdate(doc, 'confirmed'); } catch {} }
    res.json({ message: 'Request approved', donation: doc });
  } catch (err) { console.error('Approve error:', err); res.status(500).json({ message: 'Server Error' }); }
});

/* ── REJECT (donor) ── */
router.post('/:id/reject', protect, async (req, res) => {
  try {
    const doc = await FoodDonation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Food donation not found' });
    if (doc.donor.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Only the donor can reject' });
    if (doc.status !== 'requested') return res.status(400).json({ message: `Cannot reject — status: ${doc.status}` });
    doc.status = 'available'; doc.requestedBy = undefined;
    doc.requestNotes = ''; doc.requestedAt = undefined;
    await doc.save();
    if (global.socketServer) { try { await global.socketServer.notifyDonationUpdate(doc, 'rejected'); } catch {} }
    res.json({ message: 'Request declined', donation: doc });
  } catch (err) { console.error('Reject error:', err); res.status(500).json({ message: 'Server Error' }); }
});

/* ── ACCEPT (volunteer) ── */
router.post('/:id/accept', protect, async (req, res) => {
  try {
    const doc = await FoodDonation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Food donation not found' });
    if (!['available','requested','confirmed'].includes(doc.status))
      return res.status(400).json({ message: `Cannot accept — status: ${doc.status}` });
    doc.status = 'reserved'; doc.volunteerId = req.user._id; doc.acceptedAt = new Date();
    await doc.save();
    if (global.socketServer) { try { await global.socketServer.notifyDonationUpdate(doc, 'accepted'); } catch {} }
    res.json({ message: 'Delivery accepted', donation: doc });
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

/* ── PICKUP (volunteer marks picked up) ── */
router.post('/:id/pickup', protect, async (req, res) => {
  try {
    const doc = await FoodDonation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (doc.status !== 'reserved') return res.status(400).json({ message: `Cannot mark picked up — status: ${doc.status}` });
    if (doc.volunteerId?.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Only the assigned volunteer can update this' });
    doc.status = 'picked_up'; doc.pickedUpAt = new Date();
    await doc.save();
    if (global.socketServer) { try { await global.socketServer.notifyDonationUpdate(doc, 'picked_up'); } catch {} }
    res.json({ message: 'Marked as picked up', donation: doc });
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

/* ── DELIVER (volunteer marks in transit) ── */
router.post('/:id/deliver', protect, async (req, res) => {
  try {
    const doc = await FoodDonation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (doc.status !== 'picked_up') return res.status(400).json({ message: `Cannot mark delivered — status: ${doc.status}` });
    if (doc.volunteerId?.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Only the assigned volunteer can update this' });
    doc.status = 'in_transit'; doc.inTransitAt = new Date();
    await doc.save();
    if (global.socketServer) { try { await global.socketServer.notifyDonationUpdate(doc, 'in_transit'); } catch {} }
    res.json({ message: 'Marked as in transit', donation: doc });
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

/* ── RECEIVED (recipient confirms) ── */
router.post('/:id/received', protect, async (req, res) => {
  try {
    const doc = await FoodDonation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (!['in_transit','picked_up','reserved','confirmed'].includes(doc.status))
      return res.status(400).json({ message: `Cannot confirm receipt — status: ${doc.status}` });

    // Only check ownership if requestedBy is actually set (skip for legacy docs)
    if (doc.requestedBy) {
      if (doc.requestedBy.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'Only the requesting recipient can confirm receipt' });
    }
    // Also block the donor from confirming their own listing
    if (doc.donor.toString() === req.user._id.toString())
      return res.status(403).json({ message: 'Donor cannot confirm receipt' });

    doc.status = 'completed'; doc.completedAt = new Date();
    if (!doc.requestedBy) doc.requestedBy = req.user._id; // backfill for legacy docs
    await doc.save();
    if (global.socketServer) { try { await global.socketServer.notifyDonationUpdate(doc, 'completed'); } catch {} }
    res.json({ message: 'Receipt confirmed', donation: doc });
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

/* ── COMPLETE (volunteer legacy) ── */
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const doc = await FoodDonation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    doc.status = 'completed'; doc.completedAt = new Date();
    await doc.save();
    if (global.socketServer) { try { await global.socketServer.notifyDonationUpdate(doc, 'completed'); } catch {} }
    res.json({ message: 'Delivery completed', donation: doc });
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

/* ── UPDATE (owner) ── */
router.put('/:id', protect, async (req, res) => {
  try {
    const doc = await FoodDonation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (doc.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });
    const old = doc.status;
    const updated = await FoodDonation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (global.socketServer && old !== updated.status) { try { await global.socketServer.notifyDonationUpdate(updated, updated.status); } catch {} }
    res.json(updated);
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

/* ── DELETE ── */
router.delete('/:id', protect, async (req, res) => {
  try {
    const doc = await FoodDonation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (doc.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });
    await FoodDonation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Food donation removed' });
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

/* ── ADD REVIEW ── */
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment, reviewType } = req.body;
    if (!rating || !comment) return res.status(400).json({ message: 'Provide rating and comment' });
    const doc = await FoodDonation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    const already = doc.reviews.find(r => r.user.toString() === req.user._id.toString() && r.reviewType === reviewType);
    if (already) return res.status(400).json({ message: `Already reviewed as ${reviewType}` });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if ((user.role === 'donor' && reviewType !== 'recipient') || (user.role === 'recipient' && reviewType !== 'donor'))
      return res.status(400).json({ message: `As a ${user.role} you can only review the ${user.role === 'donor' ? 'recipient' : 'donor'}` });
    const review = { user: req.user._id, rating: Number(rating), comment, reviewType };
    doc.reviews.push(review);
    doc.averageRating = doc.reviews.reduce((s, r) => s + r.rating, 0) / doc.reviews.length;
    await doc.save();
    if (global.socketServer) { try { await global.socketServer.notifyNewReview(reviewType === 'donor' ? doc.user : req.user._id, doc, review); } catch {} }
    res.status(201).json({ message: 'Review added', review });
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

/* ── GET REVIEWS ── */
router.get('/:id/reviews', async (req, res) => {
  try {
    const { reviewType } = req.query;
    const doc = await FoodDonation.findById(req.params.id).populate({ path: 'reviews.user', select: 'name avatar role' });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    let reviews = doc.reviews;
    if (reviewType && ['donor','recipient'].includes(reviewType)) reviews = reviews.filter(r => r.reviewType === reviewType);
    const avg = reviews.length ? reviews.reduce((s,r)=>s+r.rating,0)/reviews.length : 0;
    res.json({ reviews, averageRating: avg, totalReviews: reviews.length });
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

/* ── REVIEW STATS ── */
router.get('/:id/review-stats', async (req, res) => {
  try {
    const doc = await FoodDonation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    const calc = arr => arr.length ? { averageRating: arr.reduce((s,r)=>s+r.rating,0)/arr.length, totalReviews: arr.length } : { averageRating: 0, totalReviews: 0 };
    res.json({ overall: calc(doc.reviews), donor: calc(doc.reviews.filter(r=>r.reviewType==='donor')), recipient: calc(doc.reviews.filter(r=>r.reviewType==='recipient')) });
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});


/* ── DEBUG: check what recipient sees (remove after testing) ── */
router.get('/debug-recipient', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    // Find ALL non-available docs to see what's in DB
    const all = await FoodDonation.find({
      status: { $in: ['requested','confirmed','reserved','picked_up','in_transit','completed'] }
    }).select('_id status requestedBy user foodType createdAt').lean();

    const mine = all.filter(d =>
      d.requestedBy?.toString() === userId.toString() ||
      d.user?.toString() === userId.toString()
    );

    res.json({
      yourUserId: userId,
      totalNonAvailable: all.length,
      yourOrders: mine.length,
      allNonAvailable: all.map(d => ({
        id: d._id,
        status: d.status,
        foodType: d.foodType,
        requestedBy: d.requestedBy,
        user: d.user,
        isYours: d.requestedBy?.toString() === userId.toString()
      }))
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;