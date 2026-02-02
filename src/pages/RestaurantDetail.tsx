import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { restaurantsApi, menuApi } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import type { MenuItem } from '@/types';
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

function MenuItemCard({
  item,
  onAddToCart,
}: {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    await onAddToCart(item, quantity);
    setIsAdding(false);
    setQuantity(1);
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-card-hover">
      <div className="relative h-40 overflow-hidden bg-muted">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <UtensilsCrossed className="h-10 w-10 text-primary/40" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          {item.isVegetarian && (
            <Badge className="bg-success text-success-foreground">
              <Leaf className="mr-1 h-3 w-3" />
              Veg
            </Badge>
          )}
          {item.isVegan && (
            <Badge className="bg-success text-success-foreground">Vegan</Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="mb-1 font-semibold">{item.name}</h3>
        {item.description && (
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            ${item.price.toFixed(2)}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" onClick={handleAdd} disabled={isAdding}>
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MenuSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <CardContent className="p-4">
        <Skeleton className="mb-2 h-5 w-3/4" />
        <Skeleton className="mb-3 h-4 w-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: restaurantData, isLoading: isLoadingRestaurant } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => restaurantsApi.getById(id!),
    enabled: !!id,
  });

  const { data: menuData, isLoading: isLoadingMenu } = useQuery({
    queryKey: ['menu', id],
    queryFn: () => menuApi.getByRestaurant(id!),
    enabled: !!id,
  });

  const restaurant = restaurantData?.restaurant;
  const menuItems = menuData?.menuItems || [];

  const filteredItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const handleAddToCart = async (item: MenuItem, quantity: number) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/restaurant/${id}` } } });
      return;
    }
    await addItem(item, quantity);
  };

  if (isLoadingRestaurant) {
    return (
      <div className="container py-8">
        <Skeleton className="mb-6 h-8 w-32" />
        <div className="mb-8 rounded-2xl bg-muted/50 p-6">
          <Skeleton className="mb-4 h-8 w-64" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MenuSkeleton />
          <MenuSkeleton />
          <MenuSkeleton />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container py-16 text-center">
        <UtensilsCrossed className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
        <h2 className="mb-2 text-2xl font-bold">Restaurant not found</h2>
        <p className="mb-4 text-muted-foreground">
          The restaurant you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link to="/restaurants">Browse Restaurants</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="container py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/restaurants')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Restaurants
        </Button>

        {/* Restaurant Header */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold lg:text-3xl">{restaurant.name}</h1>
                <Badge
                  variant={restaurant.isOpen !== false ? 'default' : 'secondary'}
                  className={restaurant.isOpen !== false ? 'bg-success' : ''}
                >
                  {restaurant.isOpen !== false ? 'Open Now' : 'Closed'}
                </Badge>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {restaurant.cuisine.map((c) => (
                  <Badge key={c} variant="outline">
                    {c}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-medium text-foreground">
                    {restaurant.rating.toFixed(1)}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {restaurant.deliveryTime}
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="h-4 w-4" />$
                  {restaurant.deliveryFee.toFixed(2)} delivery
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {restaurant.address && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {restaurant.address}
                </span>
              )}
              {restaurant.phone && (
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {restaurant.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Menu */}
        <div>
          <h2 className="mb-4 text-xl font-bold">Menu</h2>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="mb-6 w-full justify-start overflow-x-auto">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={selectedCategory}>
              {isLoadingMenu ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <MenuSkeleton />
                  <MenuSkeleton />
                  <MenuSkeleton />
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map((item) => (
                    <MenuItemCard
                      key={item._id}
                      item={item}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No items in this category</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-in-bottom">
          <Button size="lg" className="shadow-lg" asChild>
            <Link to="/cart">
              <ShoppingCart className="mr-2 h-5 w-5" />
              View Cart ({itemCount} items)
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
