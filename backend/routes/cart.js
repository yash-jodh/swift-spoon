const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const { auth } = require('../middlewares/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.menuItem',
        populate: {
          path: 'restaurant',
          select: 'name deliveryFee deliveryTime cuisine'
        }
      })
      .populate('restaurant', 'name deliveryFee deliveryTime cuisine image');

    if (!cart) {
      return res.json({
        success: true,
        cart: { items: [], restaurant: null },
        summary: {
          subtotal: 0,
          deliveryFee: 0,
          tax: 0,
          total: 0,
          itemCount: 0
        }
      });
    }

    // Calculate totals
    let subtotal = 0;
    cart.items.forEach(item => {
      if (item.menuItem) {
        subtotal += item.menuItem.price * item.quantity;
      }
    });

    const deliveryFee = cart.restaurant?.deliveryFee || 0;
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + deliveryFee + tax;

    res.json({
      success: true,
      cart,
      summary: {
        subtotal,
        deliveryFee,
        tax,
        total,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', auth, async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;

    if (!menuItemId || !quantity) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide menuItemId and quantity' 
      });
    }

    // Get menu item
    const menuItem = await MenuItem.findById(menuItemId).populate('restaurant');
    
    if (!menuItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Menu item not found' 
      });
    }

    if (!menuItem.isAvailable) {
      return res.status(400).json({ 
        success: false,
        message: 'This item is currently unavailable' 
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: req.user._id,
        restaurant: menuItem.restaurant._id,
        items: [{ menuItem: menuItemId, quantity }]
      });
    } else {
      // Check if cart is for same restaurant
      if (cart.restaurant && cart.restaurant.toString() !== menuItem.restaurant._id.toString()) {
        return res.status(400).json({ 
          success: false,
          message: 'You can only order from one restaurant at a time. Please clear your cart first.',
          differentRestaurant: true
        });
      }

      // Check if item already in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.menuItem.toString() === menuItemId
      );

      if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({ menuItem: menuItemId, quantity });
      }

      cart.restaurant = menuItem.restaurant._id;
    }

    await cart.save();
    await cart.populate({
      path: 'items.menuItem',
      populate: {
        path: 'restaurant',
        select: 'name deliveryFee cuisine'
      }
    });
    await cart.populate('restaurant', 'name deliveryFee cuisine image');

    // Calculate summary
    let subtotal = 0;
    cart.items.forEach(item => {
      if (item.menuItem) {
        subtotal += item.menuItem.price * item.quantity;
      }
    });

    const deliveryFee = cart.restaurant?.deliveryFee || 0;
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + deliveryFee + tax;

    res.json({
      success: true,
      message: 'Item added to cart',
      cart,
      summary: {
        subtotal,
        deliveryFee,
        tax,
        total,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error adding to cart',
      error: error.message 
    });
  }
});

// @route   PUT /api/cart/item/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/item/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ 
        success: false,
        message: 'Quantity must be at least 1' 
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart not found' 
      });
    }

    const item = cart.items.find(item => item.menuItem.toString() === req.params.itemId);

    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found in cart' 
      });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate({
      path: 'items.menuItem',
      populate: {
        path: 'restaurant',
        select: 'name deliveryFee cuisine'
      }
    });
    await cart.populate('restaurant', 'name deliveryFee cuisine image');

    // Calculate summary
    let subtotal = 0;
    cart.items.forEach(item => {
      if (item.menuItem) {
        subtotal += item.menuItem.price * item.quantity;
      }
    });

    const deliveryFee = cart.restaurant?.deliveryFee || 0;
    const tax = subtotal * 0.1;
    const total = subtotal + deliveryFee + tax;

    res.json({
      success: true,
      message: 'Cart updated',
      cart,
      summary: {
        subtotal,
        deliveryFee,
        tax,
        total,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error updating cart',
      error: error.message 
    });
  }
});

// @route   DELETE /api/cart/item/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/item/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart not found' 
      });
    }

    cart.items = cart.items.filter(
      item => item.menuItem.toString() !== req.params.itemId
    );

    // If cart is empty, remove restaurant reference
    if (cart.items.length === 0) {
      cart.restaurant = null;
    }

    await cart.save();
    await cart.populate({
      path: 'items.menuItem',
      populate: {
        path: 'restaurant',
        select: 'name deliveryFee cuisine'
      }
    });
    await cart.populate('restaurant', 'name deliveryFee cuisine image');

    // Calculate summary
    let subtotal = 0;
    cart.items.forEach(item => {
      if (item.menuItem) {
        subtotal += item.menuItem.price * item.quantity;
      }
    });

    const deliveryFee = cart.restaurant?.deliveryFee || 0;
    const tax = subtotal * 0.1;
    const total = subtotal + deliveryFee + tax;

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart,
      summary: {
        subtotal,
        deliveryFee,
        tax,
        total,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart (alias route for frontend compatibility)
// @access  Private
router.delete('/clear', auth, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;