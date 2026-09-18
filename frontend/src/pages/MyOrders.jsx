import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/config';

function MyOrders() {
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
const { user } = useAuth();

const fetchOrders = () => {
const userId = user?._id || user?.id;

if (!userId) {
  setLoading(false);
  return;
}

fetch(`${API_BASE_URL}/api/orders/my-orders/${userId}`)
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
}, [user]);

const updateOrderStatus = async (orderId, status) => {
try {
const res = await fetch(
`${API_BASE_URL}/api/orders/${orderId}/status`,
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

const getStep = (status) => {
switch (status) {
case 'Placed':
return 1;
case 'Processing':
return 2;
case 'Shipped':
return 3;
case 'Delivered':
return 4;
default:
return 0;
}
};

return ( <div className="p-6"> <h1 className="text-3xl font-bold mb-6">My Orders</h1>

```
  {loading ? (
    <p className="text-gray-600">Loading orders...</p>
  ) : orders.length === 0 ? (
    <p className="text-gray-600">No orders found.</p>
  ) : (
    <div className="space-y-6">
      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white rounded-xl shadow-md border p-5"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-semibold text-gray-800">
                Order ID: {order._id}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Placed On: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">
                ₹{(order.totalPrice || 0).toFixed(2)}
              </p>
              <p
                className={`font-medium mt-1 ${
                  order.orderStatus === 'Cancelled'
                    ? 'text-red-600'
                    : order.orderStatus === 'Return Requested'
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}
              >
                {order.orderStatus}
              </p>
            </div>
          </div>

          {!['Cancelled', 'Return Requested'].includes(order.orderStatus) && (
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs text-gray-600">
                {['Placed', 'Processing', 'Shipped', 'Delivered'].map((step, index) => {
                  const active = getStep(order.orderStatus) >= index + 1;

                  return (
                    <div key={step} className="flex-1 text-center">
                      <div
                        className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-white ${
                          active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <p className="mt-2">{step}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-green-500 rounded-full transition-all duration-500"
                  style={{
                    width:
                      getStep(order.orderStatus) === 1
                        ? '10%'
                        : getStep(order.orderStatus) === 2
                        ? '40%'
                        : getStep(order.orderStatus) === 3
                        ? '70%'
                        : getStep(order.orderStatus) === 4
                        ? '100%'
                        : '0%',
                  }}
                />
              </div>
            </div>
          )}

          {order.orderStatus === 'Cancelled' && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
              This order has been cancelled.
            </div>
          )}

          {order.orderStatus === 'Return Requested' && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200">
              Return request submitted. Waiting for admin approval.
            </div>
          )}

                    <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to={`/track-order/${order._id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Track Order
            </Link>

            {(order.orderStatus === 'Placed' ||
              order.orderStatus === 'Processing') && (
              <button
                onClick={() => cancelOrder(order._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Cancel Order
              </button>
            )}

            {order.orderStatus === 'Delivered' && (
              <button
                onClick={() => returnOrder(order._id)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
              >
                Request Return
              </button>
            )}

            {order.orderStatus === 'Return Requested' && (
              <button
                disabled
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg cursor-not-allowed"
              >
                Return Requested
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
