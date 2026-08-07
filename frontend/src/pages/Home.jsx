import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");

  useEffect(() => {
    fetch("https://digihub-backend-o00g.onrender.com/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  return (
    <div>
      {/* Banner Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Big Electronics Sale
        </h1>
        <p className="text-blue-100">
          Up to 50% off on Mobile Accessories, Processors, Pendrives & more
        </p>
      </div>

      {/* Category Quick Links */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            "All Products",
            "Mobile Accessories",
            "Intel Processors",
            "Pendrives",
            "Laptop Accessories",
          ].map((cat) => (
            <div
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg shadow p-4 text-center font-medium cursor-pointer transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:shadow-lg"
              }`}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Featured Products
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products
            .filter((product) =>
              product.name.toLowerCase().includes(search.toLowerCase())
            )
            .filter((product) =>
              selectedCategory === "All Products"
                ? true
                : product.category === selectedCategory
            )
            .map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
        </div>
      </div>
    </div>
  );
}

export default Home;