import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { restaurantsApi } from '@/services/api';
import type { Restaurant } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Star,
  Clock,
  Truck,
  UtensilsCrossed,
  Filter,
  X,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

const cuisineOptions = [
  'All',
  'Italian',
  'Chinese',
  'Indian',
  'Mexican',
  'Japanese',
  'Thai',
  'American',
  'Mediterranean',
];

const sortOptions = [
  { value: 'rating', label: 'Rating' },
  { value: 'deliveryTime', label: 'Delivery Time' },
  { value: 'deliveryFee', label: 'Delivery Fee' },
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
          <h3 className="mb-1 text-lg font-semibold group-hover:text-primary transition-colors">
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

export default function Restaurants() {
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['restaurants', debouncedSearch, cuisine, sortBy],
    queryFn: () =>
      restaurantsApi.getAll({
        search: debouncedSearch || undefined,
        cuisine: cuisine !== 'All' ? cuisine : undefined,
        sortBy,
      }),
  });

  const restaurants = data?.restaurants || [];

  const clearFilters = useCallback(() => {
    setSearch('');
    setCuisine('All');
    setSortBy('rating');
  }, []);

  const hasActiveFilters = search || cuisine !== 'All' || sortBy !== 'rating';

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Restaurants</h1>
        <p className="text-muted-foreground">Find your favorite food from local restaurants</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search restaurants or cuisines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            className="sm:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <div className="hidden gap-2 sm:flex">
            <Select value={cuisine} onValueChange={setCuisine}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Cuisine" />
              </SelectTrigger>
              <SelectContent>
                {cuisineOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="flex gap-2 sm:hidden">
            <Select value={cuisine} onValueChange={setCuisine}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Cuisine" />
              </SelectTrigger>
              <SelectContent>
                {cuisineOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {search && (
              <Badge variant="secondary" className="gap-1">
                "{search}"
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSearch('')}
                />
              </Badge>
            )}
            {cuisine !== 'All' && (
              <Badge variant="secondary" className="gap-1">
                {cuisine}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setCuisine('All')}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <RestaurantSkeleton />
            <RestaurantSkeleton />
            <RestaurantSkeleton />
            <RestaurantSkeleton />
            <RestaurantSkeleton />
            <RestaurantSkeleton />
          </>
        ) : restaurants.length > 0 ? (
          restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))
        ) : (
          <div className="col-span-full py-16 text-center">
            <UtensilsCrossed className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">No restaurants found</h3>
            <p className="mb-4 text-muted-foreground">
              Try adjusting your search or filters
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
