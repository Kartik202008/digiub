import { useLocation, Link } from 'react-router-dom';

function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          No order found.
        </h2>
        <Link to="/" className="text-blue-600 underline">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-green-600 text-6xl mb-4">✓</div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Order Placed Successfully!
        </h1>

        <p className="text-gray-600 mb-6">
          Order ID: #{order._id ? order._id.slice(-6) : order.id}
        </p>

        <div className="text-left bg-gray-50 rounded-md p-4 mb-6">
          <h3 className="font-medium text-gray-800 mb-2">
            Delivery to:
          </h3>

          <p className="text-gray-600 text-sm">
            {order.shippingAddress?.fullName},
            {" "}
            {order.shippingAddress?.street},
            {" "}
            {order.shippingAddress?.city},
            {" "}
            {order.shippingAddress?.state}
            {" - "}
            {order.shippingAddress?.pincode}
          </p>

          <p className="text-gray-600 text-sm mt-2">
            Payment: {order.paymentMethod}
          </p>

          <p className="font-bold text-gray-900 mt-2">
            Total: ₹{order.totalPrice}
          </p>
        </div>

        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default OrderConfirmation;