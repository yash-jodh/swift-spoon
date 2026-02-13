import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// ✨ ANIMATED COMPONENTS
import { 
  MagneticButton, 
  FloatingCard,
  FadeInScroll,
  PulseGlow
} from '@/components/AnimatedComponents';

import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  ArrowLeft,
  Loader2,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    summary,
    isLoading,
    updateItemQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-16 text-center">
        {/* ✨ ANIMATED EMPTY STATE */}
        <FadeInScroll direction="up">
          <ShoppingCart className="mx-auto mb-4 h-20 w-20 text-muted-foreground/50" />
          <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">
            Looks like you haven't added any items yet
          </p>
          
          {/* ✨ MAGNETIC BUTTON */}
          <MagneticButton
            onClick={() => navigate('/restaurants')}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2"
          >
            <ShoppingBag className="h-5 w-5" />
            Browse Restaurants
          </MagneticButton>
        </FadeInScroll>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Continue Shopping
      </Button>

      {/* ✨ ANIMATED HEADER */}
      <FadeInScroll direction="up">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold lg:text-3xl flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-orange-500" />
              Your Cart
            </h1>
            <p className="text-muted-foreground mt-1">
              {summary?.itemCount || 0} {summary?.itemCount === 1 ? 'item' : 'items'} in cart
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all items from your cart. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearCart} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Clear Cart
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </FadeInScroll>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Restaurant Info */}
          {cart.restaurant && (
            <FloatingCard delay={0.1}>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <UtensilsCrossed className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{cart.restaurant.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cart.restaurant.cuisine?.join(', ')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FloatingCard>
          )}

          {/* ✨ ANIMATED CART ITEMS */}
          <FloatingCard delay={0.15}>
            <Card>
              <CardContent className="p-0">
                {cart.items.map((item, index) => (
                  <div key={item.menuItem._id}>
                    {index > 0 && <Separator />}
                    <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.menuItem.image ? (
                          <img
                            src={item.menuItem.image}
                            alt={item.menuItem.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <UtensilsCrossed className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.menuItem.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${item.menuItem.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-lg border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateItemQuantity(item.menuItem._id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateItemQuantity(item.menuItem._id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeItem(item.menuItem._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="w-20 text-right font-semibold">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </FloatingCard>
        </div>

        {/* Order Summary - ✨ ANIMATED */}
        <div>
          <FloatingCard delay={0.2}>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${summary?.subtotal.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>${summary?.deliveryFee.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${summary?.tax?.toFixed(2) || '0.00'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg text-primary">
                      ${summary?.total.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>

                {/* ✨ MAGNETIC CHECKOUT BUTTON WITH PULSE GLOW */}
                <PulseGlow className="w-full">
                  <MagneticButton
                    onClick={() => navigate('/checkout')}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition-all group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Proceed to Checkout
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </MagneticButton>
                </PulseGlow>

                {/* Free Delivery Info */}
                {summary && summary.subtotal < 500 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-sm text-center">
                    Add <strong className="text-orange-600">${(500 - summary.subtotal).toFixed(2)}</strong> more for free delivery!
                  </div>
                )}
              </CardContent>
            </Card>
          </FloatingCard>
        </div>
      </div>
    </div>
  );
}