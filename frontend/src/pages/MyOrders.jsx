import { useEffect, useState } from 'react';

function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user?._id) return;

    fetch(
      `https://digihub-backend-o00g.onrender.com/api/orders/my-orders/${user._id}`
    )
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">You have no orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow p-4 border"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-bold">Order #{order._id.slice(-6)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-blue-600">
                    ₹{order.totalPrice}
                  </p>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
