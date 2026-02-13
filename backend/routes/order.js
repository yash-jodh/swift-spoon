const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const { auth, authorize } = require('../middlewares/auth');

// @route   POST /api/orders
// @desc    Create a new order from cart
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod, specialInstructions } = req.body;

    // Validate required fields
    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || 
        !deliveryAddress.state || !deliveryAddress.zipCode) {
      return res.status(400).json({ 
        success: false,
        message: 'Delivery address is incomplete. Please provide street, city, state, and zipCode.' 
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment method is required' 
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.menuItem')
      .populate('restaurant');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Cart is empty' 
      });
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItems = cart.items.map(item => {
      const itemTotal = item.menuItem.price * item.quantity;
      subtotal += itemTotal;
      
      return {
        menuItem: item.menuItem._id,
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.menuItem.price
      };
    });

    const deliveryFee = cart.restaurant.deliveryFee || 0;
    const tax = subtotal * 0.1; // 10% tax (matching cart)
    const totalAmount = subtotal + deliveryFee + tax;

    // Set initial status and payment status based on payment method
    let initialStatus = 'pending';
    let initialPaymentStatus = 'pending';

    // For Cash on Delivery, auto-confirm the order
    if (paymentMethod === 'cash') {
      initialStatus = 'confirmed'; // Auto-confirm COD orders
      // Payment status stays 'pending' until delivery
    }

    // Create order
    const order = new Order({
      customer: req.user._id,
      restaurant: cart.restaurant._id,
      items: orderItems,
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      status: initialStatus,
      specialInstructions,
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60000) // 45 minutes from now
    });

    await order.save();

    // Clear cart after successful order
    await Cart.findByIdAndDelete(cart._id);

    // Populate order details
    await order.populate('restaurant', 'name phone address image cuisine');
    await order.populate('items.menuItem', 'name image price');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message || 'Error creating order',
      error: error.message 
    });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get current user's orders
// @access  Private
router.get('/my-orders', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { customer: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('restaurant', 'name image phone address')
      .populate('items.menuItem', 'name image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('restaurant', 'name phone address email')
      .populate('items.menuItem', 'name image price')
      .populate('deliveryPartner', 'name phone');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check authorization
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isRestaurantOwner = order.restaurant.owner && order.restaurant.owner.toString() === req.user._id.toString();
    const isDeliveryPartner = order.deliveryPartner && order.deliveryPartner._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isRestaurantOwner && !isDeliveryPartner && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this order' 
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private (Restaurant/Delivery/Admin)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status' 
      });
    }

    const order = await Order.findById(req.params.id).populate('restaurant');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Update status
    order.status = status;

    // Auto-complete payment when order is delivered
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
      
      // For Cash on Delivery, mark payment as completed when delivered
      if (order.paymentMethod === 'cash') {
        order.paymentStatus = 'completed';
        console.log(`✓ COD payment marked as completed for order ${order.orderNumber}`);
      }
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error updating order',
      error: error.message 
    });
  }
});

// @route   PATCH /api/orders/:id/assign-delivery
// @desc    Assign delivery partner to order
// @access  Private (Admin/Delivery)
router.patch('/:id/assign-delivery', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    order.deliveryPartner = req.user._id;
    order.status = 'out-for-delivery';
    
    await order.save();

    res.json({
      success: true,
      message: 'Delivery partner assigned',
      order
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error assigning delivery partner',
      error: error.message 
    });
  }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private (Customer)
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const { cancelReason } = req.body;
    
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Only customer can cancel their order
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to cancel this order' 
      });
    }

    // Can't cancel if already out for delivery or delivered
    if (['out-for-delivery', 'delivered'].includes(order.status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot cancel order at this stage' 
      });
    }

    order.status = 'cancelled';
    order.cancelReason = cancelReason;
    
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error cancelling order',
      error: error.message 
    });
  }
});

// @route   GET /api/orders/restaurant/:restaurantId
// @desc    Get orders for a specific restaurant
// @access  Private (Restaurant owner)
router.get('/restaurant/:restaurantId', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { restaurant: req.params.restaurantId };
    
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name phone')
      .populate('items.menuItem', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
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