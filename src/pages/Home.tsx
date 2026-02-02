import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  UtensilsCrossed,
  Zap,
  CreditCard,
  Star,
  Clock,
  ChevronRight,
  MapPin,
  Search,
  Truck,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { restaurantsApi } from '@/services/api';
import type { Restaurant } from '@/types';

const features = [
  {
    icon: UtensilsCrossed,
    title: 'Wide Selection',
    description: 'Choose from hundreds of restaurants and cuisines',
    emoji: '🍕',
  },
  {
    icon: Zap,
    title: 'Fast Delivery',
    description: 'Get your food delivered in 30 minutes or less',
    emoji: '⚡',
  },
  {
    icon: CreditCard,
    title: 'Easy Payment',
    description: 'Pay with card, UPI, or cash on delivery',
    emoji: '💳',
  },
  {
    icon: Star,
    title: 'Quality Food',
    description: 'Partner with top-rated restaurants only',
    emoji: '⭐',
  },
];

const steps = [
  {
    step: 1,
    title: 'Browse Restaurants',
    description: 'Explore menus from local favorites',
    icon: Search,
  },
  {
    step: 2,
    title: 'Choose Your Meal',
    description: 'Select items and customize your order',
    icon: UtensilsCrossed,
  },
  {
    step: 3,
    title: 'Place Your Order',
    description: 'Checkout securely in seconds',
    icon: CreditCard,
  },
  {
    step: 4,
    title: 'Track Delivery',
    description: 'Watch your food arrive in real-time',
    icon: Truck,
  },
];

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link to={`/restaurant/${restaurant._id}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-card-hover">
        <div className="relative h-48 overflow-hidden bg-muted">
          {restaurant.image ? (
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <UtensilsCrossed className="h-12 w-12 text-primary/50" />
            </div>
          )}
          <div className="absolute right-3 top-3">
            <Badge
              variant={restaurant.isOpen !== false ? 'default' : 'secondary'}
              className={restaurant.isOpen !== false ? 'bg-success' : ''}
            >
              {restaurant.isOpen !== false ? 'Open' : 'Closed'}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="mb-1 text-lg font-semibold group-hover:text-primary">
            {restaurant.name}
          </h3>
          <div className="mb-3 flex flex-wrap gap-1">
            {restaurant.cuisine.slice(0, 3).map((c) => (
              <Badge key={c} variant="outline" className="text-xs">
                {c}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              {restaurant.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {restaurant.deliveryTime}
            </span>
            <span className="flex items-center gap-1">
              <Truck className="h-4 w-4" />$
              {restaurant.deliveryFee.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function RestaurantSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-4">
        <Skeleton className="mb-2 h-6 w-3/4" />
        <div className="mb-3 flex gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-restaurants'],
    queryFn: restaurantsApi.getFeatured,
  });

  const restaurants = data?.restaurants || [];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl animate-slide-up">
              Delicious Food,
              <br />
              <span className="opacity-90">Delivered Fast</span>
            </h1>
            <p className="mb-8 text-lg text-white/80 sm:text-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Order from your favorite local restaurants and get it delivered to your doorstep in minutes.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button
                size="lg"
                className="w-full bg-white text-primary hover:bg-white/90 sm:w-auto"
                asChild
              >
                <Link to="/restaurants">
                  <MapPin className="mr-2 h-5 w-5" />
                  Find Restaurants Near You
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">Why Choose FoodDash?</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              We make ordering food easy, fast, and delicious
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group text-center transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="mb-4 text-4xl">{feature.emoji}</div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold">Featured Restaurants</h2>
              <p className="text-muted-foreground">Discover popular places near you</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex" asChild>
              <Link to="/restaurants">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <>
                <RestaurantSkeleton />
                <RestaurantSkeleton />
                <RestaurantSkeleton />
              </>
            ) : restaurants.length > 0 ? (
              restaurants.slice(0, 6).map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No featured restaurants available</p>
              </div>
            )}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Button asChild>
              <Link to="/restaurants">
                View All Restaurants
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">How It Works</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Get your favorite food delivered in 4 easy steps
            </p>
          </div>
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute left-1/2 top-8 hidden h-0.5 w-full max-w-lg -translate-x-1/2 bg-border lg:block" />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div key={step.step} className="relative text-center">
                  <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <step.icon className="h-7 w-7" />
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="mb-2 font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-hero py-16 lg:py-24">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
            Ready to Order?
          </h2>
          <p className="mb-8 text-white/80">
            Join thousands of happy customers who order with FoodDash
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link to="/restaurants">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
