import { useEffect, useState } from 'react';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?._id || user?.id;

    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(`https://digihub-backend-o00g.onrender.com/api/orders/my-orders/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(
        `https://digihub-backend-o00g.onrender.com/api/orders/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      if (res.ok) {
        fetchOrders();
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating order status');
    }
  };

  const cancelOrder = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      updateOrderStatus(orderId, 'Cancelled');
    }
  };

  const returnOrder = (orderId) => {
    if (window.confirm('Do you want to request a return for this order?')) {
      updateOrderStatus(orderId, 'Return Requested');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">Order ID: {order._id}</h2>
              <p>
                Status:{' '}
                <span
                  className={`font-medium ${
                    order.orderStatus === 'Cancelled'
                      ? 'text-red-600'
                      : order.orderStatus === 'Return Requested'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}
                >
                  {order.orderStatus}
                </span>
              </p>
              <p>Total Amount: ₹{(order.totalPrice || 0).toFixed(2)}</p>
              <p>Placed On: {new Date(order.createdAt).toLocaleDateString()}</p>
              <div className="mt-4 flex gap-3">
                {(order.orderStatus === 'Placed' ||
                  order.orderStatus === 'Processing') && (
                  <button
                    onClick={() => cancelOrder(order._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  >
                    Cancel Order
                  </button>
                )}

                {order.orderStatus === 'Delivered' && (
                  <button
                    onClick={() => returnOrder(order._id)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition ml-3"
                  >
                    Request Return
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;