import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

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
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600 flex-shrink-0">
          Digi<span className="text-gray-800">Hub</span>
        </Link>

        {/* Search - hidden on small screens */}
        <div className="hidden md:block flex-1 max-w-xl">
          <input
            type="text"
            placeholder="Search for products, brands and more..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-6 flex-shrink-0">
          {user ? (
            <>
              <span className="text-gray-700 font-medium">
                Hi, {user.name.split(' ')[0]}
              </span>
              <Link to="/my-orders" className="text-gray-700 hover:text-blue-600 font-medium">
                My Orders
              </Link>
              <Link to="/wallet" className="text-gray-700 hover:text-blue-600 font-medium">
                My Wallet
              </Link>
              <Link to="/wishlist" className="relative text-gray-700 hover:text-blue-600 font-medium">
                Wishlist
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              {user.email === 'kg0493793@gmail.com' && (
                <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium">
                  Admin Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="text-gray-700 hover:text-red-600 font-medium">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">
              Login
            </Link>
          )}

          <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 font-medium">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile: Cart icon + Hamburger button */}
        <div className="flex md:hidden items-center gap-4">
          <Link to="/cart" className="relative text-gray-700 font-medium" onClick={closeMenu}>
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 focus:outline-none"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 space-y-3">
          <input
            type="text"
            placeholder="Search for products, brands and more..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {user ? (
            <div className="flex flex-col gap-3">
              <span className="text-gray-700 font-medium">
                Hi, {user.name.split(' ')[0]}
              </span>
              <Link to="/my-orders" onClick={closeMenu} className="text-gray-700 hover:text-blue-600 font-medium">
                My Orders
              </Link>
              <Link to="/wallet" onClick={closeMenu} className="text-gray-700 hover:text-blue-600 font-medium">
                My Wallet
              </Link>
              <Link to="/wishlist" onClick={closeMenu} className="text-gray-700 hover:text-blue-600 font-medium">
                Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
              {user.email === 'kg0493793@gmail.com' && (
                <Link to="/admin" onClick={closeMenu} className="text-gray-700 hover:text-blue-600 font-medium">
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-left text-gray-700 hover:text-red-600 font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={closeMenu} className="block text-gray-700 hover:text-blue-600 font-medium">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;