import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlistItems.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
        <p className="text-gray-600">Your wishlist is empty.</p>
        <Link
          to="/"
          className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow p-4"
          >
            <img
              src={
                product.images?.[0] ||
                'https://via.placeholder.com/300'
              }
              alt={product.name}
              className="w-full h-48 object-contain mb-4"
            />

            <h2 className="font-bold text-lg mb-2">
              {product.name}
            </h2>

            <p className="text-blue-600 font-bold text-xl mb-4">
              ₹{product.price}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => addToCart(product)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
              >
                Add to Cart
              </button>

              <button
                onClick={() =>
                  removeFromWishlist(product._id)
                }
                className="bg-red-500 text-white px-4 rounded-lg"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wishlist;