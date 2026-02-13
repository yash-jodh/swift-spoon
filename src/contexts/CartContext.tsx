import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '@/services/api';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // ✅ REFRESH CART
  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await cartApi.get();

      if (response.success) {
        setCart(response.cart);
        setSummary(response.summary);
      }

    } catch (error) {
      console.error("Cart fetch error", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ FIXED useEffect (MAIN BUG FIX)
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
      setSummary(null);
    }
  }, [isAuthenticated]); // ❗ Removed refreshCart dependency

  // ✅ ADD ITEM
  const addItem = async (item, quantity = 1) => {
  if (!isAuthenticated) {
    toast({
      title: "Login required",
      description: "Please login first",
      variant: "destructive"
    });
    return;
  }

  try {
    const response = await cartApi.addItem(item._id, quantity);

    if (response?.success) {
      setCart(response.cart);

      // ⭐ Since backend add route does NOT send summary
      // Refresh cart to fetch updated summary
      await refreshCart();

      toast({
        title: "Added to cart",
        description: item.name
      });
    }

  } catch (error) {
    console.error("Add to cart error:", error);

    toast({
      title: "Error",
      description:
        error instanceof Error
          ? error.message
          : "Failed to add item to cart",
      variant: "destructive"
    });
  }
};


  // ✅ UPDATE QUANTITY
  const updateItemQuantity = async (itemId, quantity) => {
    try {
      const response = await cartApi.updateItem(itemId, quantity);

      if (response.success) {
        setCart(response.cart);
        setSummary(response.summary);
      }

    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  // ✅ REMOVE ITEM
  const removeItem = async (itemId) => {
    try {
      const response = await cartApi.removeItem(itemId);

      if (response.success) {
        setCart(response.cart);
        setSummary(response.summary);
      }

    } catch {
      toast({ title: "Remove failed", variant: "destructive" });
    }
  };

  // ✅ CLEAR CART
  const clearCart = async () => {
    try {
      await cartApi.clear();
      setCart(null);
      setSummary(null);
    } catch {
      toast({ title: "Clear failed", variant: "destructive" });
    }
  };

  const itemCount = cart?.items?.reduce((a, b) => a + b.quantity, 0) || 0;

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
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
