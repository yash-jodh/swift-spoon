const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

dotenv.config();

// Sample restaurant data with realistic Indian locations
const sampleRestaurants = [
  {
    name: "Pizza Paradise",
    description: "Authentic Italian pizzas with a modern twist. Fresh ingredients, wood-fired oven.",
    cuisine: ["Italian", "Pizza", "Fast Food"],
    address: {
      street: "Shop 12, Phoenix Market City",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400013",
      coordinates: {
        latitude: 19.0896,
        longitude: 72.8656
      }
    },
    phone: "+91 22 1234 5678",
    email: "info@pizzaparadise.com",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
    deliveryFee: 40,
    deliveryTime: "25-35 mins",
    minimumOrder: 200,
    rating: 4.5,
    isFeatured: true,
    isOpen: true
  },
  {
    name: "Sushi House",
    description: "Fresh sushi and authentic Japanese cuisine daily",
    image: "https://creator.nightcafe.studio/jobs/OQrXhnbYt1mAxYMs0xcQ/OQrXhnbYt1mAxYMs0xcQ--1--ayzgi.jpg",
    cuisine: ["Japanese", "Sushi", "Asian"],
    address: {
      street: "456 Oak Avenue, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400050",
      coordinates: {
        latitude: 19.0596,
        longitude: 72.8295
      }
    },
    phone: "+91 22 2345 6789",
    email: "contact@sushihouse.com",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
    deliveryFee: 60,
    deliveryTime: "40-50 mins",
    minimumOrder: 300,
    rating: 4.7,
    isFeatured: true,
    isOpen: true
  },
  {
    name: "Spice Garden",
    description: "Traditional Indian cuisine with modern presentation",
    cuisine: ["Indian", "North Indian", "Vegetarian"],
    address: {
      street: "789 MG Road",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411001",
      coordinates: {
        latitude: 18.5204,
        longitude: 73.8567
      }
    },
    phone: "+91 20 3456 7890",
    email: "hello@spicegarden.in",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
    deliveryFee: 30,
    deliveryTime: "30-40 mins",
    minimumOrder: 250,
    rating: 4.3,
    isFeatured: true,
    isOpen: true
  },
  {
    name: "Burger Bros",
    description: "Gourmet burgers and crispy fries. 100% pure beef.",
    cuisine: ["American", "Burgers", "Fast Food"],
    address: {
      street: "Shop 5, Inorbit Mall",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400064",
      coordinates: {
        latitude: 19.1759,
        longitude: 72.9476
      }
    },
    phone: "+91 22 4567 8901",
    email: "orders@burgerbros.com",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    deliveryFee: 35,
    deliveryTime: "20-30 mins",
    minimumOrder: 150,
    rating: 4.4,
    isFeatured: true,
    isOpen: true
  },
  {
    name: "Thai Temptations",
    description: "Authentic Thai street food and curries",
    cuisine: ["Thai", "Asian", "Vegetarian"],
    address: {
      street: "321 Park Street, Viman Nagar",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411014",
      coordinates: {
        latitude: 18.5679,
        longitude: 73.9143
      }
    },
    phone: "+91 20 5678 9012",
    email: "info@thaiTempt.in",
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800",
    deliveryFee: 45,
    deliveryTime: "35-45 mins",
    minimumOrder: 220,
    rating: 4.6,
    isFeatured: false,
    isOpen: true
  },
  {
  name: "Wok & Bowl",
  description: "Authentic Indo-Chinese street flavors with modern presentation",
  cuisine: ["Chinese", "Asian", "Street Food"],
  address: {
    street: "FC Road",
    city: "Pune",
    state: "Maharashtra",
    zipCode: "411005",
    coordinates: {
      latitude: 18.5208,
      longitude: 73.8412
    }
  },
  phone: "+91 20 9876 1234",
  email: "info@wokbowl.in",
  image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",
  deliveryFee: 35,
  deliveryTime: "25-35 mins",
  minimumOrder: 180,
  rating: 4.4,
  isFeatured: true,
  isOpen: true
},
{
  name: "Desi Tandoor",
  description: "Authentic North Indian tandoori and curry dishes",
  cuisine: ["Indian", "Tandoori", "Mughlai"],
  address: {
    street: "Baner Road",
    city: "Pune",
    state: "Maharashtra",
    zipCode: "411045",
    coordinates: {
      latitude: 18.5590,
      longitude: 73.7868
    }
  },
  phone: "+91 20 5555 9999",
  email: "orders@desitandoor.in",
  image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800",
  deliveryFee: 40,
  deliveryTime: "30-40 mins",
  minimumOrder: 220,
  rating: 4.6,
  isFeatured: true,
  isOpen: true
},
{
  name: "Frosty Delight",
  description: "Premium ice creams, waffles and shakes",
  cuisine: ["Dessert", "Ice Cream", "Beverages"],
  address: {
    street: "JM Road",
    city: "Pune",
    state: "Maharashtra",
    zipCode: "411004",
    coordinates: {
      latitude: 18.5196,
      longitude: 73.8410
    }
  },
  phone: "+91 20 7777 4444",
  email: "hello@frostydelight.com",
  image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800",
  deliveryFee: 25,
  deliveryTime: "20-30 mins",
  minimumOrder: 150,
  rating: 4.5,
  isFeatured: false,
  isOpen: true
},
{
  name: "Taco Fiesta",
  description: "Mexican street food and tacos",
  cuisine: ["Mexican", "Street Food"],
  address: {
    street: "Koregaon Park",
    city: "Pune",
    state: "Maharashtra",
    zipCode: "411001",
    coordinates: {
      latitude: 18.5362,
      longitude: 73.8930
    }
  },
  phone: "+91 20 8888 2222",
  email: "info@tacofiesta.com",
  image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800",
  deliveryFee: 50,
  deliveryTime: "30-40 mins",
  minimumOrder: 200,
  rating: 4.3,
  isFeatured: false,
  isOpen: true
},


];

