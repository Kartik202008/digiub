import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  const finalTotal = Math.max(0, cartTotal - discount);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const applyCoupon = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://digihub-backend-o00g.onrender.com/api/coupon/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await res.json();

      if (data.success) {
        setDiscount(data.discount);
        setCouponMessage("Coupon applied successfully!");
      } else {
        setCouponMessage(data.message);
      }
    } catch (err) {
      setCouponMessage("Something went wrong");
    }
  };

  const saveOrderAndRedirect = async (paymentStatus) => {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const orderData = {
      user: user?._id,
      orderItems: cartItems.map((item) => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.images && item.images.length > 0 ? item.images[0] : "",
      })),
      shippingAddress: address,
      paymentMethod,
      voucherApplied: discount > 0,
      itemsPrice: cartTotal,
      discountAmount: discount,
      totalPrice: finalTotal,
      isPaid: paymentStatus === "paid",
      orderStatus: "Placed",
    };

    const res = await fetch(
      "https://digihub-backend-o00g.onrender.com/api/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      }
    );

    const order = await res.json();

    clearCart();
    navigate("/order-confirmation", { state: { order } });
  } catch (error) {
    console.error(error);
    alert("Failed to save order. Please try again.");
  }
};
  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('https://digihub-backend-o00g.onrender.com/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: finalTotal }),
      });

      const razorpayOrder = await response.json();
console.log('Razorpay order response:', razorpayOrder);

      const options = {
        key: 'rzp_test_TMoOw1DIh7h8IR',
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'DigiHub',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async function (response) {
  await saveOrderAndRedirect('paid');
},
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      alert('Payment initialization failed. Please try again.');
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
  e.preventDefault();

  if (paymentMethod === "COD") {
    await saveOrderAndRedirect("cod");
  } else {
    handleRazorpayPayment();
  }
};

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 text-lg">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Delivery Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="fullName"
                value={address.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                name="phone"
                value={address.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                name="street"
                value={address.street}
                onChange={handleChange}
                placeholder="Street Address"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                required
              />
              <input
                name="city"
                value={address.city}
                onChange={handleChange}
                placeholder="City"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                name="state"
                value={address.state}
                onChange={handleChange}
                placeholder="State"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                name="pincode"
                value={address.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Payment Method</h2>
            <div className="space-y-2">
              {['UPI', 'Card', 'NetBanking', 'COD'].map((method) => (
                <label key={method} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="text-gray-700">
                    {method === 'COD' ? 'Cash on Delivery' : method}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{item.name} x{item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}

          <div style={{ marginTop: "15px" }}>
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />

            <button
              type="button"
              onClick={applyCoupon}
              style={{
                width: "100%",
                padding: "10px",
                background: "#2874f0",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              Apply Coupon
            </button>

            {couponMessage && (
              <p style={{ color: "green", fontSize: "14px" }}>
                {couponMessage}
              </p>
            )}
          </div>

          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Discount</span>
              <span>-₹{discount}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-lg mt-1">
              <span>Total</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Checkout;