import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { wishlistService } from "../services";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist({ products: [] });
      return;
    }
    try {
      const res = await wishlistService.get();
      setWishlist(res.data);
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const toggleWishlist = async (productId) => {
    const isSaved = wishlist.products?.some((p) => p._id === productId);
    if (isSaved) {
      const res = await wishlistService.remove(productId);
      setWishlist(res.data);
      toast.success("Removed from wishlist");
    } else {
      const res = await wishlistService.add(productId);
      setWishlist(res.data);
      toast.success("Added to wishlist");
    }
  };

  const isInWishlist = (productId) => wishlist.products?.some((p) => p._id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
