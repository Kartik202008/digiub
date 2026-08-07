import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';

import AdminDashboard from './pages/AdminDashboard';
import AddProduct from './pages/AddProduct';
import ManageProducts from './pages/ManageProducts';
import EditProduct from './pages/EditProduct';
import ManageOrders from './pages/ManageOrders';
import MyWallet from './pages/MyWallet';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
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

  {/* Protected Admin Routes */}
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
          
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;