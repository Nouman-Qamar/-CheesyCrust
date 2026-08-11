// src/i18n/translations.js
//
// This is the UI language (Roman Urdu — Urdu written in Latin script, no
// RTL, no special font) — separate from the receipt's own English/Urdu
// toggle in receiptThemes.js, which prints proper Nastaliq script Urdu.
// This one is for the app's own buttons/labels/nav, "Roman Urdu" like
// people actually text each other in Pakistan.

export const translations = {
  // storefront — header, menu, cart
  storeTagline: { en: 'Pizza & Pasta — Gulberg III, Lahore', ur: 'Pizza & Pasta — Gulberg III, Lahore' },
  freeDelivery: { en: 'Free Home Delivery', ur: 'Free Home Delivery' },
  cart: { en: 'Cart', ur: 'Cart' },
  loadingMenu: { en: 'Loading menu…', ur: 'Menu load ho raha hai…' },
  menuEmpty: { en: 'Menu is empty — seed it from the admin panel.', ur: 'Menu abhi khali hai — admin panel se seed karein.' },
  sizes: { en: 'Sizes', ur: 'Sizes' },
  yourCart: { en: 'Your Cart', ur: 'Aap Ka Cart' },
  cartEmptyMsg: { en: 'Cart is empty — add something from the menu.', ur: 'Cart khali hai — menu se kuch add karein.' },
  subtotal: { en: 'Subtotal', ur: 'Subtotal' },
  checkoutBtn: { en: 'Checkout', ur: 'Checkout' },
  removeItem: { en: 'Remove item', ur: 'Item hataayein' },
  decreaseQty: { en: 'Decrease quantity', ur: 'Quantity kam karein' },
  increaseQty: { en: 'Increase quantity', ur: 'Quantity barhayein' },

  // checkout page
  yourOrder: { en: 'Your Order', ur: 'Aap Ka Order' },
  backToMenu: { en: 'Back to Menu', ur: 'Menu par wapas' },
  fullName: { en: 'Full Name', ur: 'Poora Naam' },
  phoneNumber: { en: 'Phone Number', ur: 'Phone Number' },
  deliveryAddress: { en: 'Delivery Address', ur: 'Delivery Address' },
  orderNotesOptional: { en: 'Order notes (optional)', ur: 'Order notes (agar koi hon)' },
  paymentMethod: { en: 'Payment Method', ur: 'Payment Ka Tareeqa' },
  cod: { en: 'Cash on Delivery', ur: 'Cash on Delivery' },
  easypaisa: { en: 'EasyPaisa', ur: 'EasyPaisa' },
  jazzcash: { en: 'JazzCash', ur: 'JazzCash' },
  placeOrder: { en: 'Place Order', ur: 'Order Place Karein' },
  placingOrder: { en: 'Placing Order…', ur: 'Order place ho raha hai…' },
  cartEmptyFull: { en: 'Your cart is empty.', ur: 'Cart khali hai.' },
  viewMenu: { en: 'View Menu', ur: 'Menu Dekhein' },
  requiredFieldsError: { en: 'Name, phone and address are required.', ur: 'Naam, phone number aur address zaroori hain.' },
  orderFailedError: { en: 'Order could not be placed, please try again.', ur: 'Order place nahi ho saka, dobara try karein.' },

  // order confirmation
  orderPlaced: { en: 'Order Placed!', ur: 'Order Ho Gaya!' },
  orderNotFound: { en: 'Order not found.', ur: 'Order nahi mila.' },
  loading: { en: 'Loading…', ur: 'Load ho raha hai…' },
  status: { en: 'Status', ur: 'Status' },
  total: { en: 'Total', ur: 'Total' },
  delivery: { en: 'Delivery', ur: 'Delivery' },
  orderMore: { en: 'Order More', ur: 'Aur Order Karein' },
  viewReceipt: { en: 'View Receipt', ur: 'Receipt Dekhein' },
  hideReceipt: { en: 'Hide Receipt', ur: 'Receipt Chupayein' },
  printReceipt: { en: 'Print Receipt', ur: 'Receipt Print Karein' },
  statusPending: { en: 'Order Received', ur: 'Order Mil Gaya' },
  statusConfirmed: { en: 'Confirmed', ur: 'Confirm Ho Gaya' },
  statusPreparing: { en: 'Preparing', ur: 'Tayyar Ho Raha Hai' },
  statusOutForDelivery: { en: 'Out for Delivery', ur: 'Delivery Ke Liye Nikal Gaya' },
  statusDelivered: { en: 'Delivered', ur: 'Deliver Ho Gaya' },
  statusCancelled: { en: 'Cancelled', ur: 'Cancel Ho Gaya' },

  // admin nav
  adminPanel: { en: 'Admin Panel', ur: 'Admin Panel' },
  dashboard: { en: 'Dashboard', ur: 'Dashboard' },
  orders: { en: 'Orders', ur: 'Orders' },
  archivedOrders: { en: 'Archived Orders', ur: 'Archived Orders' },
  menuNav: { en: 'Menu', ur: 'Menu' },
  rawMaterials: { en: 'Raw Materials', ur: 'Raw Materials' },
  expenses: { en: 'Expenses', ur: 'Expenses' },
  monthlyReport: { en: 'Monthly Report', ur: 'Monthly Report' },
  settings: { en: 'Settings', ur: 'Settings' },
  logout: { en: 'Logout', ur: 'Logout' },

  // admin dashboard
  today: { en: 'Today', ur: 'Aaj' },
  thisMonth: { en: 'This Month', ur: 'Is Mahine' },
  ordersToday: { en: 'Orders Today', ur: 'Aaj Ke Orders' },
  revenueToday: { en: 'Revenue Today', ur: 'Aaj Ki Revenue' },
  expensesToday: { en: 'Expenses Today', ur: 'Aaj Ke Expenses' },
  netProfitToday: { en: 'Net Profit Today', ur: 'Aaj Ka Net Profit' },
  totalOrders: { en: 'Total Orders', ur: 'Total Orders' },
  totalRevenue: { en: 'Total Revenue', ur: 'Total Revenue' },
  totalExpenses: { en: 'Total Expenses', ur: 'Total Expenses' },
  netProfit: { en: 'Net Profit', ur: 'Net Profit' },
  grossProfit: { en: 'Gross Profit (before expenses)', ur: 'Gross Profit (expenses se pehle)' },
  avgOrderValue: { en: 'Avg Order Value', ur: 'Average Order Value' },
  topSellingItems: { en: 'Top Selling Items (this month)', ur: 'Sab Se Zyada Bikne Waale Items (is mahine)' },

  // login
  loginTitle: { en: 'Login', ur: 'Login' },
  username: { en: 'Username', ur: 'Username' },
  password: { en: 'Password', ur: 'Password' },

  // display/zoom control
  textSize: { en: 'Text Size', ur: 'Text Size' },
  language: { en: 'Language', ur: 'Language' },
};

export function t(key, lang) {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry.en;
}
