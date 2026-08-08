import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

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
  const [search, setSearch] = useState("");
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  useEffect(() => {
    fetch("https://digihub-backend-o00g.onrender.com/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
  }, [products, search]);

  const featuredProducts = filteredProducts.slice(0, 4);

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

        {featuredProducts.length === 0 ? (
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