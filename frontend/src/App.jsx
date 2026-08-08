import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import Navbar from "./components/Navbar";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import MyOrders from "./pages/MyOrders";
import MyWallet from "./pages/MyWallet";

import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import ManageProducts from "./pages/ManageProducts";
import EditProduct from "./pages/EditProduct";
import ManageOrders from "./pages/ManageOrders";
import Wishlist from './pages/Wishlist';
import CategoryPage from './pages/CategoryPage';

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Navbar />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/wallet" element={<MyWallet />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />

            <Route
              path="/admin/add-product"
              element={
                <ProtectedAdminRoute>
                  <AddProduct />
                </ProtectedAdminRoute>
              }
            />

            <Route
              path="/admin/products"
              element={
                <ProtectedAdminRoute>
                  <ManageProducts />
                </ProtectedAdminRoute>
              }
            />

            <Route
              path="/admin/edit-product/:id"
              element={
                <ProtectedAdminRoute>
                  <EditProduct />
                </ProtectedAdminRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <ProtectedAdminRoute>
                  <ManageOrders />
                </ProtectedAdminRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;