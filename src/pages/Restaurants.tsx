import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { restaurantsApi } from "@/services/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Search, MapPin, Clock, Star } from "lucide-react";

import {
  FloatingCard,
  StaggerContainer,
  StaggerItem,
  FadeInScroll,
} from "@/components/AnimatedComponents";

export default function Restaurants() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    cuisine: "",
    sortBy: "rating",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["restaurants", search, filters],
    queryFn: () => restaurantsApi.getAll({ search, ...filters }),
  });

  const restaurants = data?.restaurants ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">

        {/* Header */}
        <FadeInScroll direction="up" className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Discover Restaurants
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Order from the best restaurants near you
          </p>
        </FadeInScroll>

        {/* Search */}
        <FadeInScroll delay={0.1}>
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

              <Input
                placeholder="Search restaurants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 py-6 text-lg rounded-xl"
              />
            </div>
          </div>
        </FadeInScroll>

        {/* Cards */}
        {!isLoading && restaurants.length > 0 && (
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant: any, index: number) => (
              <StaggerItem key={restaurant._id}>
                <FloatingCard delay={index * 0.05}>
                  <Card
                    className="cursor-pointer overflow-hidden group"
                    onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                  >
                    {/* Image */}
                    <div className="h-48 overflow-hidden bg-gray-200">
                      {restaurant.image ? (
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition"
                        />
                      ) : (
                        <div className="h-full flex justify-center items-center">
                          <Star className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">
                        {restaurant.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400" />
                          {restaurant.rating?.toFixed(1) ?? "4.5"}
                        </div>

                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {restaurant.distance ?? "2.5"} km
                        </div>
                      </div>

                      {/* Delivery */}
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {restaurant.deliveryTime ?? "30-40 min"}
                      </div>
                    </CardContent>
                  </Card>
                </FloatingCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

      </div>
    </div>
  );
}
