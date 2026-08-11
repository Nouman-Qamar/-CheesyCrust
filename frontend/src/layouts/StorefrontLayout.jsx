import { Outlet } from 'react-router-dom';
import { CartProvider } from '../store/CartContext.jsx';
import StoreHeader from '../components/StoreHeader.jsx';

// Wraps Menu + Checkout + OrderConfirmation in a SINGLE CartProvider instance.
// Previously each route had its own <CartProvider>, so navigating from "/"
// to "/checkout" mounted a fresh cart and lost everything that was added.
// Nesting all three under this layout keeps one provider alive across
// client-side navigation.
export default function StorefrontLayout() {
  return (
    <CartProvider>
      <StoreHeader />
      <Outlet />
    </CartProvider>
  );
}
