import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`https://digihub-backend-o00g.onrender.com/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);

        fetch("https://digihub-backend-o00g.onrender.com/api/products")
          .then((res) => res.json())
          .then((allProducts) => {
            const related = allProducts
              .filter(
                (p) =>
                  p.category === data.category && p._id !== data._id
              )
              .slice(0, 4);

            setRelatedProducts(related);
          });
      })
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const image =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/600x600?text=No+Image";

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Link
        to="/"
        className="text-blue-600 hover:underline mb-6 inline-block"
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
            <span className="text-4xl font-bold text-gray-900">
              ₹{product.price}
            </span>

            {product.originalPrice && (
              <span className="text-xl text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}

            {product.discount > 0 && (
              <span className="text-green-600 font-semibold">
                {product.discount}% OFF
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
              ? `In Stock (${product.stock} available)`
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

            <span className="text-lg font-semibold">
              {quantity}
            </span>

            <button
              onClick={() =>
                setQuantity((q) => q + 1)
              }
              className="px-3 py-1 bg-gray-200 rounded"
            >
              +
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() =>
                addToCart({ ...product, quantity })
              }
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Add to Cart
            </button>

            <button className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition font-medium">
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
              <Link key={p._id} to={`/product/${p._id}`}>
                <div className="bg-white rounded-lg shadow p-3 hover:shadow-lg transition">
                  <img
                    src={
                      p.images && p.images.length > 0
                        ? p.images[0]
                        : "https://via.placeholder.com/300x300?text=No+Image"
                    }
                    alt={p.name}
                    className="w-full h-40 object-contain mb-3"
                  />
                  <h3 className="font-medium text-gray-800 line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-blue-600 font-bold mt-2">
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