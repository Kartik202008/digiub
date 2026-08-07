import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault(); // Stop link navigation when clicking button
    addToCart(product);
  };

  return (
    <Link to={`/product/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-4 cursor-pointer">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-cover rounded-md mb-3"
        />
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-1">
          <span className="text-yellow-500 text-sm">★</span>
          <span className="text-sm text-gray-600">{product.rating}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
          <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
          <span className="text-sm text-green-600 font-medium">{product.discount}% off</span>
        </div>
        <button
          onClick={handleAddToCart}
          className="w-full mt-3 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}

export default ProductCard;