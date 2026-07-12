import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: '',
    line1: user?.address?.line1 || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const lineTotal = (item) => {
    const extra = item.customization?.extraShot ? 150 : 0;
    return (item.unitPrice + extra) * item.quantity;
  };
  const cartTotal = cart.items.reduce((sum, item) => sum + lineTotal(item), 0);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      const payload = { deliveryAddress: form, paymentMethod };
      // For guests, send cart items directly in request body
      if (!user) {
        payload.items = cart.items;
      }
      const { data: order } = await api.post('/orders', payload);
      await clearCart();
      // Guests go to a simple confirmation page, logged-in users go to profile
      navigate(`/order-confirmation?orderId=${order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-coffee-500">Your cart is empty. Add some coffee before checking out.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-2 gap-10">
      {/* Delivery form */}
      <form onSubmit={handlePlaceOrder} className="space-y-4">
        <h1 className="text-2xl font-bold mb-2">Delivery Details</h1>

        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input name="phone" value={form.phone} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address Line</label>
          <input name="line1" value={form.line1} onChange={handleChange} required className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input name="city" value={form.city} onChange={handleChange} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input name="state" value={form.state} onChange={handleChange} required className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Postal Code</label>
            <input name="postalCode" value={form.postalCode} onChange={handleChange} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input name="country" value={form.country} onChange={handleChange} required className="input-field" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payment Method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field">
            <option>Cash on Delivery</option>
            <option>Card</option>
            <option>UPI</option>
          </select>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" disabled={placing} className="btn-primary w-full !py-3 mt-4">
          {placing ? 'Placing order…' : `Place Order · Rs. ${cartTotal.toFixed(0)}`}
        </button>
      </form>

      {/* Order summary */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
        <div className="card divide-y divide-coffee-100">
          {cart.items.map((item) => (
            <div key={item._id} className="flex items-center gap-3 p-4">
              <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
              <div className="flex-1">
                <p className="font-medium text-coffee-800">{item.name} × {item.quantity}</p>
                <p className="text-xs text-coffee-500 capitalize">{item.size}</p>
              </div>
              <span className="font-semibold">Rs. {lineTotal(item).toFixed(0)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4 text-lg font-bold">
          <span>Total</span>
          <span>Rs. {cartTotal.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}
