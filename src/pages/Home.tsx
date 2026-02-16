import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import LandingPage3D from "./LandingPage3D";

import {
  UtensilsCrossed,
  Zap,
  CreditCard,
  Star,
  Clock,
  ChevronRight,
  Truck,
  Search
} from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { restaurantsApi } from '@/services/api';
import type { Restaurant } from '@/types';


// ---------------- FEATURES ----------------
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
    description: 'Get your food delivered quickly',
    emoji: '⚡',
  },
  {
    icon: CreditCard,
    title: 'Easy Payment',
    description: 'Pay with card, UPI, or cash',
    emoji: '💳',
  },
  {
    icon: Star,
    title: 'Quality Food',
    description: 'Top-rated restaurants only',
    emoji: '⭐',
  },
];


// ---------------- STEPS ----------------
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
    description: 'Checkout securely',
    icon: CreditCard,
  },
  {
    step: 4,
    title: 'Track Delivery',
    description: 'Watch your food arrive',
    icon: Truck,
  },
];


// ---------------- RESTAURANT CARD ----------------
function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link to={`/restaurant/${restaurant._id}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-card-hover">

        <div className="relative h-48 overflow-hidden bg-muted">
          {restaurant.image ? (
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <UtensilsCrossed className="h-12 w-12 text-primary/50" />
            </div>
          )}

          <div className="absolute right-3 top-3">
            <Badge variant={restaurant.isOpen !== false ? 'default' : 'secondary'}>
              {restaurant.isOpen !== false ? 'Open' : 'Closed'}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold">{restaurant.name}</h3>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {restaurant.rating.toFixed(1)}
            </span>

            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {restaurant.deliveryTime}
            </span>

            <span className="flex items-center gap-1">
              <Truck className="h-4 w-4" />
              ₹{restaurant.deliveryFee}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


// ---------------- HOME PAGE ----------------
export default function Home() {

  const { data, isLoading } = useQuery({
    queryKey: ['featured-restaurants'],
    queryFn: restaurantsApi.getFeatured,
  });

  const restaurants = data?.restaurants || [];

  return (
    <div className="flex flex-col">

      {/* ⭐ 3D Landing Section */}
      <LandingPage3D />

      {/* ---------------- FEATURES ---------------- */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-center text-3xl font-bold mb-10">
            Why Choose FoodDash?
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">{feature.emoji}</div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* ---------------- RESTAURANTS ---------------- */}
      <section className="bg-muted/30 py-16">
        <div className="container">

          <div className="flex justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Restaurants</h2>

            <Button variant="ghost" asChild>
              <Link to="/restaurants">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              restaurants.slice(0, 6).map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))
            )}
          </div>
        </div>
      </section>


      {/* ---------------- STEPS ---------------- */}
      <section className="py-16">
        <div className="container text-center">

          <h2 className="text-3xl font-bold mb-10">How It Works</h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.step}>
                <step.icon className="mx-auto h-10 w-10 mb-3 text-primary" />
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ---------------- CTA ---------------- */}
      <section className="py-20 text-center bg-primary text-white">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Order?
        </h2>

        <Button size="lg" variant="secondary" asChild>
          <Link to="/restaurants">Get Started</Link>
        </Button>
      </section>

    </div>
  );
}
