// src/Component/Orders/Cart/CartContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

// Create Cart Context
const CartContext = createContext();

// Cart Provider component
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [recentItems, setRecentItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("cartItems");
    if (stored) setItems(JSON.parse(stored));
    
    const storedRecent = localStorage.getItem("recentCartItems");
    if (storedRecent) setRecentItems(JSON.parse(storedRecent));
  }, []);

  // Persist cart in localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(items));
  }, [items]);
  
  // Persist recent items in localStorage
  useEffect(() => {
    localStorage.setItem("recentCartItems", JSON.stringify(recentItems));
  }, [recentItems]);

  // Add item to cart
  const addItem = (product, qty = 1) => {
    // Normalize the product to ensure it has a consistent price field
    const normalizedProduct = { ...product };
    
    // Check if this is a Fish product (has PricePerCouple field but no price field)
    if (normalizedProduct.PricePerCouple !== undefined && normalizedProduct.price === undefined) {
      console.log(`Normalizing Fish price: ${normalizedProduct.PricePerCouple}`);
      normalizedProduct.price = normalizedProduct.PricePerCouple;
    }
    
    // Add to cart
    setItems(prev => {
      const existing = prev.find(item => item._id === normalizedProduct._id);
      if (existing) {
        return prev.map(item =>
          item._id === normalizedProduct._id
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      return [...prev, { ...normalizedProduct, qty }];
    });
    
    // Add to recent items (at the beginning)
    setRecentItems(prev => {
      // Remove if it already exists
      const filtered = prev.filter(item => item._id !== normalizedProduct._id);
      // Add to the beginning, limit to 3 items
      return [{ ...normalizedProduct, qty }, ...filtered].slice(0, 3);
    });
  };

  // Remove item from cart
  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item._id !== id));
    // Also remove from recent items if it exists there
    setRecentItems(prev => prev.filter(item => item._id !== id));
  };

  // Update quantity of an item
  const setQty = (id, qty) => {
    if (qty < 1) return;
    setItems(prev =>
      prev.map(item =>
        item._id === id ? { ...item, qty } : item
      )
    );
    
    // Also update in recent items if it exists there
    setRecentItems(prev =>
      prev.map(item =>
        item._id === id ? { ...item, qty } : item
      )
    );
  };

  // Clear entire cart
  const clear = () => {
    setItems([]);
    setRecentItems([]);
  };

  // Helper function to get the right price field based on product type
  const getProductPrice = (item) => {
    // Try to get a valid price, checking multiple possible fields
    if (item.price !== undefined && !isNaN(Number(item.price))) {
      return Number(item.price);
    }
    
    // Check for PricePerCouple (used by Fish products)
    if (item.PricePerCouple !== undefined && !isNaN(Number(item.PricePerCouple))) {
      return Number(item.PricePerCouple);
    }
    
    // If we get here, we couldn't find a valid price
    console.warn(`No valid price found for item ${item._id || 'unknown'}`);
    return 0;
  };

  // Calculate totals with safeguards against NaN
  const totals = items.reduce(
    (acc, item) => {
      const price = getProductPrice(item);
      const qty = Number(item.qty) || 0; // Default to 0 if NaN
      
      // Only add if both values are valid numbers
      if (!isNaN(price) && !isNaN(qty)) {
        acc.subtotal += price * qty;
      } else {
        console.warn(`Invalid price or qty for item ${item._id || 'unknown'}:`, { price, qty });
      }
      
      return acc;
    },
    { subtotal: 0 }
  );

  return (
    <CartContext.Provider value={{ items, recentItems, addItem, removeItem, setQty, totals, clear }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook to use the cart context
export const useCart = () => useContext(CartContext);

export default CartProvider;
