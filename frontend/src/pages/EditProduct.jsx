import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "Mobile Accessories",
    price: "",
    stock: "",
    image: "",
    codAvailable: true,
  });

  useEffect(() => {
    fetch(`https://digihub-backend-o00g.onrender.com/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct({
          name: data.name || "",
          description: data.description || "",
          category: data.category || "Mobile Accessories",
          price: data.price || "",
          stock: data.stock || "",
          image: data.images?.[0] || "",
          codAvailable: data.codAvailable !== undefined ? data.codAvailable : true,
        });
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({ ...product, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      name: product.name,
      description: product.description,
      category: product.category,
      price: Number(product.price),
      stock: Number(product.stock),
      images: [product.image],
      codAvailable: product.codAvailable,
    };

    const token = localStorage.getItem("token");

    const res = await fetch(`https://digihub-backend-o00g.onrender.com/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    if (res.ok) {
      alert("Product updated successfully!");
      navigate("/admin/products");
    } else {
      alert("Error updating product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={product.name} onChange={handleChange} placeholder="Product Name" className="w-full border p-2 rounded" />

          <textarea name="description" value={product.description} onChange={handleChange} placeholder="Description" className="w-full border p-2 rounded" />

          <select name="category" value={product.category} onChange={handleChange} className="w-full border p-2 rounded">
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

          <input name="price" value={product.price} onChange={handleChange} placeholder="Price" className="w-full border p-2 rounded" />

          <input name="stock" value={product.stock} onChange={handleChange} placeholder="Stock" className="w-full border p-2 rounded" />

          <input name="image" value={product.image} onChange={handleChange} placeholder="Image URL" className="w-full border p-2 rounded" />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="codAvailable"
              checked={product.codAvailable}
              onChange={handleChange}
            />
            <span className="text-gray-700">Cash on Delivery Available</span>
          </label>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;