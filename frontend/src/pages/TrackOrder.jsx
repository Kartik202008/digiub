import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function TrackOrder() {
const { id } = useParams();
const [order, setOrder] = useState(null);

useEffect(() => {
const user = JSON.parse(localStorage.getItem('user'));
const userId = user?._id || user?.id;

if (!userId) return;

fetch(`https://digihub-backend-o00g.onrender.com/api/orders/my-orders/${userId}`)
  .then((res) => res.json())
  .then((data) => {
    const found = Array.isArray(data)
      ? data.find((o) => o._id === id)
      : null;
    setOrder(found || null);
  })
  .catch((err) => console.error(err));

}, [id]);

if (!order) {
return ( <div className="p-6 text-center"> <p className="text-gray-600">Loading order tracking...</p> </div>
);
}

const steps = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

const currentStep =
order.orderStatus === 'Placed'
? 1
: order.orderStatus === 'Processing'
? 2
: order.orderStatus === 'Shipped'
? 3
: order.orderStatus === 'Out for Delivery'
? 4
: order.orderStatus === 'Delivered'
? 5
: 0;

const progress =
currentStep === 1
? '10%'
: currentStep === 2
? '35%'
: currentStep === 3
? '60%'
: currentStep === 4
? '85%'
: currentStep === 5
? '100%'
: '0%';

return ( <div className="p-6 max-w-3xl mx-auto"> <Link to="/my-orders" className="text-blue-600 hover:underline">
← Back to My Orders </Link>

  <div className="bg-white rounded-2xl shadow-lg p-6 mt-4 border">
    <h1 className="text-3xl font-bold text-gray-800 mb-2">Track Order</h1>
    <p className="text-gray-600">Order #{order._id.slice(-6)}</p>
    <p className="text-gray-500 text-sm mt-1">
      Placed on {new Date(order.createdAt).toLocaleString()}
    </p>

    <div className="mt-8">
      <div className="relative h-3 bg-gray-200 rounded-full">
        <div
          className="absolute left-0 top-0 h-3 bg-green-500 rounded-full transition-all duration-700"
          style={{ width: progress }}
        />
        <div
          className="absolute -top-3 text-2xl transition-all duration-700"
          style={{ left: progress }}
        >
          🚚
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {steps.map((step, index) => {
          const active = currentStep >= index + 1;
          const current = currentStep === index + 1;

          return (
            <div key={step} className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  active ? 'bg-green-500' : 'bg-gray-300'
                } ${current ? 'animate-pulse' : ''}`}
              >
                {index + 1}
              </div>

              <div>
                <h3 className={`font-semibold ${active ? 'text-green-700' : 'text-gray-500'}`}>
                  {step}
                </h3>
                <p className="text-sm text-gray-500">
                  {active ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm text-gray-500">Estimated delivery</p>
        <p className="font-bold text-blue-700 text-lg">11 Aug 2026</p>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm text-gray-500">Current location</p>
        <p className="font-bold text-blue-700 text-lg">Jaipur Distribution Center</p>
      </div>
    </div>

    <div className="mt-6 p-4 rounded-xl bg-gray-50 border">
      <p className="text-sm text-gray-500">Latest update</p>
      <p className="font-medium text-gray-800 mt-1">
        {order.orderStatus === 'Placed'
          ? 'Your order has been placed successfully.'
          : order.orderStatus === 'Processing'
          ? 'Your order is being prepared for shipment.'
          : order.orderStatus === 'Shipped'
          ? 'Your package has been dispatched from the warehouse.'
          : order.orderStatus === 'Out for Delivery'
          ? 'Your package is out for delivery.'
          : order.orderStatus === 'Delivered'
          ? 'Your package has been delivered successfully.'
          : order.orderStatus}
      </p>
    </div>
  </div>
</div>

);
}

export default TrackOrder;
