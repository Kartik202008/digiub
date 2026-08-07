import { useState } from "react";

function AddProduct() {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
    description: "",
    stock: "",
  });

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
     e.preventDefault();
     
    const productData = {
  name: product.name,
  description: product.description,
  category: product.category,
  price: Number(product.price),
  stock: Number(product.stock),
  images: [product.image], // image ko array bana diya
};
   

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Product added successfully!");
        setProduct({
          name: "",
          price: "",
          category: "",
          image: "",
          description: "",
          stock: "",
        });
      } else {
        alert(data.message || "Failed to add product");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Add Product</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Product Name" value={product.name} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="price" placeholder="Price" value={product.price} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="category" placeholder="Category" value={product.category} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="image" placeholder="Image URL" value={product.image} onChange={handleChange} className="w-full border p-2 rounded" />
          <textarea name="description" placeholder="Description" value={product.description} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="stock" placeholder="Stock" value={product.stock} onChange={handleChange} className="w-full border p-2 rounded" />

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;