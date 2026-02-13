const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide restaurant name'],
    trim: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  cuisine: [{
    type: String,
    trim: true
  }],
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true
  },
  image: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  deliveryTime: {
    type: String,
    default: '30-45 mins'
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  minimumOrder: {
    type: Number,
    default: 0,
    min: 0
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  operatingHours: {
    monday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '22:00' },
      isClosed: { type: Boolean, default: false }
    },
    tuesday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '22:00' },
      isClosed: { type: Boolean, default: false }
    },
    wednesday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '22:00' },
      isClosed: { type: Boolean, default: false }
    },
    thursday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '22:00' },
      isClosed: { type: Boolean, default: false }
    },
    friday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '22:00' },
      isClosed: { type: Boolean, default: false }
    },
    saturday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '23:00' },
      isClosed: { type: Boolean, default: false }
    },
    sunday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '23:00' },
      isClosed: { type: Boolean, default: false }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
restaurantSchema.index({ 'address.coordinates': '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);