const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const { auth } = require('../middlewares/auth');

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { restaurant, order, rating, comment, foodRating, deliveryRating } = req.body;

    // Verify order exists and belongs to user
    if (order) {
      const orderDoc = await Order.findById(order);
      if (!orderDoc) {
        return res.status(404).json({ 
          success: false,
          message: 'Order not found' 
        });
      }

      if (orderDoc.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false,
          message: 'Not authorized' 
        });
      }

      if (orderDoc.status !== 'delivered') {
        return res.status(400).json({ 
          success: false,
          message: 'Can only review delivered orders' 
        });
      }
    }

    // Create review
    const review = new Review({
      user: req.user._id,
      restaurant,
      order,
      rating,
      comment,
      foodRating,
      deliveryRating,
      isVerifiedPurchase: order ? true : false
    });

    await review.save();

    // Update restaurant rating
    const reviews = await Review.find({ restaurant });
    const avgRating = reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length;
    
    await Restaurant.findByIdAndUpdate(restaurant, {
      rating: avgRating.toFixed(1),
      totalReviews: reviews.length
    });

    await review.populate('user', 'name profileImage');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    // Handle duplicate review error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already reviewed this order' 
      });
    }
    res.status(400).json({ 
      success: false,
      message: 'Error creating review',
      error: error.message 
    });
  }
});

// @route   GET /api/reviews/restaurant/:restaurantId
// @desc    Get all reviews for a restaurant
// @access  Public
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { rating, limit = 10, page = 1 } = req.query;
    
    let query = { restaurant: req.params.restaurantId };
    
    if (rating) {
      query.rating = parseInt(rating);
    }

    const reviews = await Review.find(query)
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      reviews
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/reviews/user/my-reviews
// @desc    Get current user's reviews
// @access  Private
router.get('/user/my-reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('restaurant', 'name image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private (Review owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: 'Review not found' 
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this review' 
      });
    }

    const { rating, comment, foodRating, deliveryRating } = req.body;

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (foodRating) review.foodRating = foodRating;
    if (deliveryRating) review.deliveryRating = deliveryRating;

    await review.save();

    // Update restaurant rating
    const reviews = await Review.find({ restaurant: review.restaurant });
    const avgRating = reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length;
    
    await Restaurant.findByIdAndUpdate(review.restaurant, {
      rating: avgRating.toFixed(1)
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error updating review',
      error: error.message 
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private (Review owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: 'Review not found' 
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this review' 
      });
    }

    const restaurantId = review.restaurant;
    await review.deleteOne();

    // Update restaurant rating
    const reviews = await Review.find({ restaurant: restaurantId });
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length 
      : 0;
    
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: avgRating.toFixed(1),
      totalReviews: reviews.length
    });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/reviews/:id/response
// @desc    Restaurant owner responds to review
// @access  Private (Restaurant owner)
router.post('/:id/response', auth, async (req, res) => {
  try {
    const { responseText } = req.body;
    
    const review = await Review.findById(req.params.id).populate('restaurant');

    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: 'Review not found' 
      });
    }

    // Check if user is restaurant owner
    if (review.restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    review.response = {
      text: responseText,
      respondedAt: new Date()
    };

    await review.save();

    res.json({
      success: true,
      message: 'Response added successfully',
      review
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error adding response',
      error: error.message 
    });
  }
});

module.exports = router;