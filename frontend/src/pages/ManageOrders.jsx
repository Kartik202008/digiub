import { useEffect, useState } from "react";

function ManageOrders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        "https://digihub-backend-o00g.onrender.com/api/orders"
      );
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await fetch(
        `https://digihub-backend-o00g.onrender.com/api/orders/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const refundToWallet = async (order) => {
    try {
      await fetch(
        'https://digihub-backend-o00g.onrender.com/api/wallet/refund',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: order.user,
            amount: order.totalPrice,
            orderId: order._id,
          }),
        }
      );

      alert('Refund added to customer wallet successfully!');
    } catch (err) {
      console.error(err);
      alert('Refund failed');
    }
  };

  const acceptReturn = async (order) => {
    await updateStatus(order._id, "Returned");
    await refundToWallet(order);
  };

  const declineReturn = async (order) => {
    await updateStatus(order._id, "Return Declined");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow p-4 border"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-bold">
                    {order.shippingAddress?.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-blue-600">
                    ₹{order.totalPrice}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                {order.orderItems.map((item, index) => (
                  <p key={index} className="text-sm">
                    {item.name} × {item.quantity}
                  </p>
                ))}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-medium">Status:</span>

                <select
                  value={order.orderStatus}
                  onChange={(e) =>
                    updateStatus(order._id, e.target.value)
                  }
                  className="border rounded px-3 py-1"
                >
                  <option>Placed</option>
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                  <option>Return Requested</option>
                  <option>Returned</option>
                  <option>Return Declined</option>
                </select>

                {order.orderStatus === 'Cancelled' && order.user && (
                  <button
                    onClick={() => refundToWallet(order)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Refund to Wallet
                  </button>
                )}

                {order.orderStatus === 'Return Requested' && (
                  <>
                    <button
                      onClick={() => acceptReturn(order)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Accept Return
                    </button>
                    <button
                      onClick={() => declineReturn(order)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Decline Return
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageOrders;