import { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext(null);

// key uniquely identifies an item+size combo so the same pizza in two
// different sizes shows as two separate cart lines
function lineKey(menuItemId, variantLabel) {
  return `${menuItemId}::${variantLabel}`;
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState([]); // [{menu_item_id, name, variant_label, unit_price, quantity}]

  const addItem = (menuItem, variant) => {
    const key = lineKey(menuItem._id, variant.label);
    setLines((prev) => {
      const existing = prev.find((l) => lineKey(l.menu_item_id, l.variant_label) === key);
      if (existing) {
        return prev.map((l) =>
          lineKey(l.menu_item_id, l.variant_label) === key ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...prev, {
        menu_item_id: menuItem._id,
        name: menuItem.name,
        variant_label: variant.label,
        unit_price: variant.price,
        quantity: 1,
      }];
    });
  };

  const updateQuantity = (menuItemId, variantLabel, quantity) => {
    setLines((prev) => {
      if (quantity <= 0) {
        return prev.filter((l) => lineKey(l.menu_item_id, l.variant_label) !== lineKey(menuItemId, variantLabel));
      }
      return prev.map((l) =>
        lineKey(l.menu_item_id, l.variant_label) === lineKey(menuItemId, variantLabel) ? { ...l, quantity } : l
      );
    });
  };

  const clearCart = () => setLines([]);

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.unit_price * l.quantity, 0),
    [lines]
  );
  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  return (
    <CartContext.Provider value={{ lines, addItem, updateQuantity, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
