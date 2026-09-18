import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { getProductById, getProducts } from "../api/products";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getProductById(id)
      .then((data) => {
        if (!isMounted) return;
        setProduct(data);
        setLoading(false);

        // Fetch category-specific related products in parallel/fast
        if (data.category) {
          getProducts({ category: data.category })
            .then((catProducts) => {
              if (!isMounted) return;
              const related = catProducts
                .filter((p) => p._id !== data._id)
                .slice(0, 4);
              setRelatedProducts(related);
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching product details:", err);
        setError("Product could not be loaded. Please try again.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      {
        id: product._id,
        name: product.name,
        price: Number(product.price),
        image: product.images?.[0] || "",
        codAvailable: product.codAvailable !== false,
      },
      quantity
    );
    setSuccessMsg(`Added ${quantity} item${quantity > 1 ? "s" : ""} to cart!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.stock <= 0) {
      alert("This product is currently out of stock.");
      return;
    }

    addToCart(
      {
        id: product._id,
        name: product.name,
        price: Number(product.price),
        image: product.images?.[0] || "",
        codAvailable: product.codAvailable !== false,
      },
      quantity
    );

    if (user) {
      navigate("/checkout");
    } else {
      navigate("/login", { state: { from: "/checkout" } });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="h-6 w-32 bg-gray-200 rounded mb-6 animate-pulse"></div>
        <div className="grid md:grid-cols-2 gap-10 bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="w-full h-[450px] bg-gray-200 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded w-full"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <p className="text-red-600 mb-4">{error || "Product not found."}</p>
        <Link to="/" className="text-blue-600 font-medium">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const image =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/600x600?text=No+Image";

  return (
    <div className="p-6">
      <Link
        to="/"
        className="text-blue-600 mb-5 inline-block"
      >
        ← Back to Home
      </Link>

      <div className="grid md:grid-cols-2 gap-10 bg-white p-6 rounded-lg shadow">
        {/* Image */}
        <div>
          <img
            src={image}
            alt={product.name}
            className="w-full h-[500px] object-contain rounded-lg border"
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            {product.name}
          </h1>

          <p className="text-gray-600 mb-4">
            Category: {product.category}
          </p>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl font-bold">
              ₹{product.price}
            </span>

            {product.originalPrice && (
              <span className="text-xl text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          <p className="text-gray-700 mb-6">
            {product.description}
          </p>

          <p
            className={`mb-4 font-semibold ${
              product.stock > 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {product.stock > 0
              ? `In Stock (${product.stock})`
              : "Out of Stock"}
          </p>

          {/* Quantity */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() =>
                setQuantity((q) => Math.max(1, q - 1))
              }
              className="px-3 py-1 bg-gray-200 rounded"
            >
              -
            </button>

            <span>{quantity}</span>

            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              +
            </button>
          </div>

          {successMsg && (
            <p className="text-green-600 font-medium text-sm mb-3">
              ✓ {successMsg}
            </p>
          )}

          <div className="flex gap-4 items-center">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              Add to Cart
            </button>

            <button
              onClick={() => addToWishlist(product)}
              className="w-14 h-14 border rounded-lg flex items-center justify-center text-2xl hover:bg-red-50 transition"
              aria-label="Wishlist"
            >
              {isInWishlist(product._id) ? "❤️" : "🤍"}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            Related Products
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <Link
                key={p._id}
                to={`/product/${p._id}`}
              >
                <div className="bg-white rounded-lg shadow p-3 hover:shadow-md transition">
                  <img
                    src={
                      p.images?.[0] ||
                      "https://via.placeholder.com/300"
                    }
                    loading="lazy"
                    decoding="async"
                    className="w-full h-40 object-contain"
                    alt={p.name}
                  />

                  <h3 className="font-medium mt-2 line-clamp-1">{p.name}</h3>

                  <p className="text-blue-600 font-bold mt-1">
                    ₹{p.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;