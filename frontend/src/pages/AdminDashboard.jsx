import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        DigiHub Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Add Product */}
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

        {/* Manage Products */}
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

        {/* Manage Orders */}
        <Link
          to="/admin/orders"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-red-600">
            Manage Orders
          </h2>
          <p className="text-gray-600 mt-2">
            View and update customer orders.
          </p>
        </Link>

        {/* Back to Store */}
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