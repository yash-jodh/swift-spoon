import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Cart, CartSummary, MenuItem } from '@/types';
import { cartApi } from '@/services/api';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cart: Cart | null;
  summary: CartSummary | null;
  itemCount: number;
  isLoading: boolean;
  addItem: (item: MenuItem, quantity?: number) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setSummary(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await cartApi.get();
      if (response.success) {
        setCart(response.cart);
        setSummary(response.summary);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (item: MenuItem, quantity: number = 1) => {
      if (!isAuthenticated) {
        toast({
          title: 'Please log in',
          description: 'You need to log in to add items to cart',
          variant: 'destructive',
        });
        return;
      }

      try {
        // Optimistic update
        setCart((prev) => {
          if (!prev) {
            return {
              items: [{ menuItem: item, quantity }],
              restaurant: null,
            };
          }

          const existingItemIndex = prev.items.findIndex(
            (i) => i.menuItem._id === item._id
          );

          if (existingItemIndex >= 0) {
            const newItems = [...prev.items];
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newItems[existingItemIndex].quantity + quantity,
            };
            return { ...prev, items: newItems };
          }

          return {
            ...prev,
            items: [...prev.items, { menuItem: item, quantity }],
          };
        });

        const response = await cartApi.addItem(item._id, quantity);
        if (response.success) {
          setCart(response.cart);
          setSummary(response.summary);
          toast({
            title: 'Added to cart',
            description: `${item.name} has been added to your cart`,
          });
        }
      } catch (error) {
        refreshCart();
        toast({
          title: 'Error',
          description: 'Failed to add item to cart',
          variant: 'destructive',
        });
      }
    },
    [isAuthenticated, toast, refreshCart]
  );

  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        if (quantity <= 0) {
          await removeItem(itemId);
          return;
        }

        const response = await cartApi.updateItem(itemId, quantity);
        if (response.success) {
          setCart(response.cart);
          setSummary(response.summary);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update cart',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        const response = await cartApi.removeItem(itemId);
        if (response.success) {
          setCart(response.cart);
          setSummary(response.summary);
          toast({
            title: 'Item removed',
            description: 'Item has been removed from your cart',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to remove item',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  const clearCart = useCallback(async () => {
    try {
      await cartApi.clear();
      setCart(null);
      setSummary(null);
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const itemCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        summary,
        itemCount,
        isLoading,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
