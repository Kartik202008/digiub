import { useEffect, useMemo, useState } from "react";
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

const filteredProducts = useMemo(() => {
const query = search.trim().toLowerCase();

return products
  .filter((product) =>
    selectedCategory === "All Products"
      ? true
      : product.category === selectedCategory
  )
  .filter((product) => {
    if (!query) return true;

    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  });

}, [products, search, selectedCategory]);

return ( <div className="bg-gray-100 min-h-screen">
{/* Banner Section */} <div className="bg-blue-600 text-white py-10 text-center"> <h1 className="text-4xl font-bold">Big Electronics Sale</h1> <p className="mt-2 text-lg">
Up to 50% off on Mobile Accessories, Processors, Pendrives & more </p> </div>

```
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
      placeholder="Search products, categories, or descriptions..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Featured Products */}
  <div className="max-w-7xl mx-auto px-4 py-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-800">
        Featured Products
      </h2>
      <p className="text-sm text-gray-600">
        {filteredProducts.length} product
        {filteredProducts.length !== 1 ? "s" : ""} found
      </p>
    </div>

    {filteredProducts.length === 0 ? (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
        No products found for "{search}"
      </div>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    )}
  </div>
</div>
);
}

export default Home;
