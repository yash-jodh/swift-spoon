import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { restaurantsApi, menuApi } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  Clock,
  Truck,
  Phone,
  MapPin,
  UtensilsCrossed,
  Plus,
  Minus,
  ShoppingCart,
  Leaf,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'appetizer', label: 'Appetizers' },
  { id: 'main', label: 'Main' },
  { id: 'dessert', label: 'Desserts' },
  { id: 'beverage', label: 'Beverages' },
];

/* ================= MENU ITEM CARD ================= */

function MenuItemCard({ item, onAddToCart, isRestaurantOpen }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!isRestaurantOpen) return;

    setIsAdding(true);
    await onAddToCart(item, quantity);
    setIsAdding(false);
    setQuantity(1);
  };

  return (
    <Card className="group overflow-hidden transition hover:shadow-lg">
      <div className="relative h-40 overflow-hidden bg-muted">
        {item?.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <UtensilsCrossed className="h-10 w-10 text-primary/40" />
          </div>
        )}

        <div className="absolute left-2 top-2 flex gap-1">
          {item?.isVegetarian && (
            <Badge className="bg-green-500 text-white">
              <Leaf className="mr-1 h-3 w-3" /> Veg
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold">{item?.name}</h3>

        {item?.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {item.description}
          </p>
        )}

        <div className="flex justify-between items-center">
          {/* INR Currency */}
          <span className="text-lg font-bold text-primary">
            ₹{item?.price?.toFixed(2)}
          </span>

          <div className="flex gap-2 items-center">
            {/* Quantity Controls */}
            <div className="flex border rounded">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus size={16} />
              </Button>

              <span className="px-2 flex items-center">{quantity}</span>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus size={16} />
              </Button>
            </div>

            <Button
              size="sm"
              disabled={isAdding || !isRestaurantOpen}
              onClick={handleAdd}
            >
              {isAdding ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Plus size={16} />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ================= SKELETON ================= */

function MenuSkeleton() {
  return (
    <Card>
      <Skeleton className="h-40 w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-3" />
        <Skeleton className="h-6 w-20" />
      </CardContent>
    </Card>
  );
}

/* ================= MAIN COMPONENT ================= */

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addItem, itemCount } = useCart();
  const { isAuthenticated } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState('all');

  /* ===== RESTAURANT FETCH ===== */
  const {
    data: restaurantData,
    isLoading: restaurantLoading,
    error: restaurantError,
  } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => restaurantsApi.getById(id),
    enabled: !!id,
  });

  /* ===== MENU FETCH ===== */
  const {
    data: menuData,
    isLoading: menuLoading,
    error: menuError,
  } = useQuery({
    queryKey: ['menu', id],
    queryFn: () => menuApi.getByRestaurant(id),
    enabled: !!id,
  });

  const restaurant = restaurantData?.restaurant;
  const menuItems = menuData?.menuItems || [];

  /* ===== FILTERED ITEMS ===== */
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return menuItems;
    return menuItems.filter((item) => item.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  /* ===== ADD TO CART ===== */
  const handleAddToCart = async (item, quantity) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    await addItem(item, quantity);
  };

  /* ===== ERROR STATE ===== */
  if (restaurantError || menuError) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-semibold">
          Failed to load restaurant data.
        </p>
      </div>
    );
  }

  /* ===== LOADING STATE ===== */
  if (restaurantLoading) {
    return (
      <div className="container py-8">
        <MenuSkeleton />
      </div>
    );
  }

  if (!restaurant) return null;

  const isRestaurantOpen = restaurant?.isOpen !== false;

  /* ================= UI ================= */

  return (
    <div className="min-h-screen pb-24">
      <div className="container py-6">

        {/* Back */}
        <Button variant="ghost" onClick={() => navigate('/restaurants')}>
          <ArrowLeft className="mr-2" /> Back
        </Button>

        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-2xl mb-8">
          <h1 className="text-3xl font-bold">{restaurant?.name}</h1>

          <div className="flex gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Star className="text-yellow-500" size={16} />
              {restaurant?.rating?.toFixed(1)}
            </span>

            <span className="flex items-center gap-1">
              <Clock size={16} /> {restaurant?.deliveryTime}
            </span>

            <span className="flex items-center gap-1">
              <Truck size={16} /> ₹{restaurant?.deliveryFee}
            </span>
          </div>
        </div>

        {/* Menu */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="mb-4">
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory}>
            {menuLoading ? (
              <MenuSkeleton />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item._id}
                    item={item}
                    onAddToCart={handleAddToCart}
                    isRestaurantOpen={isRestaurantOpen}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Cart */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
          <Button asChild size="lg">
            <Link to="/cart">
              <ShoppingCart className="mr-2" />
              View Cart ({itemCount})
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
