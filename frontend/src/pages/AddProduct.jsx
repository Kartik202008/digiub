import { useState } from "react";
import { API_BASE_URL } from "../api/config";
import { invalidateProductCache } from "../api/products";

function AddProduct() {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    image: "",
    description: "",
    stock: "",
    codAvailable: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({ ...product, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const price = Number(product.price);
    const originalPrice = Number(product.originalPrice);

    if (originalPrice && price >= originalPrice) {
      alert("Discounted price must be less than original price");
      return;
    }

    const discount = originalPrice
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

    const productData = {
      name: product.name.trim(),
      price,
      originalPrice: originalPrice || undefined,
      discount,
      category: product.category,
      images: [product.image.trim()],
      description: product.description.trim(),
      stock: Number(product.stock),
      codAvailable: product.codAvailable,
    };

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (res.ok) {
        invalidateProductCache();
        alert("Product added successfully!");
        setProduct({
          name: "",
          price: "",
          originalPrice: "",
          category: "",
          image: "",
          description: "",
          stock: "",
          codAvailable: true,
        });
      } else {
        console.log("FULL ERROR DATA:", data);
        alert(JSON.stringify(data));
      }
    } catch (err) {
      console.log("CATCH ERROR:", err);
      alert("Server error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Add Product</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Product Name" value={product.name} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="originalPrice" placeholder="Original Price (MRP)" value={product.originalPrice} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="price" placeholder="Selling Price" value={product.price} onChange={handleChange} className="w-full border p-2 rounded" />

          <select
            name="category"
            value={product.category}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Category</option>
            <option value="Mobile Accessories">Mobile Accessories</option>
            <option value="Intel Processors">Intel Processors</option>
            <option value="Pendrives">Pendrives</option>
            <option value="Laptop Accessories">Laptop Accessories</option>
            <option value="Headphones/Earphones">Headphones/Earphones</option>
            <option value="Smartwatches">Smartwatches</option>
            <option value="Chargers & Cables">Chargers & Cables</option>
            <option value="Speakers">Speakers</option>
            <option value="Power Banks">Power Banks</option>
          </select>

          <input name="image" placeholder="Image URL" value={product.image} onChange={handleChange} className="w-full border p-2 rounded" />
          <textarea name="description" placeholder="Description" value={product.description} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="stock" placeholder="Stock" value={product.stock} onChange={handleChange} className="w-full border p-2 rounded" />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="codAvailable"
              checked={product.codAvailable}
              onChange={handleChange}
            />
            <span className="text-gray-700">Cash on Delivery Available</span>
          </label>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;