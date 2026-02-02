import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/services/api';
import { format } from 'date-fns';
import type { Order } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, ChevronRight, UtensilsCrossed } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-warning text-warning-foreground',
  confirmed: 'bg-info text-info-foreground',
  preparing: 'bg-info text-info-foreground',
  out_for_delivery: 'bg-primary text-primary-foreground',
  delivered: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function OrderCard({ order }: { order: Order }) {
  return (
    <Link to={`/order/${order._id}`}>
      <Card className="group transition-all duration-300 hover:shadow-card-hover">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold text-primary">
                    #{order.orderNumber}
                  </span>
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                <p className="font-medium">{order.restaurant?.name || 'Restaurant'}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {order.items?.length || 0} items
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                ${order.totalAmount.toFixed(2)}
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function OrderSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-5 w-32" />
            <Skeleton className="mb-1 h-4 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Orders() {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getMyOrders,
  });

  const orders = data?.orders || [];

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'active') {
      return ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(
        order.status
      );
    }
    return order.status === filter;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'amount') {
      return b.totalAmount - a.totalAmount;
    }
    return 0;
  });

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {isLoading ? (
            <div className="space-y-4">
              <OrderSkeleton />
              <OrderSkeleton />
              <OrderSkeleton />
            </div>
          ) : sortedOrders.length > 0 ? (
            <div className="space-y-4">
              {sortedOrders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-semibold">No orders found</h3>
              <p className="text-muted-foreground">
                {filter === 'all'
                  ? "You haven't placed any orders yet"
                  : `No ${filter} orders`}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
