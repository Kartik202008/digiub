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
                (p) => p.category === data.category && p._id !== data._id
              )
              .slice(0, 4);

            setRelatedProducts(related);
          });
      })
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) {
    return <div className="p-6">Loading...</div>;
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

          {/* Rating display only */}
          <div className="mb-5">
            <span className="text-yellow-500 text-2xl">
              {"★".repeat(Math.round(product.rating || 0))}
              {"☆".repeat(5 - Math.round(product.rating || 0))}
            </span>

            <p>
              {product.rating ? product.rating.toFixed(1) : 0}/5 (
              {product.numReviews} reviews)
            </p>
          </div>

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

          <div className="flex gap-4">
            <button
              onClick={() =>
                addToCart({
                  ...product,
                  quantity,
                })
              }
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg"
            >
              Add to Cart
            </button>

            <button className="flex-1 bg-orange-500 text-white py-3 rounded-lg">
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
                <div className="bg-white rounded-lg shadow p-3">
                  <img
                    src={
                      p.images?.[0] ||
                      "https://via.placeholder.com/300"
                    }
                    className="w-full h-40 object-contain"
                    alt={p.name}
                  />

                  <h3 className="font-medium">{p.name}</h3>

                  <p className="text-blue-600 font-bold">
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