import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, fetchCart, updateQuantity, removeItem, loading } = useCart();
  const [busyItemId, setBusyItemId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const lineTotal = (item) => {
    const extra = item.customization?.extraShot ? 150 : 0;
    return (item.unitPrice + extra) * item.quantity;
  };

  const cartTotal = cart.items.reduce((sum, item) => sum + lineTotal(item), 0);

  const handleQuantityChange = async (itemId, quantity) => {
    if (quantity < 1) return;
    setBusyItemId(itemId);
    try {
      await updateQuantity(itemId, quantity);
    } finally {
      setBusyItemId(null);
    }
  };

  const handleRemove = async (itemId) => {
    setBusyItemId(itemId);
    try {
      await removeItem(itemId);
    } finally {
      setBusyItemId(null);
    }
  };

  if (loading && cart.items.length === 0) {
    return <p className="text-center py-24 text-coffee-400">Loading your cart…</p>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-24">
        <h1 className="text-2xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-coffee-500 mb-6">Add a few favorites from the menu to get started.</p>
        <Link to="/menu" className="btn-primary">Browse the Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={item._id} className="card flex gap-4 p-4 items-center">
            <img src={item.image} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-contain p-1.5 bg-white rounded-xl flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-coffee-800 text-sm sm:text-base truncate">{item.name}</h3>
              <p className="text-xs text-coffee-500 capitalize">Size: {item.size}</p>
              <p className="text-[11px] text-coffee-500 truncate">
                {item.customization?.milk}, {item.customization?.sugarLevel}
                {item.customization?.extraShot ? ', Extra Shot' : ''}
              </p>
              <p className="text-accent-500 font-semibold text-sm mt-1">Rs. {lineTotal(item).toFixed(0)}</p>
            </div>

            <div className="flex flex-col items-end justify-center gap-2">
              <div className="flex items-center border border-coffee-200 rounded-full bg-white">
                <button
                  onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                  disabled={busyItemId === item._id}
                  className="w-7 h-7 flex items-center justify-center text-sm font-bold"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-6 text-center text-xs">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                  disabled={busyItemId === item._id}
                  className="w-7 h-7 flex items-center justify-center text-sm font-bold"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => handleRemove(item._id)}
                disabled={busyItemId === item._id}
                className="text-xs text-red-650 hover:underline font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 mt-8 flex items-center justify-between">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-2xl font-bold text-coffee-800">Rs. {cartTotal.toFixed(0)}</span>
      </div>

      <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-4 !py-3">
        Proceed to Checkout
      </button>
    </div>
  );
}
