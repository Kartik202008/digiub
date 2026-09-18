import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../api/products";

const categories = [
  "Mobile Accessories",
  "Intel Processors",
  "Pendrives",
  "Laptop Accessories",
  "Headphones/Earphones",
  "Smartwatches",
  "Chargers & Cables",
  "Speakers",
  "Power Banks",
];

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  const loadProducts = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts({ force });
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Unable to load products right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
    );
  }, [products, search]);

  const featuredProducts = filteredProducts.slice(0, 8);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Banner Section */}
      <div className="bg-blue-600 text-white py-10 text-center">
        <h1 className="text-4xl font-bold">Big Electronics Sale</h1>
        <p className="mt-2 text-lg">
          Up to 50% off on Mobile Accessories, Processors, Pendrives & more
        </p>
      </div>

      {/* Category Dropdown */}
      <div className="max-w-7xl mx-auto px-4 py-6 relative">
        <button
          onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
          className="flex items-center gap-2 bg-white shadow px-6 py-3 rounded-lg font-medium text-gray-800 hover:shadow-lg transition"
        >
          Categories
          <span className={`transition-transform ${categoryMenuOpen ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>

        {categoryMenuOpen && (
          <div className="absolute z-20 mt-2 bg-white shadow-lg rounded-lg w-full md:w-80 overflow-hidden">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/category/${encodeURIComponent(cat)}`}
                onClick={() => setCategoryMenuOpen(false)}
                className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition border-b last:border-b-0"
              >
                {cat}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <input
          type="text"
          placeholder="Search products, categories, or descriptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Featured Products</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-lg shadow p-4 animate-pulse flex flex-col justify-between"
              >
                <div className="w-full h-48 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium mb-3">{error}</p>
            <button
              onClick={() => loadProducts(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-medium"
            >
              Retry
            </button>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
            No products found for "{search}"
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;