// Sample menu items with food images
const menuItemsByRestaurant = {
  "Pizza Paradise": [
    { name: "Margherita Pizza", description: "Classic tomato sauce, fresh mozzarella, basil", price: 299, category: "main", isVegetarian: true, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400" },
    { name: "Pepperoni Pizza", description: "Spicy pepperoni, mozzarella, tomato sauce", price: 349, category: "main", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400" },
    { name: "Hawaiian Pizza", description: "Ham, pineapple, mozzarella", price: 329, category: "main", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400" },
    { name: "Garlic Bread", description: "Toasted bread with garlic butter", price: 120, category: "appetizer", isVegetarian: true, image: "https://static01.nyt.com/images/2018/12/11/dining/as-garlic-bread/as-garlic-bread-googleFourByThree-v2.jpg" },
    { name: "Caesar Salad", description: "Romaine lettuce, croutons, parmesan", price: 180, category: "appetizer", isVegetarian: true, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400" },
    { name: "Tiramisu", description: "Classic Italian dessert", price: 150, category: "dessert", isVegetarian: true, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400" },
    { name: "Chocolate Brownie", description: "Warm brownie with ice cream", price: 130, category: "dessert", isVegetarian: true, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400" },
    { name: "Coca Cola", description: "Chilled soft drink (500ml)", price: 50, category: "beverage", isVegetarian: true, image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400" }
  ],
  "Sushi House": [
    { name: "California Roll", description: "Crab, avocado, cucumber", price: 280, category: "main", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400" },
    { name: "Salmon Sashimi", description: "Fresh salmon slices (8 pcs)", price: 450, category: "main", image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400" },
    { name: "Spicy Tuna Roll", description: "Tuna with spicy mayo", price: 320, category: "main", image: "https://images.unsplash.com/photo-1563612116625-3012372fccce?w=400" },
    { name: "Edamame", description: "Steamed soybeans with salt", price: 150, category: "appetizer", isVegetarian: true, image: "https://cdn.pickuplimes.com/cache/7b/7b/7b7b7a9769cf3a3ac599a6dfb8253572.jpg" },
    { name: "Miso Soup", description: "Traditional Japanese soup", price: 120, category: "appetizer", isVegetarian: true, image: "https://www.crowdedkitchen.com/wp-content/uploads/2020/08/vegan-miso-soup.jpg" },
    { name: "Green Tea Ice Cream", description: "Japanese matcha ice cream", price: 140, category: "dessert", isVegetarian: true, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400" }
  ],
  "Spice Garden": [
    { name: "Butter Chicken", description: "Creamy tomato curry with chicken", price: 320, category: "main", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400" },
    { name: "Paneer Tikka Masala", description: "Cottage cheese in spicy gravy", price: 280, category: "main", isVegetarian: true, image: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=400" },
    { name: "Biryani", description: "Fragrant rice with spices", price: 250, category: "main", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
    { name: "Samosa", description: "Crispy pastry with potato filling (2 pcs)", price: 60, category: "appetizer", isVegetarian: true, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
    { name: "Naan", description: "Indian flatbread", price: 40, category: "appetizer", isVegetarian: true, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400" },
    { name: "Gulab Jamun", description: "Sweet dumplings in syrup (2 pcs)", price: 80, category: "dessert", isVegetarian: true, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400" },
    { name: "Mango Lassi", description: "Yogurt mango drink", price: 90, category: "beverage", isVegetarian: true, image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400" }
  ],
  "Burger Bros": [
    { name: "Classic Burger", description: "Beef patty, lettuce, tomato, cheese", price: 200, category: "main", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
    { name: "Chicken Burger", description: "Crispy chicken, mayo, lettuce", price: 220, category: "main", image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400" },
    { name: "Veggie Burger", description: "Plant-based patty with veggies", price: 180, category: "main", isVegetarian: true, image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400" },
    { name: "French Fries", description: "Crispy golden fries", price: 100, category: "appetizer", isVegetarian: true, image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400" },
    { name: "Onion Rings", description: "Battered and fried onion rings", price: 120, category: "appetizer", isVegetarian: true, image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400" },
    { name: "Milkshake", description: "Chocolate/Vanilla/Strawberry", price: 130, category: "beverage", isVegetarian: true, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400" }
  ],
  "Thai Temptations": [
    { name: "Pad Thai", description: "Stir-fried rice noodles", price: 240, category: "main", image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400" },
    { name: "Green Curry", description: "Thai green curry with vegetables", price: 260, category: "main", isVegetarian: true, image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400" },
    { name: "Tom Yum Soup", description: "Spicy and sour Thai soup", price: 180, category: "appetizer", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400" },
    { name: "Spring Rolls", description: "Crispy vegetable rolls (4 pcs)", price: 140, category: "appetizer", isVegetarian: true, image: "https://www.sugarsaltmagic.com/wp-content/uploads/2023/01/Chinese-Spring-Rolls-4FEAT-500x500.jpg" },
    { name: "Mango Sticky Rice", description: "Sweet coconut rice with mango", price: 150, category: "dessert", isVegetarian: true, image: "https://www.grocery.coop/wp-content/uploads/2023/03/NCG_Dennis_Becker_Mango_and_Coconut_Rice_715_x_477.jpg" },
    { name: "Thai Iced Tea", description: "Sweet creamy tea", price: 90, category: "beverage", isVegetarian: true, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400" }
  ],
  "Wok & Bowl": [
  { name: "Hakka Noodles", description: "Stir fried noodles with veggies", price: 160, category: "main", isVegetarian: true, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400" },
  { name: "Chicken Manchurian", description: "Spicy chicken balls in sauce", price: 210, category: "main", image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400" },
  { name: "Veg Fried Rice", description: "Rice tossed with vegetables", price: 150, category: "main", isVegetarian: true, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400" },
  { name: "Spring Rolls", description: "Vegetable spring rolls", price: 130, category: "appetizer", isVegetarian: true, image: "https://images.unsplash.com/photo-1625937329935-d6c17a48db05?w=400" }
],
"Desi Tandoor": [
  { name: "Chicken Tandoori", description: "Smoky roasted chicken", price: 320, category: "main", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400" },
  { name: "Dal Makhani", description: "Creamy black lentils", price: 220, category: "main", isVegetarian: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400" },
  { name: "Paneer Butter Masala", description: "Paneer in butter gravy", price: 260, category: "main", isVegetarian: true, image: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=400" },
  { name: "Butter Naan", description: "Soft naan with butter", price: 50, category: "appetizer", isVegetarian: true, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400" }
],
"Frosty Delight": [
  { name: "Belgian Chocolate Ice Cream", description: "Rich chocolate ice cream", price: 120, category: "dessert", isVegetarian: true, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400" },
  { name: "Nutella Waffle", description: "Waffle topped with Nutella", price: 180, category: "dessert", isVegetarian: true, image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400" },
  { name: "Cold Coffee", description: "Chilled creamy coffee", price: 110, category: "beverage", isVegetarian: true, image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400" }
],
"Taco Fiesta": [
  { name: "Chicken Taco", description: "Soft taco with grilled chicken", price: 190, category: "main", image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400" },
  { name: "Veg Burrito", description: "Stuffed burrito with beans & veggies", price: 180, category: "main", isVegetarian: true, image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400" },
  { name: "Nachos", description: "Nachos with cheese dip", price: 150, category: "appetizer", isVegetarian: true, image: "https://www.emborg.com/app/uploads/2023/07/1200x900px_3_Step_Nachos_Snack.png" }
]
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to MongoDB');

    // Clear existing data
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('🗑️  Cleared existing restaurants and menu items');

    // Find or create restaurant owner
    let owner = await User.findOne({ email: 'owner@restaurant.com' });
    if (!owner) {
      owner = await User.create({
        name: 'Restaurant Owner',
        email: 'owner@restaurant.com',
        password: 'password123',
        phone: '+91 98765 43210',
        role: 'restaurant'
      });
      console.log('👤 Created restaurant owner account');
    }

    // Create restaurants
    console.log('\n🏪 Creating restaurants...');
    for (const restaurantData of sampleRestaurants) {
      const restaurant = await Restaurant.create({
        ...restaurantData,
        owner: owner._id
      });
      console.log(`✅ Created: ${restaurant.name}`);

      // Create menu items for this restaurant
      const menuItems = menuItemsByRestaurant[restaurant.name];
      if (menuItems) {
        for (const itemData of menuItems) {
          await MenuItem.create({
            ...itemData,
            restaurant: restaurant._id,
            isAvailable: true
          });
        }
        console.log(`   📋 Added ${menuItems.length} menu items`);
      }
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Sample Credentials:');
    console.log('Email: owner@restaurant.com');
    console.log('Password: password123');
    console.log('\n🎉 You can now:');
    console.log('1. Register as a customer');
    console.log('2. Browse restaurants with images');
    console.log('3. View menu items with food images');
    console.log('4. Place orders');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();