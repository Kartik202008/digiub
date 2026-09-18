import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const normalizeProduct = (product, fallbackQty = 1) => {
  const id = product.id || product._id;
  const image =
    product.image ||
    (Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : typeof product.images === 'string'
      ? product.images
      : '');
  const qty = Number(product.quantity || fallbackQty || 1);

  return {
    ...product,
    id,
    _id: id,
    product: id,
    name: product.name || '',
    price: Number(product.price) || 0,
    image,
    codAvailable: product.codAvailable !== false,
    quantity: Math.max(1, qty),
  };
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item) => normalizeProduct(item, item.quantity));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    const normalized = normalizeProduct(product, qty);
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => (item.id || item._id) === normalized.id
      );
      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + normalized.quantity }
            : item
        );
      }
      return [...prev, normalized];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => (item.id || item._id) !== id));
  };

  const removeItemsFromCart = (idsToRemove) => {
    const ids = Array.isArray(idsToRemove) ? idsToRemove : [idsToRemove];
    const stringIds = ids.map(String);
    setCartItems((prev) =>
      prev.filter((item) => !stringIds.includes(String(item.id || item._id)))
    );
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        (item.id || item._id) === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        removeItemsFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}