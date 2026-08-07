import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { cartCount } = useCart();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600 flex-shrink-0">
          Digi<span className="text-gray-800">Hub</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <input
            type="text"
            placeholder="Search for products, brands and more..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6 flex-shrink-0">

          {user ? (
            <>
              <span className="text-gray-700 font-medium">
                Hi, {user.name.split(' ')[0]}
              </span>

              <Link
                to="/my-orders"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                My Orders
              </Link>

              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Login
            </Link>
          )}

          <Link
            to="/cart"
            className="relative text-gray-700 hover:text-blue-600 font-medium"
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;