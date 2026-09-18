import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../api/config';

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isWelcomeCouponApplied, setIsWelcomeCouponApplied] = useState(false);
  const [isEligibleForWelcome, setIsEligibleForWelcome] = useState(false);

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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);

  const userId = user?._id || user?.id;

  const validateField = (name, value) => {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    switch (name) {
      case 'fullName':
        if (!trimmed) return 'Full Name is required.';
        if (trimmed.length < 2) return 'Full Name must be at least 2 characters.';
        return '';
      case 'phone':
        if (!trimmed) return 'Phone number is required.';
        if (!/^[6-9]\d{9}$/.test(trimmed)) {
          return 'Enter a valid 10-digit phone number.';
        }
        return '';
      case 'street':
        if (!trimmed) return 'Street address is required.';
        if (trimmed.length < 3) return 'Street address must be at least 3 characters.';
        return '';
      case 'city':
        if (!trimmed) return 'City is required.';
        if (trimmed.length < 2) return 'City must be at least 2 characters.';
        return '';
      case 'state':
        if (!trimmed) return 'State is required.';
        if (trimmed.length < 2) return 'State must be at least 2 characters.';
        return '';
      case 'pincode':
        if (!trimmed) return 'PIN code is required.';
        if (!/^[1-9]\d{5}$/.test(trimmed)) {
          return 'Enter a valid 6-digit PIN code.';
        }
        return '';
      default:
        return '';
    }
  };

  const validateAll = (addressData) => {
    const newErrors = {};
    ['fullName', 'phone', 'street', 'city', 'state', 'pincode'].forEach((field) => {
      const err = validateField(field, addressData[field]);
      if (err) newErrors[field] = err;
    });
    return newErrors;
  };

  // Protect route if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' }, replace: true });
    }
  }, [user, navigate]);

  // Check first-time user eligibility for DIGI500 welcome coupon
  useEffect(() => {
    if (!user || !token) {
      setIsEligibleForWelcome(false);
      setIsWelcomeCouponApplied(false);
      return;
    }

    const isEligibleLocal = !user.voucherUsed && (!user.orderCount || user.orderCount === 0);

    if (isEligibleLocal) {
      fetch(`${API_BASE_URL}/api/coupon/eligibility`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.eligible) {
            setIsEligibleForWelcome(true);
            setCouponCode("DIGI500");
            setIsWelcomeCouponApplied(true);
            setCouponMessage("🎉 Welcome Offer: ₹500 discount with DIGI500 automatically applied!");
            setCouponError("");
          } else {
            setIsEligibleForWelcome(false);
            setIsWelcomeCouponApplied(false);
            setDiscount(0);
            if (couponCode === "DIGI500") {
              setCouponCode("");
            }
          }
        })
        .catch(() => {
          setIsEligibleForWelcome(false);
        });
    } else {
      setIsEligibleForWelcome(false);
      setIsWelcomeCouponApplied(false);
      setDiscount(0);
      if (couponCode === "DIGI500") {
        setCouponCode("");
      }
    }
  }, [user, token]);

  // Recalculate discount if cartTotal changes (e.g. cart subtotal < 500)
  useEffect(() => {
    if (isWelcomeCouponApplied || couponCode.trim().toUpperCase() === "DIGI500") {
      if (cartTotal > 0) {
        setDiscount(Math.min(cartTotal, 500));
      } else {
        setDiscount(0);
      }
    }
  }, [cartTotal, isWelcomeCouponApplied, couponCode]);

  const afterCoupon = Math.max(0, cartTotal - discount);
  const walletUsedAmount = useWallet ? Math.min(walletBalance, afterCoupon) : 0;
  const finalTotal = Math.max(0, afterCoupon - walletUsedAmount);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE_URL}/api/wallet/${userId}`)
      .then((res) => res.json())
      .then((data) => setWalletBalance(data.balance || 0))
      .catch((err) => console.error(err));
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const applyCoupon = async (codeOverride) => {
    setCouponError("");
    setCouponMessage("");

    const rawCode = typeof codeOverride === 'string' ? codeOverride : couponCode;
    const codeToApply = rawCode.trim().toUpperCase();
    if (!codeToApply) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/coupon/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: codeToApply }),
      });

      const data = await res.json();

      if (data.success) {
        const calculatedDiscount = Math.min(cartTotal, data.discount);
        setDiscount(calculatedDiscount);
        setCouponMessage(data.message || "Coupon applied successfully!");
        setCouponError("");
        if (codeToApply === "DIGI500" || codeToApply === "DIGIHUB500") {
          setIsWelcomeCouponApplied(true);
        }
      } else {
        setDiscount(0);
        setIsWelcomeCouponApplied(false);
        setCouponError(data.message || "Invalid coupon code");
      }
    } catch (err) {
      setCouponError("Something went wrong applying coupon");
    }
  };

  const deductWalletIfUsed = async () => {
    if (walletUsedAmount > 0) {
      try {
        await fetch(`${API_BASE_URL}/api/wallet/deduct`, {
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
      const trimmedAddress = {
        fullName: address.fullName.trim(),
        phone: address.phone.trim(),
        street: address.street.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
      };

      const orderData = {
        user: userId,
        orderItems: cartItems.map((item) => ({
          product: item.product || item._id || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image || (item.images && item.images.length > 0 ? item.images[0] : ""),
        })),
        shippingAddress: trimmedAddress,
        paymentMethod: finalTotal === 0 ? 'Wallet' : paymentMethod,
        voucherApplied: discount > 0,
        itemsPrice: cartTotal,
        discountAmount: discount,
        totalPrice: Math.max(0, afterCoupon - walletUsedAmount),
        isPaid: paymentStatus === "paid" || finalTotal === 0,
        orderStatus: "Placed",
      };

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const order = await res.json();

      if (!res.ok) {
        console.error("Order creation failed:", order);
        alert(order.message || "Failed to save order. Please try again.");
        return;
      }

      await deductWalletIfUsed();

      // Update user auth state so welcome coupon cannot be reused
      if (discount > 0 && isWelcomeCouponApplied) {
        updateUser({ voucherUsed: true, orderCount: (user.orderCount || 0) + 1 });
      } else {
        updateUser({ orderCount: (user.orderCount || 0) + 1 });
      }

      // Backend cart sync cleanup
      if (token) {
        fetch(`${API_BASE_URL}/api/cart`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }

      // Clear frontend cart immediately upon confirmed order
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
      const response = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
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
          name: address.fullName.trim(),
          contact: address.phone.trim(),
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

    // Validate all shipping address fields before placing order
    const fieldErrors = validateAll(address);
    setTouched({
      fullName: true,
      phone: true,
      street: true,
      city: true,
      state: true,
      pincode: true,
    });
    setErrors(fieldErrors);

    const errorFields = Object.keys(fieldErrors);
    if (errorFields.length > 0) {
      const firstInvalidField = document.querySelector(`[name="${errorFields[0]}"]`);
      if (firstInvalidField) {
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (finalTotal === 0) {
      // Fully paid via wallet
      await saveOrderAndRedirect('paid');
    } else if (paymentMethod === 'COD') {
      await saveOrderAndRedirect('pending');
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

      <form onSubmit={handlePlaceOrder} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Delivery Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={address.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter full name"
                  className={`w-full border rounded-md px-4 py-2 focus:outline-none transition ${
                    touched.fullName && errors.fullName
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {touched.fullName && errors.fullName && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.fullName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={address.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="10-digit mobile number"
                  className={`w-full border rounded-md px-4 py-2 focus:outline-none transition ${
                    touched.phone && errors.phone
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {touched.phone && errors.phone && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.phone}</p>
                )}
              </div>

              {/* Street Address */}
              <div className="md:col-span-2">
                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="street"
                  name="street"
                  type="text"
                  value={address.street}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="House / Flat / Street address"
                  className={`w-full border rounded-md px-4 py-2 focus:outline-none transition ${
                    touched.street && errors.street
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {touched.street && errors.street && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.street}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={address.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="City"
                  className={`w-full border rounded-md px-4 py-2 focus:outline-none transition ${
                    touched.city && errors.city
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {touched.city && errors.city && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.city}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={address.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="State"
                  className={`w-full border rounded-md px-4 py-2 focus:outline-none transition ${
                    touched.state && errors.state
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {touched.state && errors.state && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.state}</p>
                )}
              </div>

              {/* PIN Code */}
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                  PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={address.pincode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="6-digit PIN code"
                  className={`w-full border rounded-md px-4 py-2 focus:outline-none transition ${
                    touched.pincode && errors.pincode
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {touched.pincode && errors.pincode && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.pincode}</p>
                )}
              </div>
            </div>
          </div>

          {finalTotal > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Payment Method</h2>

              <div className="space-y-3">
                {['UPI', 'Card', 'NetBanking', 'COD'].map((method) => {
                  return (
                    <label
                      key={method}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="text-gray-700 font-medium">
                        {method === 'Card'
                          ? 'Credit / Debit Card'
                          : method === 'COD'
                          ? 'Cash on Delivery'
                          : method}
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

          <div className="mt-4 border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Have a Coupon?
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={applyCoupon}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
              >
                Apply
              </button>
            </div>

            {/* Available Welcome Coupon Section */}
            {isEligibleForWelcome && (
              <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <span>🎁</span> Welcome Coupon
                  </span>
                  {isWelcomeCouponApplied ? (
                    <span className="inline-flex items-center text-[11px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      ✓ Applied
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCouponCode("DIGI500");
                        applyCoupon("DIGI500");
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Apply
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎁</span>
                    <span className="text-sm font-bold text-gray-900 tracking-wide font-mono bg-white px-2 py-0.5 border border-dashed border-amber-300 rounded">
                      DIGI500
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-amber-900">
                    ₹500 OFF on your first order
                  </span>
                </div>
              </div>
            )}

            {couponMessage && (
              <p className="text-green-600 text-xs mt-2 font-medium">
                ✓ {couponMessage}
              </p>
            )}
            {couponError && (
              <p className="text-red-600 text-xs mt-2 font-medium">
                ✗ {couponError}
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