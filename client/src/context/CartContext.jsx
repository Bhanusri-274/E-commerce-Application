import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { cartService } from "../services";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], coupon: { code: null, discountAmount: 0 } });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], coupon: { code: null, discountAmount: 0 } });
      return;
    }
    try {
      setLoading(true);
      const res = await cartService.get();
      setCart(res.data);
    } catch {
      // silently ignore - user may not be logged in yet
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await cartService.add(productId, quantity);
    setCart(res.data);
    toast.success("Added to cart");
  };

  const updateQuantity = async (itemId, quantity) => {
    const res = await cartService.update(itemId, quantity);
    setCart(res.data);
  };

  const removeItem = async (itemId) => {
    const res = await cartService.remove(itemId);
    setCart(res.data);
    toast.success("Removed from cart");
  };

  const applyCoupon = async (code) => {
    const res = await cartService.applyCoupon(code);
    setCart(res.data);
    toast.success("Coupon applied");
  };

  const removeCoupon = async () => {
    const res = await cartService.removeCoupon();
    setCart(res.data);
  };

  const itemCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const subtotal = cart.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
