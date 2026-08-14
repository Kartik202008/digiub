import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);

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

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id || user?.id;

  const afterCoupon = Math.max(0, cartTotal - discount);
  const walletUsedAmount = useWallet ? Math.min(walletBalance, afterCoupon) : 0;
  const finalTotal = Math.max(0, afterCoupon - walletUsedAmount);

  const codBlocked = cartItems.some((item) => item.codAvailable === false);

  useEffect(() => {
    if (!userId) return;
    fetch(`https://digihub-backend-o00g.onrender.com/api/wallet/${userId}`)
      .then((res) => res.json())
      .then((data) => setWalletBalance(data.balance || 0))
      .catch((err) => console.error(err));
  }, [userId]);

  useEffect(() => {
    if (codBlocked && paymentMethod === 'COD') {
      setPaymentMethod('UPI');
    }
  }, [codBlocked, paymentMethod]);

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

  const deductWalletIfUsed = async () => {
    if (walletUsedAmount > 0) {
      try {
        await fetch("https://digihub-backend-o00g.onrender.com/api/wallet/deduct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, amount: walletUsedAmount }),
        });
      } catch (error) {
        console.error("Wallet deduction failed:", error);
      }
    }
  };

  const saveOrderAndRedirect = async (paymentStatus) => {
    try {
      const token = localStorage.getItem("token");

      const orderData = {
        user: userId,
        orderItems: cartItems.map((item) => ({
          product: item.product || item._id || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image || (item.images && item.images.length > 0 ? item.images[0] : ""),
        })),
        shippingAddress: address,
        paymentMethod: finalTotal === 0 ? 'Wallet' : paymentMethod,
        voucherApplied: discount > 0,
        itemsPrice: cartTotal,
        discountAmount: discount,
        totalPrice: Math.max(0, afterCoupon - walletUsedAmount),
        isPaid: paymentStatus === "paid" || finalTotal === 0,
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

      if (!res.ok) {
        console.error("Order creation failed:", order);
        alert(order.message || "Failed to save order. Please try again.");
        return;
      }

      await deductWalletIfUsed();

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

      const options = {
        key: 'rzp_test_TMoOw1DIh7h8IR',
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'DigiHub',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async function () {
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

    if (finalTotal === 0) {
      // Fully paid via wallet
      await saveOrderAndRedirect('paid');
    } else if (paymentMethod === "COD") {
      if (codBlocked) {
        alert("COD is not available for one or more items in your cart.");
        return;
      }
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

          {finalTotal > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Payment Method</h2>

              {codBlocked && (
                <p className="text-sm text-red-600 mb-3">
                  Cash on Delivery is not available for one or more items in your cart.
                </p>
              )}

              <div className="space-y-2">
                {['UPI', 'Card', 'NetBanking', 'COD'].map((method) => {
                  const isCodDisabled = method === 'COD' && codBlocked;
                  return (
                    <label
                      key={method}
                      className={`flex items-center gap-2 ${
                        isCodDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={isCodDisabled}
                      />
                      <span className="text-gray-700">
                        {method === 'COD' ? 'Cash on Delivery' : method}
                        {isCodDisabled && ' (Not available for this order)'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
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

          {walletBalance > 0 && (
            <div className="mt-4 border rounded-md p-3 bg-blue-50">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">
                  Use Wallet Balance (₹{walletBalance} available)
                </span>
                <input
                  type="checkbox"
                  checked={useWallet}
                  onChange={(e) => setUseWallet(e.target.checked)}
                />
              </label>
              {useWallet && (
                <p className="text-xs text-green-700 mt-1">
                  ₹{walletUsedAmount} will be used from your wallet
                </p>
              )}
            </div>
          )}

          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Discount</span>
              <span>-₹{discount}</span>
            </div>
            {useWallet && walletUsedAmount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Wallet Used</span>
                <span>-₹{walletUsedAmount}</span>
              </div>
            )}
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
            {loading ? 'Processing...' : finalTotal === 0 ? 'Place Order (Paid by Wallet)' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Checkout;