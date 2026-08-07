import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        DigiHub Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Link
          to="/admin/add-product"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-blue-600">
            Add Product
          </h2>
          <p className="text-gray-600 mt-2">
            Add new products to DigiHub.
          </p>
        </Link>

        <Link
          to="/admin/products"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-green-600">
            Manage Products
          </h2>
          <p className="text-gray-600 mt-2">
            Edit or delete existing products.
          </p>
        </Link>

        <Link
          to="/"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-purple-600">
            Back to Store
          </h2>
          <p className="text-gray-600 mt-2">
            Return to the customer website.
          </p>
        </Link>

      </div>
    </div>
  );
}

export default AdminDashboard;